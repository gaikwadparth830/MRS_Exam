# Requirements Traceability Matrix — Subodh Exam

| Field | Value |
|-------|-------|
| Document ID | SUB-RTM-001 |
| Scope | Subodh only |

Maps: **BR → FR → React → API → Data → Tests**

---

## Matrix

| BR | FR | React page/component | API | Data | Test |
|----|----|----------------------|-----|------|------|
| BR-001 | FR-001 | `LoginPage` | `POST /auth/login` | AppUser | TC-AUTH-01 |
| BR-002 | FR-002 | `SelectSessionPage` | `/sessions*` | ExamSession | TC-SES-01 |
| BR-003 | FR-002 | Candidate page guard | `/sessions/default` | ExamSession | TC-SES-02 |
| BR-010 | FR-010 | Master pages | `/regions` `/districts` `/centres` | Region/District/Centre | TC-MST-01 |
| BR-011 | FR-010 / FR-021 | `CentreLookupField` | centre validate | Centre.CloseFlag | TC-CAN-03 |
| BR-012 | FR-011 | Exam/Paper pages | `/exams/4*` | Exam, Paper | TC-MST-02 |
| BR-013 | FR-012 | Institution page | `/institution` | Institution | TC-MST-03 |
| BR-020 | FR-020 | `SubodhCandidatePage` | `GET /subodh/candidates` | FormSubodh | TC-CAN-01 |
| BR-021 | FR-021–025 | CrudToolbar + dialogs | POST/PUT/DELETE/search/insert | FormSubodh | TC-CAN-02 |
| BR-022 | FR-021 | Form validators | API validation | — | TC-CAN-04 |
| BR-023 | FR-021 | Centre lookup | GET centre | Centre | TC-CAN-05 |
| BR-024 | FR-021 | Auto region | `/centres/{id}/region` | joins | TC-CAN-06 |
| BR-025 | FR-021 | Default exam centre | create DTO | — | TC-CAN-07 |
| BR-026 | FR-021 | — | create stamps user | UserId | TC-CAN-08 |
| BR-027 | FR-021/025 | — | SrNo allocator | SrNo | TC-CAN-09 |
| BR-028 | FR-020 | `CentreFormCountChip` | `/candidates/count` | FormSubodh | TC-CAN-10 |
| BR-029 | FR-026 | `ResultLockBanner` | lock guard | ResgenSubodh | TC-LOCK-01 |
| BR-030 | FR-024 | Search dialog | `/candidates/search` | Name | TC-CAN-11 |
| BR-040 | FR-040 | `SubodhRollNumberPage` | `/roll-numbers/*` | FormSubodh.RollNo | TC-ROL-01 |
| BR-041 | FR-040 | same | assign | FormSubodh | TC-ROL-02 |
| BR-042 | FR-041 | Aur page | `/assign-aur` | FormSubodh | TC-ROL-03 |
| BR-043 | FR-042 | Roll utilities | TBD | FormSubodh | TC-ROL-04 |
| BR-050 | FR-050 | `SubodhMarksPage` | `GET /marks` | Marks* | TC-MRK-01 |
| BR-051 | FR-051 | Marks grid | PUT marks | Marks1/2 | TC-MRK-02 |
| BR-052 | FR-051 | validators | API validation | — | TC-MRK-03 |
| BR-053 | FR-051 | total column | server total | TotMarks | TC-MRK-04 |
| BR-054 | FR-052 | lock banner | lock guard | ResgenSubodh | TC-LOCK-02 |
| BR-060 | FR-060 | Result generate page | `POST /results/generate` | Result/Grade | TC-RES-01 |
| BR-061 | FR-060 | — | uses Exam/Paper | Exam, Paper | TC-RES-02 |
| BR-062 | FR-060 | — | ResultService | Result/Grade | TC-RES-03..10 |
| BR-063 | FR-060 | — | region first rank | SpecialRank | TC-RES-11 |
| BR-064 | FR-061 | ranks action | `/special-ranks` | SpecialRank | TC-RES-12 |
| BR-065 | FR-060 | — | ResgenRun | ResgenRun | TC-RES-13 |
| BR-066 | FR-060 | results grid | `GET /results` | FormSubodh | TC-RES-14 |
| BR-070 | FR-070 | Attendance page | reports/attendance | AttSheet/FormSubodh | TC-RPT-01 |
| BR-071 | FR-071 | Hall ticket page | hall-tickets | FormSubodh | TC-RPT-02 |
| BR-072 | FR-072 | Name list page | name-list | FormSubodh | TC-RPT-03 |
| BR-073 | FR-073 | Register page | register | FormSubodh | TC-RPT-04 |
| BR-080 | FR-080 | Result sheet | result-sheet | FormSubodh | TC-RPT-05 |
| BR-081 | FR-081 | Result sheet noname | result-sheet-noname | FormSubodh | TC-RPT-06 |
| BR-082 | FR-082 | Certificate page | certificates | FormSubodh | TC-RPT-07 |
| BR-083 | FR-083 | Lost-by-two page | lost-by-two | FormSubodh | TC-RPT-08 |
| BR-090 | FR-090 | Regen page | `/results/regen` | FormSubodh | TC-UTL-01 |
| BR-091 | FR-092 | Centre-wise page | centre-wise-counts | FormSubodh | TC-UTL-02 |
| BR-092 | FR-091 | Backup/Export | `/admin/backup` | DB | TC-UTL-03 |
| BR-093 | FR-092 | User totals | `/admin/tot-forms` | TotForms | TC-UTL-04 |
| BR-N01..N05 | — | Cross-cutting | Auth/PDF/Unicode | NVARCHAR | TC-NFR-* |

---

## Coverage notes

- All Must BRs mapped.
- BR-043 / FR-042 pending deeper roll-utility analysis before build.
- AuthZ roles pending OQ-001.
