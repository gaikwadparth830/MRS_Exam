# Proposed ASP.NET Core API Specification — Praveshika

| Document ID | DOC-07 |
| Version | 1.0 |
| Date | 2026-03-23 |
| Style | REST JSON · ASP.NET Core Web API |

All endpoints require auth unless noted. SUPER-only marked.

---

## 1. Auth

| Method | Path | Desc | FR |
|--------|------|------|----|
| POST | `/api/auth/login` | `{userId,password}` → token + role | FR-001 |
| POST | `/api/auth/logout` | Invalidate session | FR-002 |
| GET | `/api/auth/me` | Current user | FR-002 |

---

## 2. Users (SUPER)

| Method | Path | Desc | FR |
|--------|------|------|----|
| GET | `/api/users` | List | FR-004 |
| POST | `/api/users` | Create | FR-004 |
| PUT | `/api/users/{userId}` | Update | FR-004 |
| DELETE | `/api/users/{userId}` | Delete | FR-004 |

---

## 3. Masters

| Method | Path | Desc | FR |
|--------|------|------|----|
| GET/POST | `/api/regions` | List/create | FR-010 |
| PUT/DELETE | `/api/regions/{id}` | Update/delete | FR-010 |
| GET/POST | `/api/districts` | | FR-011 |
| PUT/DELETE | `/api/districts/{name}` | | FR-011 |
| GET/POST | `/api/centres` | Query: district, closed | FR-012, FR-017 |
| PUT/DELETE | `/api/centres/{centreNo}` | | FR-012 |
| GET/POST | `/api/sessions` | | FR-013 |
| PUT | `/api/sessions/{id}` | Incl. set default | FR-013 |
| PUT | `/api/sessions/{id}/default` | Set DEFA | FR-013 |
| GET | `/api/sessions/current` | Default session | FR-013 |
| GET/PUT | `/api/exams/{examNo}` | ExamNo=3 for Praveshika | FR-014 |
| GET/POST/PUT | `/api/exams/{examNo}/papers` | Papers 1–2 | FR-015 |
| GET/POST/PUT | `/api/grades` | | FR-016 |

---

## 4. Form entry

| Method | Path | Desc | FR |
|--------|------|------|----|
| GET | `/api/praveshika/forms` | Query: sessionNo, regionNo, formCentre, page | FR-020 |
| GET | `/api/praveshika/forms/{srNo}` | By key (+session) | FR-020 |
| POST | `/api/praveshika/forms` | Create (roll null) | FR-021 |
| PUT | `/api/praveshika/forms/{srNo}` | Update | FR-022 |
| DELETE | `/api/praveshika/forms/{srNo}?sessionNo=` | Delete | FR-023 |
| POST | `/api/praveshika/forms/insert-between` | `{prevSrNo,...}` | FR-024 |
| GET | `/api/praveshika/forms/search` | `name` prefix | FR-026 |
| GET | `/api/praveshika/forms/count` | By formCentre+session | FR-027 |

**Validation service:** centres exist, form centre open, gender M/F, lock if ResgenPraveshika=Y.

---

## 5. Roll numbers

| Method | Path | Desc | FR |
|--------|------|------|----|
| POST | `/api/praveshika/rolls/assign` | `{sessionNo, regionNos, fromCentre, toCentre, firstRoll, lastRoll}` → preview | FR-040 |
| POST | `/api/praveshika/rolls/assign/confirm` | Commit after name check | FR-041 |
| POST | `/api/praveshika/rolls/assign/aur` | Single centre null rolls | FR-042 |
| POST | `/api/praveshika/rolls/blank` | Clear from roll | FR-043 |

Use DB transaction for assign/confirm.

---

## 6. Marks

| Method | Path | Desc | FR |
|--------|------|------|----|
| GET | `/api/praveshika/marks` | `sessionNo, regionNo, rollFrom` where Result null | FR-050 |
| PATCH | `/api/praveshika/marks/{srNo}` | `{marks1, marks2}` → returns totMarks | FR-052–053 |
| PUT | `/api/praveshika/marks/batch` | Optional bulk save | FR-053 |

---

## 7. Results

| Method | Path | Desc | FR |
|--------|------|------|----|
| POST | `/api/praveshika/results/generate` | `{sessionNo, regionNo}` | FR-060–065 |
| POST | `/api/praveshika/results/ranks` | Statewide FIRST/SECOND | FR-063 |
| GET | `/api/praveshika/results` | Query session/region | — |
| POST | `/api/praveshika/results/regen` | Clear/re-enter one roll | FR-071–072 |
| POST | `/api/praveshika/results/unlock` | SUPER: Resgen=N | FR-070 |

**ResultEngine service** implements BRL-040–046 using Exam/Paper (ExamNo per OQ-002).

---

## 8. Reports

| Method | Path | Desc | FR |
|--------|------|------|----|
| POST | `/api/praveshika/reports/attendance` | PDF | FR-080 |
| POST | `/api/praveshika/reports/name-list` | PDF | FR-081 |
| POST | `/api/praveshika/reports/hall-tickets` | PDF | FR-082 |
| POST | `/api/praveshika/reports/result-sheet` | `{includeName:bool}` PDF | FR-083–084 |
| POST | `/api/praveshika/reports/certificates` | PDF | FR-085 |
| POST | `/api/praveshika/reports/register` | PDF | FR-086 |
| GET | `/api/praveshika/reports/lost-two-marks` | JSON + PDF | FR-087 |

Return `application/pdf` or signed download URL.

---

## 9. Utilities

| Method | Path | Desc | FR |
|--------|------|------|----|
| POST | `/api/praveshika/forms/batch` | Batch insert | FR-090 |
| GET | `/api/praveshika/export/centres` | Centres used in session | FR-091 |

---

## 10. Error model

```json
{ "code": "VALIDATION_ERROR", "message": "...", "fields": { "formCentre": "Centre not found" } }
```

Lock responses: `403` with `RESULT_LOCKED` when ResgenPraveshika=Y.

---

## 11. Services (backend)

| Service | Responsibility |
|---------|----------------|
| `AuthService` | Login, hashing |
| `FormPraveshikaService` | CRUD + search |
| `RollAssignmentService` | Numbering + transactions |
| `MarksService` | Validation + totals |
| `ResultEngineService` | Pass/fail/grade/ranks |
| `ReportService` | PDF generation |
| `SessionLockService` | Resgen flag |
| `CentreResolutionService` | Derive region from form centre |
