# Proposed React Page and Component Inventory — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | UI-BAL-001 |
| Stack | React, TypeScript, Material UI |
| Status | Draft for review after the BRD |
| Scope | One Balbodhini application. No other exam pages. |

Routes sit under `/`. The signed-in user and the current session come from the API. Supervisor routes require user id `SUPER` until Q-013 defines a role differently.

## 1. Shared shell

| Component | Responsibility |
| --- | --- |
| `AppShell` | App bar, navigation, current session, user, sign-out |
| `SessionBanner` | Shows session number, month, and whether result lock is on |
| `ConfirmDialog` | Delete, roll-number name check, flag reset, rank-wide clear |
| `CentreLookup` | Centre code, name, city, closed state |
| `RegionSelect` | Region number and name. Always submit the numeric region id, not a parsed caption |
| `ReportViewer` | PDF or print view returned by the API |
| `MasterCrudPage` | First, previous, next, last, new, save, delete, search for masters |

Navigation groups: Masters, Candidates, Processing, Reports, Supervisor.

## 2. Pages

| Page ID | Route | Legacy screen | Main components | FR |
| --- | --- | --- | --- | --- |
| PG-001 | `/login` | SCR-002 | `LoginForm` | FR-001, FR-002, FR-007 |
| PG-002 | `/session` | Select session and session master | `SessionForm`, `DefaultSessionSwitch` | FR-003 to FR-006 |
| PG-003 | `/masters/regions` | SCR-004 | `RegionForm` including English name | FR-010, FR-011 |
| PG-004 | `/masters/districts` | SCR-005 | `DistrictForm` | FR-012 |
| PG-005 | `/masters/centres` | SCR-006 | `CentreForm` | FR-013 |
| PG-006 | `/masters/exam` | SCR-007 | `ExamThresholdForm` for the Balbodhini row, including minimum total | FR-014, FR-015 |
| PG-007 | `/masters/paper` | SCR-009 | `PaperForm` for Balbodhini paper 1 | FR-016 |
| PG-008 | `/masters/users` | SCR-008 | `UserForm`. Supervisor only | FR-017 |
| PG-010 | `/candidates` | SCR-010 | `CandidateForm`, `CandidateNavigator`, `CentreFormCount` | FR-020 to FR-035 |
| PG-011 | `/candidates/insert-between` | SCR-011 | `InsertBetweenDialog` | FR-026 |
| PG-012 | `/candidates/search` | SCR-012 | `NameSearch`, `RollSearch` | FR-034 |
| PG-013 | `/candidates/batch` | SCR-062 | `BatchInsertForm`. Supervisor only | FR-036 |
| PG-020 | `/marks` | SCR-020 | `MarksFilter`, `MarksGrid`, `GraceDialog` | FR-050 to FR-055 |
| PG-030 | `/results/generate` | SCR-030 | `GenerateResultPanel`, `ResultGrid`, `FindRanksButton` | FR-060 to FR-065 |
| PG-031 | `/results/correct` | SCR-061 | `MarkCorrectionForm`. Supervisor only | FR-071 to FR-074 |
| PG-032 | `/results/reset-lock` | SCR-060 | `ResetLockDialog`. Supervisor only | FR-070 |
| PG-040 | `/roll-numbers` | SCR-040 | `RollAssignmentForm`, `NextCentrePanel`, `BittiConfirmDialog` | FR-040 to FR-044 |
| PG-041 | `/roll-numbers/aur` | SCR-041 | `AurAssignmentForm` | FR-045 |
| PG-042 | `/roll-numbers/clear` | SCR-042 | `ClearRollDialog` | FR-046 |
| PG-050 | `/reports/attendance` | SCR-050 | `AttendanceFilters` | FR-080 |
| PG-051 | `/reports/name-list` | SCR-054 | `NameListFilters` | FR-081 |
| PG-052 | `/reports/result-sheet` | SCR-051, SCR-052 | `ResultSheetFilters` with a with-name switch | FR-082 |
| PG-053 | `/reports/certificates` | SCR-053 | `CertificateFilters` | FR-083 |
| PG-054 | `/reports/register` | SCR-055 | `RegisterFilters` | FR-084, FR-085 |
| PG-055 | `/reports/register/region` | SCR-056 | `RegionRegisterFilters` | FR-086 |
| PG-056 | `/reports/centre-ranges` | SCR-057 | `CentreRangeReport` | FR-087 |
| PG-057 | `/reports/form-counts` | SCR-058 | `FormCountReport` | FR-088 |
| PG-058 | `/reports/centre-labels` | SCR-070 | `CentreLabelExport` | FR-089 |

There is no page for duplicate ranks, hall tickets, mark sheets, or other exams.

## 3. Candidate form behavior

`CandidateForm` fields: name, gender, form centre, exam centre, region (read-only, filled by the API), session (read-only), roll number (read-only), serial number (read-only), entered-by (read-only).

Buttons follow FR-021. When the session lock is on, edit buttons are disabled and the API also rejects writes.

Gender is two radio buttons, Male and Female.

Name uses a Unicode font that can show the same Devanagari text the office enters today.

## 4. Marks grid

Columns: roll number, Paper 1, total, region. Paper 1 is editable. Total is calculated and read-only. Leaving a cell runs the same validation as FR-052 and opens `GraceDialog` when RULE-043 matches. The grid requests only candidates with no result.

## 5. Authorization on the page

| Area | Standard user | Supervisor |
| --- | --- | --- |
| Masters except users | Yes | Yes |
| Users, batch insert, reset lock, correct marks | No | Yes |
| Candidates, marks, roll numbers, generate, reports | Yes | Yes |
| Locked session writes | No | No, until the lock is reset |

The legacy supervisor menu does not remove report or entry rights from SUPER. The table matches that.

## 6. Validation ownership

The page validates for immediate feedback. The API repeats every rule in the FRS. A page check is not the system of record.
