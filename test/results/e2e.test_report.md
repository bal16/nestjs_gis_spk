# E2E Test Execution Report

**Execution Date:** Sat, 25 Jul 2026 05:18:34 GMT

## 📊 Test Summary

| Metric | Value |
| :--- | :--- |
| **Total Test Suites** | 4 |
| **Passed Suites** | 4 ✅ |
| **Failed Suites** | 0 ❌ |
| **Total Test Cases** | 48 |
| **Passed Cases** | 48 ✅ |
| **Failed Cases** | 0 ❌ |
| **Duration** | 4.81 seconds |

---

## 🔍 Detailed Test Report

### 📁 File: `test/auth.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 2.52s
* **Summary:** 12 passed, 0 failed, 12 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| AuthModule | `POST /auth/register` | should reject invalid payload (400) | 🟩 PASS | 112ms |
| AuthModule | `POST /auth/register` | should register a new user and return 201 | 🟩 PASS | 80ms |
| AuthModule | `POST /auth/register` | should not register a user with an existing email and return 400 | 🟩 PASS | 198ms |
| AuthModule | `POST /auth/login` | should reject invalid payload (400) | 🟩 PASS | 70ms |
| AuthModule | `POST /auth/login` | should not log in with invalid credentials and return 401 | 🟩 PASS | 140ms |
| AuthModule | `POST /auth/login` | should log in a user and return tokens | 🟩 PASS | 137ms |
| AuthModule | `GET /auth/me` | should reject unauthenticated requests | 🟩 PASS | 132ms |
| AuthModule | `GET /auth/me` | should get user profile | 🟩 PASS | 134ms |
| AuthModule | `POST /auth/refresh` | should reject unauthenticated requests | 🟩 PASS | 129ms |
| AuthModule | `POST /auth/refresh` | should refresh tokens | 🟩 PASS | 134ms |
| AuthModule | `DELETE /auth/session` | should reject unauthenticated requests | 🟩 PASS | 136ms |
| AuthModule | `DELETE /auth/session` | should log out user | 🟩 PASS | 129ms |


---

### 📁 File: `test/dss.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 0.82s
* **Summary:** 18 passed, 0 failed, 18 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| DssModule | `/dss ➔ GET /dss/weights` | should reject unauthenticated requests | 🟩 PASS | 10ms |
| DssModule | `/dss ➔ GET /dss/weights` | should retrieve weights | 🟩 PASS | 10ms |
| DssModule | `/dss ➔ PUT /dss/weights` | should reject unauthenticated requests | 🟩 PASS | 3ms |
| DssModule | `/dss ➔ PUT /dss/weights` | should reject invalid payload (total weights sum !== 1.0) with 400 | 🟩 PASS | 3ms |
| DssModule | `/dss ➔ PUT /dss/weights` | should update weights | 🟩 PASS | 20ms |
| DssModule | `/dss ➔ POST /dss/calculate` | should reject unauthenticated requests | 🟩 PASS | 3ms |
| DssModule | `/dss ➔ POST /dss/calculate` | should calculate and save results | 🟩 PASS | 15ms |
| DssModule | `/dss ➔ GET /dss/runs` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ GET /dss/runs` | should retrieve all runs | 🟩 PASS | 7ms |
| DssModule | `/dss ➔ GET /dss/runs/latest & GET /dss/runs/lastest` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ GET /dss/runs/latest & GET /dss/runs/lastest` | should retrieve the latest run via primary endpoint /dss/runs/latest | 🟩 PASS | 15ms |
| DssModule | `/dss ➔ GET /dss/runs/latest & GET /dss/runs/lastest` | should retrieve the latest run via deprecated alias endpoint /dss/runs/lastest | 🟩 PASS | 6ms |
| DssModule | `/dss ➔ GET /dss/runs/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ GET /dss/runs/:id` | should retrieve run by id | 🟩 PASS | 7ms |
| DssModule | `/dss ➔ DELETE /dss/runs/details/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ DELETE /dss/runs/details/:id` | should delete a run detail | 🟩 PASS | 5ms |
| DssModule | `/dss ➔ DELETE /dss/runs/:id` | should reject unauthenticated requests | 🟩 PASS | 3ms |
| DssModule | `/dss ➔ DELETE /dss/runs/:id` | should delete a run | 🟩 PASS | 5ms |


---

### 📁 File: `test/building.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 0.73s
* **Summary:** 17 passed, 0 failed, 17 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| BuildingModule | `/buildings ➔ POST /buildings` | should reject unauthenticated requests | 🟩 PASS | 11ms |
| BuildingModule | `/buildings ➔ POST /buildings` | should reject invalid payload (400) | 🟩 PASS | 3ms |
| BuildingModule | `/buildings ➔ POST /buildings` | should create a new building | 🟩 PASS | 6ms |
| BuildingModule | `/buildings ➔ GET /buildings` | should retrieve all buildings | 🟩 PASS | 17ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:id` | should update the building | 🟩 PASS | 6ms |
| BuildingModule | `/buildings ➔ POST /buildings/:code/assessments` | should reject unauthenticated requests | 🟩 PASS | 5ms |
| BuildingModule | `/buildings ➔ POST /buildings/:code/assessments` | should reject invalid payload (400) | 🟩 PASS | 5ms |
| BuildingModule | `/buildings ➔ POST /buildings/:code/assessments` | should create an assessment | 🟩 PASS | 9ms |
| BuildingModule | `/buildings ➔ GET /buildings/:code/assessments` | should reject unauthenticated requests | 🟩 PASS | 4ms |
| BuildingModule | `/buildings ➔ GET /buildings/:code/assessments` | should retrieve assessments for a building | 🟩 PASS | 8ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:code/assessments/:assessmentId` | should reject unauthenticated requests | 🟩 PASS | 3ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:code/assessments/:assessmentId` | should update an assessment | 🟩 PASS | 7ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/assessments/:assessmentId` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/assessments/:assessmentId` | should delete an assessment | 🟩 PASS | 4ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/:id` | should delete the building | 🟩 PASS | 5ms |


---

### 📁 File: `test/app.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 0.49s
* **Summary:** 1 passed, 0 failed, 1 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| App (e2e) | `-` | / (GET) | 🟩 PASS | 89ms |


---

