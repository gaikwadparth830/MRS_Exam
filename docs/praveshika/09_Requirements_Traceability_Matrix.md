# Requirements Traceability Matrix — Praveshika

| Document ID | DOC-09 |
| Version | 1.0 |
| Date | 2026-03-23 |

Maps legacy feature → BR → FR → UI → API → Data → Test.

| Legacy feature | Source | BR | FR | React UI | API | SQL entity | Test |
|----------------|--------|----|----|----------|-----|------------|------|
| Login | `frmLogin` | BR-001 | FR-001 | UI-001 | POST /auth/login | Users | TC-AUTH-01 |
| Hide Super menu | `frmLogin` | BR-002 | FR-003 | AuthGuard | Authorize SUPER | Users.RoleKey | TC-AUTH-02 |
| User master | `Frm_Usermast` | BR-092 | FR-004 | UI-017 | /api/users | Users | TC-AUTH-03 |
| Default session | Multiple | BR-010 | FR-013 | SessionContext | /sessions/current | ExamSession | TC-MAS-01 |
| Region/District/Centre | Master forms | BR-011–013 | FR-010–012 | UI-010–012 | /regions|/districts|/centres | Region/District/Centre | TC-MAS-02 |
| Exam thresholds | `EXAM` | BR-014 | FR-014 | UI-014 | /exams/3 | Exam | TC-MAS-03 |
| Paper min marks | `PAPER` + gen | BR-015 | FR-015 | UI-015 | /exams/{n}/papers | Paper | TC-MAS-04 |
| Form CRUD | `Frm_FormPraveshika` | BR-020–022 | FR-020–023 | UI-020 | /praveshika/forms | FormPraveshika | TC-FORM-01 |
| Insert between | Insert + dialog | BR-023 | FR-024 | UI-020 | forms/insert-between | FormPraveshika | TC-FORM-02 |
| Form validations | `check_data` | BR-024–027 | FR-025 | UI-020 | service validation | Centre/Region | TC-FORM-03 |
| Lock on resgen | `Proc_CheckResultGen` | BR-028 | FR-028 | LockBanner | 403 RESULT_LOCKED | ExamSession | TC-FORM-04 |
| Name search | `Frm_Search` | BR-031 | FR-026 | NameSearchDialog | forms/search | FormPraveshika | TC-FORM-05 |
| Set rolls from–to | `Frm_SetRollNo_FromToCentre` | BR-040–041 | FR-040–041 | UI-022 | /rolls/assign* | FormPraveshika | TC-ROLL-01 |
| Aur rolls | `Frm_SetRollNoAur` | BR-042 | FR-042 | UI-023 | /rolls/assign/aur | FormPraveshika | TC-ROLL-02 |
| Blank rolls | `Frm_BlankRollNo` | BR-043 | FR-043 | UI-024 | /rolls/blank | FormPraveshika | TC-ROLL-03 |
| Marks grid | `Frm_PraveshikaMarks` | BR-050–055 | FR-050–054 | UI-021 | /praveshika/marks | FormPraveshika | TC-MARK-01 |
| Marks max 100 / A | AfterColEdit | BR-052 | FR-052 | MarksDataGrid | PATCH marks | — | TC-MARK-02 |
| Generate result | `Frm_GenResultPraveshika` | BR-060–065 | FR-060–065 | UI-030 | /results/generate | FormPraveshika | TC-RES-01 |
| Region rank | gen result | BR-062 | FR-062 | UI-030 | generate | SpecialRank | TC-RES-02 |
| Statewide ranks | `Cmd_ranks` | BR-063 | FR-063 | UI-031 | /results/ranks | SpecialRank | TC-RES-03 |
| Unlock flag | `Frm_regen_res` | BR-070 | FR-070 | UI-033 | /results/unlock | ExamSession | TC-RES-04 |
| Manual regen | `Frm_RegenResult` | BR-071–072 | FR-071–072 | UI-032 | /results/regen | FormPraveshika | TC-RES-05 |
| Attendance | `Frm_AttSheet` | BR-080 | FR-080 | UI-040 | reports/attendance | Form + temp | TC-RPT-01 |
| Name list | `Frm_NameList` | BR-081 | FR-081 | UI-041 | reports/name-list | Form | TC-RPT-02 |
| Hall ticket | `Frm_PrintHallTicket` | BR-082 | FR-082 | UI-042 | reports/hall-tickets | Form | TC-RPT-03 |
| Result sheet | `Frm_ResultSheet` | BR-083 | FR-083–084 | UI-043 | reports/result-sheet | Form | TC-RPT-04 |
| Certificate | `Frm_Certificate_Printing` | BR-084 | FR-085 | UI-044 | reports/certificates | Form+Grade | TC-RPT-05 |
| Register | RG forms | BR-085 | FR-086 | UI-045 | reports/register | Form | TC-RPT-06 |
| Lost two marks | Menu + DE | BR-086 | FR-087 | UI-046 | lost-two-marks | Form+Exam | TC-RPT-07 |
| Batch insert | `frm_insertbatch` | BR-090 | FR-090 | UI-025 | forms/batch | Form | TC-UTIL-01 |
| Export centres | `Frm_ExportData` | BR-091 | FR-091 | UI-050 | export/centres | Centre/Form | TC-UTIL-02 |

### Open items affecting RTM

| Ambiguity | Blocks |
|-----------|--------|
| OQ-002 ExamNo 3 vs 4 | TC-RES-01 expected masters |
| OQ-004 When Resgen=Y | TC-FORM-04 / generate postcondition |
| OQ-005 Rank Update bug | TC-RES-03 expected persistence |
| OQ-006 SrNo algorithm | TC-FORM-01 create expectations |
