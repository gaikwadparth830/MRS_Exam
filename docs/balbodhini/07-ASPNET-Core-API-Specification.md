# Proposed ASP.NET Core API Specification — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | API-BAL-001 |
| Stack | ASP.NET Core Web API, C# |
| Status | Draft |
| Auth | Bearer token. Supervisor policy matches legacy user id `SUPER` until Q-013 is answered. |
| Errors | Validation failures return 400 with the rule id. Missing rows return 404. A locked session returns 409. |

All routes are under `/api`. JSON property names are camel case. The tables are the SQL Server names in the data-mapping document.

## 1. Auth and session

| Method | Route | FR | Behavior |
| --- | --- | --- | --- |
| POST | `/auth/login` | FR-001, FR-002 | Body: user id, password. Returns token, display name, `isSupervisor`. |
| GET | `/sessions/current` | FR-003, FR-004 | Default session, month, backup flag, `resgenBalbodhini`. 404 when none. |
| PUT | `/sessions/current` | FR-006 | Body: session number to mark as default. Clears the previous default. |
| GET | `/sessions` | FR-005 | List for combos. |
| POST | `/sessions` | FR-005 | Session master create. |
| PUT | `/sessions/{sessionNo}` | FR-005 | Update month, result date, printed flag, close flag. |
| POST | `/sessions/{sessionNo}/open-backup` | FR-007 | Marks the client session read-only. Does not swap files. |

## 2. Masters

| Method | Route | FR |
| --- | --- | --- |
| GET, POST | `/regions` | FR-010 |
| PUT, DELETE | `/regions/{regionNo}` | FR-010, FR-011 |
| GET, POST | `/districts` | FR-012 |
| PUT, DELETE | `/districts/{name}` | FR-012 |
| GET | `/centres/{centreNo}` | FR-013, FR-029, FR-031 |
| GET, POST | `/centres` | FR-013 |
| PUT, DELETE | `/centres/{centreNo}` | FR-013 |
| GET, PUT | `/exam/balbodhini` | FR-014, FR-015 |
| GET, PUT | `/exam/balbodhini/papers/1` | FR-016 |
| GET, POST | `/users` | FR-017. Supervisor. |
| PUT | `/users/{userId}` | FR-017. Supervisor. |

`GET /centres/{centreNo}` returns name, city, closed flag, district, and the derived region so the candidate page does not reimplement the nested SQL.

## 3. Candidates

| Method | Route | FR | Rules |
| --- | --- | --- | --- |
| GET | `/candidates?formCentre=&direction=` | FR-020 | Page or cursor in form-centre and serial order for the current session. |
| GET | `/candidates/{srno}` | FR-020 | One row. |
| POST | `/candidates` | FR-022 to FR-032 | Allocates `srno` as max+3. Copies user id. Rejects closed form centre. |
| PUT | `/candidates/{srno}` | FR-027 | Does not change roll number or serial number. |
| DELETE | `/candidates/{srno}` | FR-033 | Current session only. |
| POST | `/candidates/insert-between` | FR-026 | Body: previous serial. Allocates previous+1 when the gap exists. |
| GET | `/candidates/search?name=` | FR-034 | Current session, name prefix, same order as the legacy `LIKE` list. |
| GET | `/candidates/search?regionNo=&rollNo=` | FR-034 | |
| GET | `/candidates/count?formCentre=` | FR-032 | |
| POST | `/candidates/batch` | FR-036 | Supervisor. |

Writes return 409 when `resgenBalbodhini` is `Y` (FR-035).

## 4. Roll numbers

| Method | Route | FR |
| --- | --- | --- |
| POST | `/roll-numbers/preview` | FR-040 to FR-044 | Body: session, seat region, form centre, first, last. Returns the last candidate name and does not save. |
| POST | `/roll-numbers/commit` | FR-043 | Body includes `confirmed: true`. Otherwise 400. Transaction. |
| GET | `/roll-numbers/next-centre?sessionNo=&seatRegionNo=` | FR-044 | |
| POST | `/roll-numbers/aur/preview` | FR-045 | |
| POST | `/roll-numbers/aur/commit` | FR-045 | |
| POST | `/roll-numbers/clear` | FR-046 | Requires `confirmed: true`. |

## 5. Marks and results

| Method | Route | FR |
| --- | --- | --- |
| GET | `/marks?regionNo=&fromRoll=` | FR-050, FR-051 | Current session, result null. |
| PUT | `/marks/{srno}` | FR-052 to FR-055 | Body: paper1, `acceptGrace`. Server computes grace eligibility and total. 409 when locked. |
| POST | `/results/generate` | FR-060 to FR-064 | Body: region number as an integer, not a caption fragment. Runs RULE-060 to RULE-069 in one transaction. If the exam or paper row is missing, the transaction rolls back, including the pre-clear. That rollback is a deliberate correction of DEF-09 and is called out in the traceability matrix. |
| POST | `/results/ranks` | FR-065 | RULE-070. |
| GET | `/results?regionNo=` | FR-064 | Read-only grid. |
| POST | `/results/lock/reset` | FR-070 | Supervisor. Sets the flag to `N`. |
| GET | `/results/correction?regionNo=&rollNo=` | FR-071 | |
| PUT | `/results/correction` | FR-072 to FR-074 | Supervisor. Applies RULE-080 or RULE-081. |

The API does not expose a duplicate-rank report (FR-066).

## 6. Reports

Each report returns `application/pdf` unless the client asks for JSON data with `Accept: application/json`.

| Method | Route | FR |
| --- | --- | --- |
| GET | `/reports/attendance?centreNo=` | FR-080 |
| GET | `/reports/name-list?centreNo=` | FR-081. Omit centre for all centres. |
| GET | `/reports/result-sheet?mode=named\|noname&centreNo=&regionNo=&resultDate=` | FR-082 |
| GET | `/reports/certificates?sessionNo=&regionNo=&fromRoll=&toRoll=` | FR-083 |
| POST | `/reports/register?sessionNo=` | FR-084, FR-085. Recomputes dummy centre codes, then returns the PDF. |
| POST | `/reports/register/region?regionNo=` | FR-086 |
| GET | `/reports/centre-ranges` | FR-087 |
| GET | `/reports/form-counts?userId=` | FR-088 |
| GET | `/reports/centre-labels?sessionNo=` | FR-089. `text/plain` in the legacy `%` layout. |

Register endpoints are POST because they write `dummyCentreCode` before printing, which matches the legacy side effect.

## 7. Services

| Service | Responsibility |
| --- | --- |
| `AuthService` | Password verify. New hashes only after migration. |
| `SessionService` | Default session and lock flag. |
| `CentreResolver` | Centre, closed flag, region through district. |
| `CandidateService` | CRUD, serial allocation, insert-between, batch. |
| `RollNumberService` | Regular, Aur, and clear, in transactions. |
| `MarksService` | Validation, grace decision, total. |
| `ResultService` | RULE-060 to RULE-070. |
| `ReportService` | PDF composition and the four report queries. |

## 8. Authorization

| Policy | Allows |
| --- | --- |
| `Authenticated` | Every route except login |
| `Supervisor` | Users, batch insert, lock reset, mark correction |
| `SessionOpen` | Candidate, marks, and roll-number writes. Fails when the flag is `Y` or the opened session is backup |

Standard users are not restricted by centre or region. That matches the legacy program.

## 9. Stored procedures

Use procedures only where the legacy operation is one multi-row transaction:

- `balbodhini.GenerateResult`
- `balbodhini.AssignRollNumbers`
- `balbodhini.AssignAurRollNumbers`
- `balbodhini.RebuildDummyCentreCodes`

Other operations can be EF Core or parameterized commands. Do not build SQL by concatenating exam names. The exam is fixed as Balbodhini.
