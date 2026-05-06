const fs = require('fs');
const path = require('path');

class MarkdownReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
  }

  onRunComplete(contexts, results) {
    let md = `# E2E Test Execution Report\n\n`;
    md += `**Execution Date:** ${new Date().toUTCString()}\n\n`;
    
    // --- 1. SUMMARY SECTION ---
    md += `## 📊 Test Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Total Test Suites** | ${results.numTotalTestSuites} |\n`;
    md += `| **Passed Suites** | ${results.numPassedTestSuites} ✅ |\n`;
    md += `| **Failed Suites** | ${results.numFailedTestSuites} ❌ |\n`;
    md += `| **Total Test Cases** | ${results.numTotalTests} |\n`;
    md += `| **Passed Cases** | ${results.numPassedTests} ✅ |\n`;
    md += `| **Failed Cases** | ${results.numFailedTests} ❌ |\n`;
    md += `| **Duration** | ${((Date.now() - results.startTime) / 1000).toFixed(2)} seconds |\n\n`;

    md += `---\n\n`;

    // --- 2. DETAILED TEST SUITES & CASES  ---
    md += `## 🔍 Detailed Test Report\n\n`;

    results.testResults.forEach((suite) => {
      const suiteName = path.relative(process.cwd(), suite.testFilePath);
      const suiteStatus = suite.numFailingTests > 0 ? '❌ FAILED' : '✅ PASSED';
      const suiteTime = ((suite.perfStats.end - suite.perfStats.start) / 1000).toFixed(2);

      md += `### 📁 File: \`${suiteName}\`\n`;
      md += `* **Status:** **${suiteStatus}**\n`;
      md += `* **Duration:** ${suiteTime}s\n`;
      md += `* **Summary:** ${suite.numPassingTests} passed, ${suite.numFailingTests} failed, ${suite.testResults.length} total\n\n`;

      md += `| Module | Endpoint / Context | Test Case | Status | Duration |\n`;
      md += `| :--- | :--- | :--- | :---: | :--- |\n`;

      suite.testResults.forEach((testCase) => {
        const ancestors = testCase.ancestorTitles;

        const moduleName = ancestors[0] || 'Root';

        const endpointContext = ancestors.slice(1).join(' ➔ ') || '-';
        
        const testTitle = testCase.title;
        const statusIcon = testCase.status === 'passed' ? '🟩 PASS' : '🟥 FAIL';
        const duration = testCase.duration ? `${testCase.duration}ms` : '-';

        const safeModuleName = moduleName.replace(/\|/g, '\\|');
        const safeEndpointContext = endpointContext.replace(/\|/g, '\\|');
        const safeTestTitle = testTitle.replace(/\|/g, '\\|');

        md += `| ${safeModuleName} | \`${safeEndpointContext}\` | ${safeTestTitle} | ${statusIcon} | ${duration} |\n`;
      });

      md += `\n`;

      const failedTests = suite.testResults.filter(t => t.status === 'failed');
      if (failedTests.length > 0) {
        md += `#### ❌ Error Details:\n\n`;
        failedTests.forEach((testCase) => {
          const fullTitle = [...testCase.ancestorTitles, testCase.title].join(' ➔ ');
          if (testCase.failureMessages.length > 0) {
            const cleanErrorMsg = testCase.failureMessages
              .join('\n')
              .replace(/\u001b\[[0-9;]*m/g, '');

            md += `<details>\n<summary><b>${fullTitle}</b></summary>\n\n\`\`\`bash\n${cleanErrorMsg}\n\`\`\`\n\n</details>\n\n`;
          }
        });
      }

      md += `\n---\n\n`;
    });

    const outputPath = this.options.outputPath || './test-report.md';
    fs.writeFileSync(path.resolve(outputPath), md, 'utf-8');
    console.log(`\n📝 Test report successfully saved to: ${outputPath}\n`);
  }
}

module.exports = MarkdownReporter;