# Proposed React Page & Component Inventory — Praveshika

| Document ID | DOC-06 |
| Version | 1.0 |
| Date | 2026-03-23 |
| Stack | React + TypeScript + Material UI |

---

## 1. App shell

| ID | Page/Component | Route | Maps from |
|----|----------------|-------|-----------|
| UI-000 | `AppLayout` (nav, session badge, user menu) | — | `MDIForm1` |
| UI-001 | `LoginPage` | `/login` | `frmLogin` |
| UI-002 | `DashboardPage` (links to modules) | `/` | Splash/MDI home |

---

## 2. Masters

| ID | Page | Route | Legacy |
|----|------|-------|--------|
| UI-010 | `RegionsPage` | `/masters/regions` | `Frm_Region` |
| UI-011 | `DistrictsPage` | `/masters/districts` | `Frm_District` |
| UI-012 | `CentresPage` | `/masters/centres` | `Frm_Centre` |
| UI-013 | `SessionsPage` | `/masters/sessions` | `Frm_Session` |
| UI-014 | `ExamPage` (Praveshika thresholds) | `/masters/exam/praveshika` | `Frm_Exam` |
| UI-015 | `PapersPage` | `/masters/papers` | `Frm_Paper` |
| UI-016 | `GradesPage` | `/masters/grades` | GRADE table |
| UI-017 | `UsersPage` | `/admin/users` | `Frm_Usermast` |

Shared components: `MasterDataGrid`, `ConfirmDialog`, `CentreAutocomplete`.

---

## 3. Transactions

| ID | Page | Route | Legacy | Key components |
|----|------|-------|--------|----------------|
| UI-020 | `FormEntryPage` | `/praveshika/forms` | `Frm_FormPraveshika` | `FormEntryForm`, `FormNavigator`, `NameSearchDialog`, `InsertBetweenDialog` |
| UI-021 | `MarksEntryPage` | `/praveshika/marks` | `Frm_PraveshikaMarks` | `MarksDataGrid`, `RegionFilterBar` |
| UI-022 | `SetRollNumbersPage` | `/praveshika/roll-numbers` | `Frm_SetRollNo_FromToCentre` | `RollAssignWizard`, `CentreRangeFields`, `NameConfirmStep` |
| UI-023 | `SetRollAurPage` | `/praveshika/roll-numbers/aur` | `Frm_SetRollNoAur` | |
| UI-024 | `BlankRollNumbersPage` | `/praveshika/roll-numbers/blank` | `Frm_BlankRollNo` | |
| UI-025 | `BatchInsertPage` | `/praveshika/forms/batch` | `frm_insertbatch` | |

---

## 4. Processing

| ID | Page | Route | Legacy |
|----|------|-------|--------|
| UI-030 | `GenerateResultPage` | `/praveshika/results/generate` | `Frm_GenResultPraveshika` |
| UI-031 | `FindRanksPanel` (on UI-030) | — | `Cmd_ranks` |
| UI-032 | `RegenResultPage` | `/praveshika/results/regen` | `Frm_RegenResult` |
| UI-033 | `ResetResultFlagPage` | `/praveshika/results/unlock` | `Frm_regen_res` (SUPER) |

---

## 5. Reports

| ID | Page | Route | Legacy / Report |
|----|------|-------|-----------------|
| UI-040 | `AttendanceReportPage` | `/praveshika/reports/attendance` | `Frm_AttSheet` |
| UI-041 | `NameListReportPage` | `/praveshika/reports/name-list` | `Frm_NameList` |
| UI-042 | `HallTicketReportPage` | `/praveshika/reports/hall-tickets` | `Frm_PrintHallTicket` |
| UI-043 | `ResultSheetReportPage` | `/praveshika/reports/result-sheet` | `Frm_ResultSheet` (+ no-name toggle) |
| UI-044 | `CertificateReportPage` | `/praveshika/reports/certificates` | `Frm_Certificate_Printing` |
| UI-045 | `RegisterReportPage` | `/praveshika/reports/register` | `Frm_RGOtherThanPandit` |
| UI-046 | `LostTwoMarksPage` | `/praveshika/reports/lost-two-marks` | Lost two marks report |
| UI-047 | `ReportPreview` (shared PDF viewer) | — | Data Report Show |

Shared: `SessionRegionCentreFilters`, `RollRangeFields`, `PdfDownloadButton`.

---

## 6. Utilities

| ID | Page | Route | Legacy |
|----|------|-------|--------|
| UI-050 | `ExportCentresPage` | `/praveshika/export/centres` | `Frm_ExportData` |

---

## 7. Cross-cutting components

| Component | Responsibility |
|-----------|----------------|
| `SessionContext` | Current default session |
| `AuthGuard` / `RoleGuard` | FR-002, FR-003 |
| `HindiTextField` | Unicode-friendly inputs |
| `LockBanner` | Shows when ResgenPraveshika=Y |
| `ApiErrorAlert` | Server validation messages |
| `ConfirmCommitDialog` | Roll assign name confirmation |

---

## 8. FR → UI map (summary)

| FR range | Primary UI |
|----------|------------|
| FR-001–004 | UI-001, UI-017 |
| FR-010–017 | UI-010–016 |
| FR-020–029 | UI-020 |
| FR-040–044 | UI-022–024 |
| FR-050–054 | UI-021 |
| FR-060–066 | UI-030–031 |
| FR-070–072 | UI-032–033 |
| FR-080–087 | UI-040–047 |
| FR-090–091 | UI-025, UI-050 |
