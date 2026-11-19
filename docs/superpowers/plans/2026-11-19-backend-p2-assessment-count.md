# Backend P2 (Issues #25, #26) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `GET /buildings` return `assessmentCount` instead of raw Prisma `_count`, and lock in that assessments may omit `lastMaintenance`.

**Architecture:** `BuildingService.findAll()` already selects `_count.assessments`. The `BuildingEntity` constructor becomes the single boundary that maps that Prisma shape into the domain field `assessmentCount` and drops `_count`. All other entity call sites are unaffected because they pass no `_count`. Validation of optional `lastMaintenance` is already implemented in the DTO and Prisma schema, so only a regression test is needed.

**Tech Stack:** NestJS 11, TypeScript 5.7, Prisma 7, Jest + ts-jest, class-validator, OpenAPI YAML.

**Spec:** `docs/superpowers/specs/2026-11-19-assessment-count-design.md`

## Global Constraints

- Backend submodule must stay on its own feature branch; do not touch the dirty frontend submodule or the superproject working tree until explicitly asked.
- Commit messages: Conventional Commits, imperative English, one logical change per commit.
- No Prisma schema or migration changes.
- No changes to DSS logic or guard #24.

## Review Focus

- Building with zero assessments must expose `assessmentCount: 0`, not an absent field — pinned in Task 1 unit test and Task 2 e2e test.
- Raw `_count` must never reach the HTTP response — pinned in Task 1 unit test.
- `GET /buildings/:code/assessments` must still return the full `assessments` array — pinned in Task 2 e2e test (existing assertion retained).
- Assessment payload without `lastMaintenance` must pass validation — pinned in Task 3 test.
- Public API docs must not still advertise nested `assessments` on the list endpoint — fixed in Task 4.

---

### Task 1: Expose `assessmentCount` from `BuildingEntity`

**Files:**
- Modify: `src/building/entities/building.entity.ts`
- Modify: `src/building/building.service.spec.ts`

**Interfaces:**
- Consumes: Prisma `findMany()` result with `_count: { assessments: number }` from `BuildingService.findAll()`.
- Produces: `BuildingEntity.assessmentCount?: number`; constructing from `_count` sets it and removes `_count` from the instance.

- [ ] **Step 1: Add failing unit test in `src/building/building.service.spec.ts`**

In `describe('findAll')`, add a test named `should expose assessment count and omit raw prisma count`. Mock `mockPrismaService.building.findMany` to resolve buildings shaped as `{ ...mockBuilding, _count: { assessments: 2 }, sawRunDetails: [] }`, call `service.findAll()`, and assert the result item has `assessmentCount: 2`, `not.toHaveProperty('_count')`, and `not.toHaveProperty('assessments')`. Add a second test `should default assessment count to zero` using `_count: { assessments: 0 }` and expect `assessmentCount: 0`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test --runInBand src/building/building.service.spec.ts`
Expected: FAIL because `assessmentCount` is undefined and `_count` leaks.

- [ ] **Step 3: Update the entity constructor**

In `src/building/entities/building.entity.ts`, add `assessmentCount?: number` and change the constructor parameter to `Partial<BuildingEntity> & { _count?: { assessments: number } }`. Destructure `_count` out of the partial, run `Object.assign(this, rest)`, then set `this.assessmentCount = _count.assessments` when `_count` is present. Preserve the existing `assessments` mapping to `AssessmentEntity`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test --runInBand src/building/building.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/building/entities/building.entity.ts src/building/building.service.spec.ts
git commit -m "fix(building): expose assessment count in buildings list"
```

### Task 2: Cover list count and detail array in e2e

**Files:**
- Modify: `test/building.e2e-spec.ts`

**Interfaces:**
- Consumes: `GET /buildings` response `data[]` entries now carry `assessmentCount`.
- Produces: no new production interface.

- [ ] **Step 1: Extend the existing `GET /buildings` test**

After the existing assertions, find the building with `code === testBuilding.code`, assert `assessmentCount` is `0`, and assert the item does not have an `assessments` property.

- [ ] **Step 2: Add a post-assessment count assertion**

In `describe('GET /buildings/:code/assessments')`, after the existing full-array assertion, call `GET /buildings`, find the same building, and assert `assessmentCount` is `1`. Keep the existing detail-array assertions unchanged.

- [ ] **Step 3: Commit**

```bash
git add test/building.e2e-spec.ts
git commit -m "test(building): assert assessment count in list response"
```

### Task 3: Lock in optional `lastMaintenance` (#25)

**Files:**
- Modify: `src/building/dto/create-assessment.dto.spec.ts`

**Interfaces:**
- Consumes: `CreateAssessmentDTO` with `@IsOptional() @IsDateString() lastMaintenance?`.
- Produces: no new production interface.

- [ ] **Step 1: Add validation test**

Import `validate` from `class-validator`. Add a test `should validate when lastMaintenance is omitted` that builds a `CreateAssessmentDTO` via `Object.assign` with the six required numeric fields, calls `validate(dto)`, and expects an empty errors array. Add a companion test with `lastMaintenance: '2023-10-01T00:00:00.000Z'` and also expect no errors.

- [ ] **Step 2: Run the test**

Run: `pnpm test --runInBand src/building/dto/create-assessment.dto.spec.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/building/dto/create-assessment.dto.spec.ts
git commit -m "test(assessment): validate optional last maintenance"
```

### Task 4: Align OpenAPI with the new list contract

**Files:**
- Modify: `docs/OpenApi.yaml`

**Interfaces:**
- Consumes: `BuildingEntity.assessmentCount`.
- Produces: no new code interface.

- [ ] **Step 1: Update `GET /buildings` description and example**

Change the description from "nested `assessments` and `sawRunDetails`" to "`assessmentCount` and `sawRunDetails` (latest 1 per building)". Replace the example's `assessments: []` with `assessmentCount: 0`.

- [ ] **Step 2: Update the `Building` schema**

Add `assessmentCount: { type: integer, minimum: 0, description: "Number of assessments for this building (list endpoint only)" }`. Keep the existing `assessments` schema property because the detail endpoint still returns it.

- [ ] **Step 3: Commit**

```bash
git add docs/OpenApi.yaml
git commit -m "docs(api): document assessment count in buildings response"
```

### Task 5: Record the approved design note

**Files:**
- Create: `docs/superpowers/specs/2026-11-19-assessment-count-design.md` (already written during brainstorming)

- [ ] **Step 1: Commit the design note**

```bash
git add docs/superpowers/specs/2026-11-19-assessment-count-design.md
git commit -m "docs: record backend P2 design note"
```

### Task 6: Final verification

- [ ] Run `pnpm test --runInBand` — expect 25+ suites, all passing.
- [ ] Run `pnpm build` — expect success.
- [ ] Run `git status --short` — expect clean backend submodule except untracked plan file if not committed; do not run e2e locally because its teardown deletes shared DB rows.
