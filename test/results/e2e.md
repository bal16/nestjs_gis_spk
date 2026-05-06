
> be@0.0.1 test:e2e /mnt/d/Bal/Collage/Skripsi/code/be
> NODE_OPTIONS=--experimental-vm-modules jest --config ./test/jest-e2e.json --runInBand

(node:130249) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
PASS test/auth.e2e-spec.ts
PASS test/dss.e2e-spec.ts
PASS test/building.e2e-spec.ts
PASS test/app.e2e-spec.ts

Test Suites: 4 passed, 4 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        4.132 s
Ran all test suites.
Jest did not exit one second after the test run has completed.

'This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
