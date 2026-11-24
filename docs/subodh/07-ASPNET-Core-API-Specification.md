# Proposed ASP.NET Core API Specification — Subodh

| Field | Value |
|-------|-------|
| Document ID | SUB-API-001 |
| Base path | `/api/v1` |
| Auth | JWT Bearer (modernization of USERS login) |
| Scope | Subodh + required masters |

Conventions: JSON; problem+json errors; all mutating Subodh ops check session lock where legacy did.

---

## 1. Auth

| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| POST | `/auth/login` | FR-001 | `{ userId, password }` → token + display name |
| GET | `/auth/me` | FR-001 | Current user |

---

## 2. Sessions

| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| GET | `/sessions` | FR-002 | List sessions |
| GET | `/sessions/default` | FR-002 | Current default |
| PUT | `/sessions/{sessionNo}/default` | FR-002 | Set default |
| PATCH | `/sessions/{sessionNo}/subodh-resgen` | RULE-LOCK | Set `ResgenSubodh` Y/N (**confirm who may**) |

---

## 3. Masters

| Method | Endpoint | Notes |
|--------|----------|-------|
| CRUD | `/regions`, `/districts`, `/centres` | FR-010 |
| GET/PUT | `/exams/4` | Subodh exam rules |
| CRUD | `/exams/4/papers` | Papers 1–2 |
| CRUD | `/users` | Admin |
| GET/PUT | `/institution` | Headers |

Centre GET must expose `closeFlag`, name, city, district, region resolution helper:

`GET /centres/{centreNo}/region` → region used by form entry (FR-021).

---

## 4. Subodh candidates

| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| GET | `/subodh/candidates` | FR-020 | Query: session (default), formCentre, page; order formCentre, srNo |
| GET | `/subodh/candidates/{srNo}` | FR-020 | Single |
| POST | `/subodh/candidates` | FR-021 | Create; server assigns SrNo per RULE-CAN-08/09 |
| PUT | `/subodh/candidates/{srNo}` | FR-022 | Update |
| DELETE | `/subodh/candidates/{srNo}?sessionNo=` | FR-023 | Delete with confirm client-side |
| GET | `/subodh/candidates/search` | FR-024 | `?namePrefix=` |
| POST | `/subodh/candidates/insert-between` | FR-025 | Body: afterSrNo |
| GET | `/subodh/candidates/count` | FR-020 | `?formCentre=&sessionNo=` |

**Validation errors:** mirror RULE-CAN-*.  
**409/403:** when ResgenSubodh lock active.

---

## 5. Marks

| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| GET | `/subodh/marks` | FR-050 | `sessionNo, regionNo, fromRoll` |
| PUT | `/subodh/marks/{srNo}` | FR-051 | `{ marks1, marks2 }` → returns totMarks |
| PUT | `/subodh/marks/batch` | FR-051 | Optional batch save |

Server revalidates RULE-MRK-* and recalculates total (do not trust client total alone).

---

## 6. Roll numbers

| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| GET | `/subodh/roll-numbers/preview` | FR-040 | Next centre / suggested first roll |
| POST | `/subodh/roll-numbers/assign` | FR-040 | `{ sessionNo, seatRegionNo, centreNo, firstRoll, lastRoll }` |
| POST | `/subodh/roll-numbers/assign-aur` | FR-041 | Aurangabad variant |

---

## 7. Result generation

| Method | Endpoint | FR | Description |
|--------|----------|----|-------------|
| POST | `/subodh/results/generate` | FR-060 | `{ sessionNo, regionNo }` → summary counts |
| POST | `/subodh/results/special-ranks` | FR-061 | Statewide FIRST/SECOND |
| GET | `/subodh/results` | FR-060 | Filtered grid data |

Generation must be transactional and idempotent for already-resulted rows (legacy skips non-null result).

---

## 8. Reports (data + PDF)

Prefer: API returns data; reporting service returns PDF.

| Method | Endpoint | FR |
|--------|----------|----|
| GET | `/subodh/reports/attendance` | FR-070 |
| POST | `/subodh/reports/attendance/pdf` | FR-070 |
| GET/POST | `/subodh/reports/hall-tickets` (+ `/pdf`) | FR-071 |
| GET/POST | `/subodh/reports/name-list` (+ `/pdf`) | FR-072 |
| GET/POST | `/subodh/reports/register` (+ `/pdf`) | FR-073 |
| GET/POST | `/subodh/reports/result-sheet` (+ `/pdf`) | FR-080 |
| GET/POST | `/subodh/reports/result-sheet-noname` (+ `/pdf`) | FR-081 |
| GET/POST | `/subodh/reports/certificates` (+ `/pdf`) | FR-082 |
| GET/POST | `/subodh/reports/lost-by-two` (+ `/pdf`) | FR-083 |

Query params typically: `sessionNo`, `regionNo`, `centreNo`, `fromRoll`, `toRoll`, `resultDate`, `monthLabel`.

---

## 9. Utilities

| Method | Endpoint | FR |
|--------|----------|----|
| POST | `/subodh/results/regen` | FR-090 |
| GET | `/subodh/reports/centre-wise-counts` | FR-092 |
| GET | `/admin/tot-forms?exam=SUBODH` | FR-092 |
| POST | `/admin/backup` / export | FR-091 |

---

## 10. Services (internal)

| Service | Responsibility |
|---------|----------------|
| `SubodhCandidateService` | CRUD, srno allocation, centre count |
| `SubodhMarksService` | Validation + totals |
| `SubodhResultService` | RULE-RES-* engine |
| `SubodhRollService` | Roll allocation |
| `SubodhReportService` | Query shaping for reports |
| `SessionLockGuard` | Enforce ResgenSubodh |

---

## 11. Authorization (proposed — pending OQ-001)

| Role | Capabilities |
|------|--------------|
| EntryOperator | Candidates, marks (if unlocked), searches |
| ExamAdmin | Rolls, result gen, reports, session default |
| SystemAdmin | Users, backup, masters |

Legacy did not enforce this split — **Assumption** pending confirmation.
