# API Reference — DSS Building Maintenance (FT UNNES)

**Version:** 1.3.0  
**Standard:** RESTful  
**Base URL:** `http://localhost:3001`  
**Format:** JSON  
**Spec:** [OpenApi.yaml](./OpenApi.yaml)

---

## Table of Contents

1. [Global Standards](#1-global-standards)
2. [Authentication](#2-authentication)
   - [POST /auth/register](#post-authregister)
   - [POST /auth/login](#post-authlogin)
   - [POST /auth/refresh](#post-authrefresh)
   - [GET /auth/me](#get-authme)
   - [DELETE /auth/session](#delete-authsession)
3. [Buildings](#3-buildings)
   - [GET /buildings](#get-buildings)
   - [POST /buildings](#post-buildings)
   - [PUT /buildings/:id](#put-buildingsid)
   - [DELETE /buildings/:id](#delete-buildingsid)
4. [Assessments](#4-assessments)
   - [GET /buildings/:code/assessments](#get-buildingscodeassessments)
   - [POST /buildings/:code/assessments](#post-buildingscodeassessments)
   - [PUT /buildings/:code/assessments/:assessmentId](#put-buildingscodeassessmentsassessmentid)
   - [DELETE /buildings/assessments/:assessmentId](#delete-buildingsassessmentsassessmentid)
5. [DSS Engine](#5-dss-engine)
   - [GET /dss/weights](#get-dssweights)
   - [PUT /dss/weights](#put-dssweights)
   - [POST /dss/calculate](#post-dsscalculate)
   - [GET /dss/runs](#get-dssruns)
   - [GET /dss/runs/latest](#get-dssrunslatest)
   - [GET /dss/runs/lastest (Deprecated)](#get-dssrunslastest-deprecated)
   - [GET /dss/runs/:id](#get-dssrunsid)
   - [DELETE /dss/runs/:id](#delete-dssrunsid)
   - [DELETE /dss/runs/details/:id](#delete-dssrunsdetailsid)
6. [Data Models](#6-data-models)
7. [Error Reference](#7-error-reference)

---

## 1. Global Standards

### 1.1 Response Envelope

Every API response follows this envelope structure. Raw arrays or naked objects are never returned.

**Success Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation Error",
  "error": "Bad Request"
}
```

> **Note:** The `message` field may be a `string` or `string[]` for validation errors from NestJS `ValidationPipe`.

### 1.2 Data Conventions

| Convention | Detail |
|---|---|
| **Date/Time** | ISO 8601 format — `YYYY-MM-DDTHH:mm:ssZ` |
| **Coordinates** | Decimal degrees (`Float`) |
| **IDs** | CUID string format (e.g. `clxxxxxxxxxxxxxxxxxx`) |
| **Weights** | Float in range `[0.0, 1.0]`; must sum to exactly `1.0` |
| **Content-Type** | `application/json` for all requests |

### 1.3 Authentication Mechanism

| Type | Header |
|---|---|
| **Access Token** | `Authorization: Bearer <access_token>` |
| **Refresh Token** | `Authorization: Bearer <refresh_token>` (only for `/auth/refresh`) |

Access tokens are short-lived JWTs. Refresh tokens expire after **7 days** and are stored server-side.

### 1.4 SAW Criteria Summary

| Key | Name | Type | Description |
|---|---|---|---|
| `c1` | Usia Bangunan | **cost** | Age of building in years |
| `c2` | Kondisi Fisik | *parent* | Hierarchical — expanded via sub-weights |
| `c21` | Struktur | **benefit** | Structural condition (sub-weight of C2) |
| `c22` | Arsitektur | **benefit** | Architectural condition (sub-weight of C2) |
| `c23` | MEP | **benefit** | MEP condition (sub-weight of C2) |
| `c3` | Utilitas | **benefit** | Daily user count (bucketed: >500→3, ≥100→2, else→1) |
| `c4` | Kerusakan | **benefit** | Damage impact score |
| `c5` | Waktu Sejak Perawatan | **cost** | Years since last maintenance; equals age if never maintained |

> **Normalization rules:**
> - **Benefit:** `normalized = value / max_value`
> - **Cost:** `normalized = min_value / value`

---

## 2. Authentication

### POST /auth/register

Register a new user account.

> **Note:** New accounts are created with `isAdmin: false`. Admin promotion must be done directly in the database.

**Request:**

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "username": "admin_main",
  "email": "admin@ft.unnes.ac.id",
  "password": "StrongPass123"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `username` | string | ✅ | Non-empty string |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Alphanumeric only (`@IsAlphanumeric`) |
| `avatar` | string | ❌ | Optional avatar URL |

**Response — 201 Created:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "name": "admin_main",
    "email": "admin@ft.unnes.ac.id"
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `400` | Email already in use, or password contains non-alphanumeric characters |
| `500` | Unexpected registration error |

---

### POST /auth/login

Authenticate and obtain JWT tokens.

**Request:**

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@ft.unnes.ac.id",
  "password": "StrongPass123"
}
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "username": "admin_main",
    "isAdmin": false,
    "id": "clxxxxxxxxxxxxxxxxxx"
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Invalid email or password |

---

### POST /auth/refresh

Exchange a refresh token for a new token pair.

> **Important:** Send the **refresh token** (not access token) in the `Authorization` header. This endpoint uses a separate JWT strategy (`RefreshTokenGuard`) that validates against `JWT_REFRESH_SECRET`.

**Request:**

```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

_(No request body required)_

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGci_new...",
    "refreshToken": "eyJhbGci_new...",
    "username": "admin_main",
    "isAdmin": false,
    "id": "clxxxxxxxxxxxxxxxxxx"
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Refresh token is invalid, expired, or not stored in the DB |

---

### GET /auth/me

Get the current authenticated user's profile.

**Request:**

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "name": "admin_main",
    "email": "admin@ft.unnes.ac.id",
    "isAdmin": false
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Invalid or expired access token |

---

### DELETE /auth/session

Logout the current user by invalidating the stored refresh token.

**Request:**

```http
DELETE /auth/session
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": null
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Invalid or expired access token |

---

## 3. Buildings

> **Access:** `GET /buildings` is **public** (no token required). All other building endpoints require authentication.

### GET /buildings

List all buildings with their latest assessments and most recent SAW run detail.

**Request:**

```http
GET /buildings
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "clxxxxxxxxxxxxxxxxxx",
      "code": "E1",
      "name": "Gedung E1",
      "latitude": -7.050123,
      "longitude": 110.409876,
      "score": 0.875,
      "priority": 3,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-11-29T12:00:00Z",
      "assessments": [ { "..." } ],
      "sawRunDetails": [
        {
          "score": 0.875,
          "priority": 3,
          "detail": { "c1": 0.75, "c21": 0.60, "..." }
        }
      ]
    }
  ]
}
```

---

### POST /buildings

Create a new building.

**Request:**

```http
POST /buildings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "code": "E5",
  "name": "Gedung E5",
  "latitude": -7.0503,
  "longitude": 110.4094
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `code` | string | ✅ | Unique building code |
| `name` | string | ✅ | Max 20 characters |
| `latitude` | number | ✅ | Float (decimal degrees) |
| `longitude` | number | ✅ | Float (decimal degrees) |
| `score` | number | ❌ | Optional initial score |
| `priority` | integer | ❌ | Optional priority tier (1/2/3) |

**Response — 201 Created:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Building created successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "code": "E5",
    "name": "Gedung E5",
    "latitude": -7.0503,
    "longitude": 110.4094,
    "score": null,
    "priority": null,
    "createdAt": "2025-11-29T10:00:00Z",
    "updatedAt": "2025-11-29T10:00:00Z"
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `400` | Duplicate `code`, or validation errors |
| `401` | Unauthorized |

---

### PUT /buildings/:id

Update a building record. Looks up the building by **CUID** (`id` field).

**Request:**

```http
PUT /buildings/clxxxxxxxxxxxxxxxxxx
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "name": "Gedung E1 Revisi",
  "latitude": -7.050200,
  "longitude": 110.409900
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `code` | string | ❌ | Unique building code |
| `name` | string | ❌ | Max 20 characters |
| `latitude` | number | ❌ | Float |
| `longitude` | number | ❌ | Float |
| `score` | number | ❌ | Float |
| `priority` | integer | ❌ | 1 / 2 / 3 |

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Building updated successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "code": "E1",
    "name": "Gedung E1 Revisi",
    "latitude": -7.050200,
    "longitude": 110.409900,
    "score": 0.875,
    "priority": 3
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Unauthorized |
| `404` | Building not found |

---

### DELETE /buildings/:id

Permanently delete a building and all cascading records (assessments, SAW run details).

**Request:**

```http
DELETE /buildings/clxxxxxxxxxxxxxxxxxx
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Building deleted successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "code": "E1",
    "name": "Gedung E1"
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Unauthorized |
| `404` | Building not found |

---

## 4. Assessments

> All assessment endpoints require authentication.
> **Important:** Assessment endpoints use the building `code` field (e.g. `"E1"`), **not** the CUID `id`.

### GET /buildings/:code/assessments

Get a building (by code) with all its historical assessment records.

**Request:**

```http
GET /buildings/E1/assessments
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "code": "E1",
    "name": "Gedung E1",
    "latitude": -7.050123,
    "longitude": 110.409876,
    "score": 0.875,
    "priority": 3,
    "assessments": [
      {
        "id": "clxxxxxxxxxxxxxxxxxx",
        "buildingId": "clxxxxxxxxxxxxxxxxxx",
        "age": 15,
        "structure": 3,
        "architecture": 4,
        "mep": 2,
        "utility": 350,
        "damage": 4,
        "lastMaintenance": "2022-06-15T00:00:00Z",
        "createdAt": "2025-11-20T10:00:00Z",
        "updatedAt": "2025-11-20T10:00:00Z"
      }
    ]
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Unauthorized |

---

### POST /buildings/:code/assessments

Create a new assessment entry for a building (identified by code).

> A building can have **multiple assessment records** over time. The most recent one (by `createdAt` descending) is used in the SAW calculation.

**Request:**

```http
POST /buildings/E1/assessments
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "age": 15,
  "structure": 3,
  "architecture": 4,
  "mep": 2,
  "utility": 350,
  "damage": 4,
  "lastMaintenance": "2022-06-15T00:00:00Z"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `age` | integer | ✅ | C1 — Building age in years |
| `structure` | integer | ✅ | C21 — Structural condition score |
| `architecture` | integer | ✅ | C22 — Architectural condition score |
| `mep` | integer | ✅ | C23 — MEP condition score |
| `utility` | integer | ✅ | C3 — Number of daily users / utility count |
| `damage` | integer | ✅ | C4 — Damage impact score |
| `lastMaintenance` | string (ISO 8601) | ❌ | C5 input — date of last maintenance |

**Response — 201 Created:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Assessment created successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "buildingId": "clxxxxxxxxxxxxxxxxxx",
    "age": 15,
    "structure": 3,
    "architecture": 4,
    "mep": 2,
    "utility": 350,
    "damage": 4,
    "lastMaintenance": "2022-06-15T00:00:00Z",
    "createdAt": "2025-11-29T10:00:00Z",
    "updatedAt": "2025-11-29T10:00:00Z"
  }
}
```

---

### PUT /buildings/:code/assessments/:assessmentId

Update an existing assessment record. All fields are **optional** (partial update).

**Request:**

```http
PUT /buildings/E1/assessments/clxxxxxxxxxxxxxxxxxx
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "age": 16,
  "structure": 2,
  "lastMaintenance": "2023-01-10T00:00:00Z"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `age` | integer | ❌ | Building age |
| `structure` | integer | ❌ | Structural condition |
| `architecture` | integer | ❌ | Architectural condition |
| `mep` | integer | ❌ | MEP condition |
| `utility` | integer | ❌ | Daily user count |
| `damage` | integer | ❌ | Damage score |
| `lastMaintenance` | string (ISO 8601) | ❌ | Last maintenance date |

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Assessment updated successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "buildingId": "clxxxxxxxxxxxxxxxxxx",
    "age": 16,
    "structure": 2,
    "architecture": 4,
    "mep": 2,
    "utility": 350,
    "damage": 4,
    "lastMaintenance": "2023-01-10T00:00:00Z"
  }
}
```

---

### DELETE /buildings/assessments/:assessmentId

Permanently delete a specific assessment record.

**Request:**

```http
DELETE /buildings/assessments/clxxxxxxxxxxxxxxxxxx
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Assessment deleted successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx"
  }
}
```

---

## 5. DSS Engine

> All DSS Engine endpoints require authentication.

### GET /dss/weights

Retrieve the current SAW weight configuration.

Returns all **top-level** weight criteria, each with a `subWeights` array for hierarchical criteria (e.g. C2).

**Request:**

```http
GET /dss/weights
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": [
    {
      "key": "c1",
      "name": "Usia Bangunan",
      "type": "cost",
      "value": 0.20,
      "subWeightFrom": null,
      "subWeights": []
    },
    {
      "key": "c2",
      "name": "Kondisi Fisik",
      "type": "benefit",
      "value": 0.35,
      "subWeightFrom": null,
      "subWeights": [
        { "key": "c21", "name": "Struktur", "type": "benefit", "value": 0.30, "subWeightFrom": "c2" },
        { "key": "c22", "name": "Arsitektur", "type": "benefit", "value": 0.30, "subWeightFrom": "c2" },
        { "key": "c23", "name": "MEP", "type": "benefit", "value": 0.40, "subWeightFrom": "c2" }
      ]
    },
    { "key": "c3", "name": "Utilitas", "type": "benefit", "value": 0.20, "subWeights": [] },
    { "key": "c4", "name": "Kerusakan", "type": "benefit", "value": 0.15, "subWeights": [] },
    { "key": "c5", "name": "Perawatan Terakhir", "type": "cost", "value": 0.10, "subWeights": [] }
  ]
}
```

---

### PUT /dss/weights

Update the SAW weight configuration.

> **Validation rules (enforced server-side):**
> - Sum of all top-level `value` fields must equal **exactly 1.0** (tolerance: ±0.0001).
> - For any criterion with `subWeights`, the sum of sub-weight values must also equal **1.0**.

**Request:**

```http
PUT /dss/weights
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "weights": [
    { "key": "c1", "value": 0.20 },
    {
      "key": "c2",
      "value": 0.35,
      "subWeights": [
        { "key": "c21", "value": 0.30 },
        { "key": "c22", "value": 0.30 },
        { "key": "c23", "value": 0.40 }
      ]
    },
    { "key": "c3", "value": 0.20 },
    { "key": "c4", "value": 0.15 },
    { "key": "c5", "value": 0.10 }
  ]
}
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Weights updated successfully",
  "data": true
}
```

**Errors:**

| Status | Cause |
|---|---|
| `400` | Top-level weights do not sum to 1.0, or a sub-weight group does not sum to 1.0 |

**Error example:**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Total bobot kriteria harus 1.0 (Sekarang: 0.95)",
  "error": "Bad Request"
}
```

---

### POST /dss/calculate

Trigger the SAW calculation algorithm and save a snapshot.

**Calculation algorithm:**

1. **Fetch** current weight configuration (all `subWeightFrom: null` weights + their sub-weights).
2. **Expand** sub-weights: effective sub-weight = `parent_value × sub_value`.
3. **Fetch** all buildings with their most recent assessment.
4. **Map** criteria values:
   - `c1` = `assessment.age`
   - `c21` = `assessment.structure`
   - `c22` = `assessment.architecture`
   - `c23` = `assessment.mep`
   - `c3` = bucket(`assessment.utility`): `>500 → 3`, `≥100 → 2`, `else → 1`
   - `c4` = `assessment.damage`
   - `c5` = years since `lastMaintenance`; if null → `age`
5. **Normalize** using Min/Max:
   - Benefit: `val / max`
   - Cost: `min / val`
6. **Score** each building: `Σ (normalized × effective_weight)`.
7. **Assign priority tier:** `score > 0.8 → 3`, `score > 0.5 → 2`, else `1`.
8. **Save** a `SawRun` record with `SawRunDetail` per building.

**Request:**

```http
POST /dss/calculate
Authorization: Bearer <access_token>
```

_(No request body)_

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Calculation executed successfully",
  "data": true
}
```

**Errors:**

| Status | Cause |
|---|---|
| `400` | No buildings with assessments to process |
| `401` | Unauthorized |

---

### GET /dss/runs

Get all SAW calculation runs (ordered by most recent first).

Each run includes `sawRunDetails` with nested building data.

**Request:**

```http
GET /dss/runs
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "clxxxxxxxxxxxxxxxxxx",
      "date": "2025-11-29T12:00:00Z",
      "averageScore": 0.612,
      "totalBuildings": 15,
      "snapshotWeights": { "..." },
      "executedAt": "2025-11-29T12:00:00Z",
      "sawRunDetails": [
        {
          "id": "clxxxxxxxxxxxxxxxxxx",
          "score": 0.875,
          "priority": 3,
          "detail": { "c1": 0.75, "c21": 0.60, "c22": 0.80, "c23": 0.40, "c3": 1.00, "c4": 0.80, "c5": 0.90 },
          "building": { "code": "E1", "name": "Gedung E1" }
        }
      ]
    }
  ]
}
```

---

### GET /dss/runs/latest

Get only the **most recent** SAW run with full detail including building and assessment data.

**Request:**

```http
GET /dss/runs/latest
Authorization: Bearer <access_token>
```

**Response — 200 OK:** Same structure as a single `SawRun` object (see `/dss/runs/:id`).

---

### GET /dss/runs/lastest (Deprecated)

> ⚠️ **Deprecated Alias:** `/dss/runs/lastest` is maintained for backward compatibility. Please use `GET /dss/runs/latest` instead.

**Request:**

```http
GET /dss/runs/lastest
Authorization: Bearer <access_token>
```

**Response — 200 OK:** Identical to `/dss/runs/latest`.

---

### GET /dss/runs/:id

Get a specific SAW run by its CUID, including full `sawRunDetails` with associated `building` and `assessment` snapshots.

**Request:**

```http
GET /dss/runs/clxxxxxxxxxxxxxxxxxx
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxx",
    "date": "2025-11-29T12:00:00Z",
    "averageScore": 0.612,
    "totalBuildings": 15,
    "snapshotWeights": { "..." },
    "executedAt": "2025-11-29T12:00:00Z",
    "sawRunDetails": [
      {
        "id": "clxxxxxxxxxxxxxxxxxx",
        "sawRunId": "clxxxxxxxxxxxxxxxxxx",
        "buildingId": "clxxxxxxxxxxxxxxxxxx",
        "assessmentId": "clxxxxxxxxxxxxxxxxxx",
        "score": 0.875,
        "priority": 3,
        "detail": {
          "c1": 0.75,
          "c21": 0.60,
          "c22": 0.80,
          "c23": 0.40,
          "c3": 1.00,
          "c4": 0.80,
          "c5": 0.90
        },
        "building": {
          "id": "clxxxxxxxxxxxxxxxxxx",
          "code": "E1",
          "name": "Gedung E1",
          "latitude": -7.050123,
          "longitude": 110.409876
        },
        "assessment": {
          "id": "clxxxxxxxxxxxxxxxxxx",
          "age": 15,
          "structure": 3,
          "architecture": 4,
          "mep": 2,
          "utility": 350,
          "damage": 4,
          "lastMaintenance": "2022-06-15T00:00:00Z"
        }
      }
    ]
  }
}
```

**Errors:**

| Status | Cause |
|---|---|
| `401` | Unauthorized |
| `404` | Run not found |

---

### DELETE /dss/runs/:id

Permanently delete a SAW run and all cascading `SawRunDetail` records.

**Request:**

```http
DELETE /dss/runs/clxxxxxxxxxxxxxxxxxx
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Run deleted successfully",
  "data": true
}
```

---

### DELETE /dss/runs/details/:id

Permanently delete a single `SawRunDetail` record (individual building result within a run).

**Request:**

```http
DELETE /dss/runs/details/clxxxxxxxxxxxxxxxxxx
Authorization: Bearer <access_token>
```

**Response — 200 OK:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Run detail deleted successfully",
  "data": true
}
```

---

## 6. Data Models

### User

| Field | Type | Description |
|---|---|---|
| `id` | string (CUID) | Unique user identifier |
| `name` | string | Display name (unique) |
| `email` | string | Email address (unique) |
| `isAdmin` | boolean | Admin flag |
| `token` | string \| null | Stored refresh token |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Building

| Field | Type | Description |
|---|---|---|
| `id` | string (CUID) | Unique building identifier |
| `code` | string | Unique short code (e.g. `"E1"`) |
| `name` | string | Building name (max 20 chars) |
| `latitude` | Float | Decimal degree latitude |
| `longitude` | Float | Decimal degree longitude |
| `score` | Float \| null | Latest SAW score |
| `priority` | Integer \| null | Latest priority tier (1/2/3) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Assessment

| Field | Type | Description |
|---|---|---|
| `id` | string (CUID) | Unique assessment identifier |
| `buildingId` | string (CUID) | Foreign key to Building |
| `age` | Integer | C1 — Building age in years |
| `structure` | Integer | C21 — Structural condition |
| `architecture` | Integer | C22 — Architectural condition |
| `mep` | Integer | C23 — MEP condition |
| `utility` | Integer | C3 — Daily user count |
| `damage` | Integer | C4 — Damage impact |
| `lastMaintenance` | DateTime \| null | C5 input — last maintenance date |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### SawRun

| Field | Type | Description |
|---|---|---|
| `id` | string (CUID) | Unique run identifier |
| `date` | DateTime | Run date (DB column: `run_date`) |
| `averageScore` | Float \| null | Average SAW score of all buildings |
| `totalBuildings` | Integer \| null | Number of buildings in this run |
| `snapshotWeights` | JSON \| null | Frozen weight config at time of run |
| `executedAt` | DateTime | Execution timestamp |
| `sawRunDetails` | SawRunDetail[] | Individual building results |

### SawRunDetail

| Field | Type | Description |
|---|---|---|
| `id` | string (CUID) | Unique detail identifier |
| `sawRunId` | string (CUID) | Foreign key to SawRun |
| `buildingId` | string (CUID) | Foreign key to Building |
| `assessmentId` | string (CUID) | Foreign key to Assessment |
| `score` | Float | Final SAW preference score |
| `priority` | Integer | Priority tier: 1/2/3 |
| `detail` | JSON \| null | Frozen normalized criteria values `{c1, c21, c22, c23, c3, c4, c5}` |

### WeightConfiguration

| Field | Type | Description |
|---|---|---|
| `key` | string | Primary key (e.g. `"c1"`, `"c21"`) |
| `name` | string | Display name |
| `type` | string | `"cost"` or `"benefit"` |
| `value` | Float | Weight value (0.0–1.0) |
| `subWeightFrom` | string \| null | Parent key; null for top-level criteria |
| `subWeights` | WeightConfiguration[] | Child sub-weights (only on parent) |

---

## 7. Error Reference

### Standard Error Codes

| HTTP Status | NestJS Exception | Common Cause |
|---|---|---|
| `400` | `BadRequestException` | Validation failure, weight sum ≠ 1.0, duplicate unique key |
| `401` | `UnauthorizedException` | Missing, invalid, or expired token; invalid credentials |
| `403` | `ForbiddenException` | Insufficient permissions |
| `404` | `NotFoundException` | Resource not found (building, run, etc.) |
| `500` | `InternalServerErrorException` | Unexpected server-side failure |

### Validation Error Format

NestJS's `ValidationPipe` returns `message` as an array of strings:

```json
{
  "statusCode": 400,
  "success": false,
  "message": [
    "email must be an email",
    "password must contain only letters and numbers"
  ],
  "error": "Bad Request"
}
```

### Weight Validation Error

Custom error message from `DssService` when weight totals are invalid:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Total bobot kriteria harus 1.0 (Sekarang: 0.95)",
  "error": "Bad Request"
}
```

---

## Appendix: Endpoint Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register new user |
| `POST` | `/auth/login` | ❌ | Login, get tokens |
| `POST` | `/auth/refresh` | 🔄 Refresh Token | Refresh access token |
| `GET` | `/auth/me` | ✅ Access Token | Get current user |
| `DELETE` | `/auth/session` | ✅ Access Token | Logout |
| `GET` | `/buildings` | ❌ | List all buildings |
| `POST` | `/buildings` | ✅ | Create building |
| `PUT` | `/buildings/:id` | ✅ | Update building |
| `DELETE` | `/buildings/:id` | ✅ | Delete building |
| `GET` | `/buildings/:code/assessments` | ✅ | Get assessments for building |
| `POST` | `/buildings/:code/assessments` | ✅ | Create assessment |
| `PUT` | `/buildings/:code/assessments/:assessmentId` | ✅ | Update assessment |
| `DELETE` | `/buildings/assessments/:assessmentId` | ✅ | Delete assessment |
| `GET` | `/dss/weights` | ✅ | Get weight config |
| `PUT` | `/dss/weights` | ✅ | Update weights |
| `POST` | `/dss/calculate` | ✅ | Trigger SAW calculation |
| `GET` | `/dss/runs` | ✅ | List all SAW runs |
| `GET` | `/dss/runs/latest` | ✅ | Get latest SAW run |
| `GET` | `/dss/runs/lastest` | ⚠️ | Deprecated alias for `/dss/runs/latest` |
| `GET` | `/dss/runs/:id` | ✅ | Get SAW run by ID |
| `DELETE` | `/dss/runs/:id` | ✅ | Delete SAW run |
| `DELETE` | `/dss/runs/details/:id` | ✅ | Delete SAW run detail |
