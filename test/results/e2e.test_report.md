# E2E Test Execution Report

**Execution Date:** Wed, 11 Nov 2026 03:00:13 GMT

## 📊 Test Summary

| Metric | Value |
| :--- | :--- |
| **Total Test Suites** | 5 |
| **Passed Suites** | 5 ✅ |
| **Failed Suites** | 0 ❌ |
| **Total Test Cases** | 67 |
| **Passed Cases** | 67 ✅ |
| **Failed Cases** | 0 ❌ |
| **Duration** | 8.70 seconds |

---

## 🔍 Detailed Test Report

### 📁 File: `test/invitation.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 3.76s
* **Summary:** 11 passed, 0 failed, 11 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| InvitationModule (e2e) | `POST /invitations` | should reject unauthenticated requests (401) | 🟩 PASS | 420ms |
| InvitationModule (e2e) | `POST /invitations` | should reject non-admin users with 403 Forbidden | 🟩 PASS | 270ms |
| InvitationModule (e2e) | `POST /invitations` | should allow admin to create an invitation token (201) | 🟩 PASS | 252ms |
| InvitationModule (e2e) | `GET /invitations` | should reject unauthenticated requests (401) | 🟩 PASS | 248ms |
| InvitationModule (e2e) | `GET /invitations` | should reject non-admin users (403) | 🟩 PASS | 260ms |
| InvitationModule (e2e) | `GET /invitations` | should allow admin to retrieve all invitations (200) | 🟩 PASS | 258ms |
| InvitationModule (e2e) | `GET /invitations/validate/:token` | should validate a valid invitation token publicly (200) | 🟩 PASS | 248ms |
| InvitationModule (e2e) | `GET /invitations/validate/:token` | should return 404 for a non-existent token | 🟩 PASS | 256ms |
| InvitationModule (e2e) | `GET /invitations/validate/:token` | should return 400 for an expired token | 🟩 PASS | 252ms |
| InvitationModule (e2e) | `DELETE /invitations/:id` | should reject non-admin users (403) | 🟩 PASS | 254ms |
| InvitationModule (e2e) | `DELETE /invitations/:id` | should allow admin to delete an invitation token (200) | 🟩 PASS | 257ms |


---

### 📁 File: `test/auth.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 2.84s
* **Summary:** 20 passed, 0 failed, 20 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| AuthModule | `POST /auth/register` | should reject invalid payload (400) | 🟩 PASS | 73ms |
| AuthModule | `POST /auth/register` | should register a new user and return 201 | 🟩 PASS | 73ms |
| AuthModule | `POST /auth/register` | should not register a user with an existing email and return 400 | 🟩 PASS | 197ms |
| AuthModule | `POST /auth/register` | should reject registration without invitation token (400) | 🟩 PASS | 6ms |
| AuthModule | `POST /auth/register` | should reject registration with invalid invitation token (400) | 🟩 PASS | 7ms |
| AuthModule | `POST /auth/register` | should reject registration with expired invitation token (400) | 🟩 PASS | 7ms |
| AuthModule | `POST /auth/register` | should reject registration when token is restricted to another email (400) | 🟩 PASS | 7ms |
| AuthModule | `POST /auth/login` | should reject invalid payload (400) | 🟩 PASS | 68ms |
| AuthModule | `POST /auth/login` | should not log in with invalid credentials and return 401 | 🟩 PASS | 123ms |
| AuthModule | `POST /auth/login` | should log in a user and return tokens | 🟩 PASS | 134ms |
| AuthModule | `GET /auth/me` | should reject unauthenticated requests | 🟩 PASS | 140ms |
| AuthModule | `GET /auth/me` | should get user profile | 🟩 PASS | 136ms |
| AuthModule | `POST /auth/refresh` | should reject unauthenticated requests | 🟩 PASS | 134ms |
| AuthModule | `POST /auth/refresh` | should refresh tokens | 🟩 PASS | 143ms |
| AuthModule | `DELETE /auth/session` | should reject unauthenticated requests | 🟩 PASS | 133ms |
| AuthModule | `DELETE /auth/session` | should log out user | 🟩 PASS | 136ms |
| AuthModule | `POST /auth/change-password` | should reject unauthenticated request (401) | 🟩 PASS | 130ms |
| AuthModule | `POST /auth/change-password` | should reject change password if old password does not match (400) | 🟩 PASS | 195ms |
| AuthModule | `POST /auth/change-password` | should reject change password if new password is identical to old password (400) | 🟩 PASS | 188ms |
| AuthModule | `POST /auth/change-password` | should change password successfully and allow login with new password | 🟩 PASS | 360ms |


---

### 📁 File: `test/dss.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 0.71s
* **Summary:** 18 passed, 0 failed, 18 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| DssModule | `/dss ➔ GET /dss/weights` | should reject unauthenticated requests | 🟩 PASS | 10ms |
| DssModule | `/dss ➔ GET /dss/weights` | should retrieve weights | 🟩 PASS | 8ms |
| DssModule | `/dss ➔ PUT /dss/weights` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ PUT /dss/weights` | should reject invalid payload (total weights sum !== 1.0) with 400 | 🟩 PASS | 3ms |
| DssModule | `/dss ➔ PUT /dss/weights` | should update weights | 🟩 PASS | 16ms |
| DssModule | `/dss ➔ POST /dss/calculate` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ POST /dss/calculate` | should calculate and save results | 🟩 PASS | 19ms |
| DssModule | `/dss ➔ GET /dss/runs` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ GET /dss/runs` | should retrieve all runs | 🟩 PASS | 6ms |
| DssModule | `/dss ➔ GET /dss/runs/latest & GET /dss/runs/lastest` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ GET /dss/runs/latest & GET /dss/runs/lastest` | should retrieve the latest run via primary endpoint /dss/runs/latest | 🟩 PASS | 15ms |
| DssModule | `/dss ➔ GET /dss/runs/latest & GET /dss/runs/lastest` | should retrieve the latest run via deprecated alias endpoint /dss/runs/lastest | 🟩 PASS | 7ms |
| DssModule | `/dss ➔ GET /dss/runs/:id` | should reject unauthenticated requests | 🟩 PASS | 3ms |
| DssModule | `/dss ➔ GET /dss/runs/:id` | should retrieve run by id | 🟩 PASS | 7ms |
| DssModule | `/dss ➔ DELETE /dss/runs/details/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ DELETE /dss/runs/details/:id` | should delete a run detail | 🟩 PASS | 3ms |
| DssModule | `/dss ➔ DELETE /dss/runs/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| DssModule | `/dss ➔ DELETE /dss/runs/:id` | should delete a run | 🟩 PASS | 9ms |


---

### 📁 File: `test/building.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 0.73s
* **Summary:** 17 passed, 0 failed, 17 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| BuildingModule | `/buildings ➔ POST /buildings` | should reject unauthenticated requests | 🟩 PASS | 11ms |
| BuildingModule | `/buildings ➔ POST /buildings` | should reject invalid payload (400) | 🟩 PASS | 4ms |
| BuildingModule | `/buildings ➔ POST /buildings` | should create a new building | 🟩 PASS | 6ms |
| BuildingModule | `/buildings ➔ GET /buildings` | should retrieve all buildings | 🟩 PASS | 23ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:id` | should update the building | 🟩 PASS | 5ms |
| BuildingModule | `/buildings ➔ POST /buildings/:code/assessments` | should reject unauthenticated requests | 🟩 PASS | 3ms |
| BuildingModule | `/buildings ➔ POST /buildings/:code/assessments` | should reject invalid payload (400) | 🟩 PASS | 8ms |
| BuildingModule | `/buildings ➔ POST /buildings/:code/assessments` | should create an assessment | 🟩 PASS | 6ms |
| BuildingModule | `/buildings ➔ GET /buildings/:code/assessments` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ GET /buildings/:code/assessments` | should retrieve assessments for a building | 🟩 PASS | 6ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:code/assessments/:assessmentId` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ PUT /buildings/:code/assessments/:assessmentId` | should update an assessment | 🟩 PASS | 6ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/assessments/:assessmentId` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/assessments/:assessmentId` | should delete an assessment | 🟩 PASS | 5ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/:id` | should reject unauthenticated requests | 🟩 PASS | 2ms |
| BuildingModule | `/buildings ➔ DELETE /buildings/:id` | should delete the building | 🟩 PASS | 4ms |


---

### 📁 File: `test/app.e2e-spec.ts`
* **Status:** **✅ PASSED**
* **Duration:** 0.45s
* **Summary:** 1 passed, 0 failed, 1 total

| Module | Endpoint / Context | Test Case | Status | Duration |
| :--- | :--- | :--- | :---: | :--- |
| App (e2e) | `-` | / (GET) | 🟩 PASS | 99ms |


---

