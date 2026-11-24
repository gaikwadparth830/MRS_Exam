# Proposed React Page & Component Inventory — Prabodh

Document ID: UI-PRABODH-001 | Stack: React + TypeScript + MUI

## Pages (routes)

| Page ID | Route | Maps legacy | FR coverage |
|---------|-------|-------------|-------------|
| PG-PRB-01 | `/prabodh/forms` | Frm_FormPrabodh | FR-PRB-010..020 |
| PG-PRB-02 | `/prabodh/marks` | Frm_PrabodhMarks | FR-PRB-040..043 |
| PG-PRB-03 | `/prabodh/results/generate` | Frm_GenResultPrabodh | FR-PRB-050..054 |
| PG-PRB-04 | `/prabodh/roll-numbers` | Frm_SetRollNo1 | FR-PRB-030 |
| PG-PRB-05 | `/prabodh/roll-numbers/aur` | Aur set roll | FR-PRB-031 |
| PG-PRB-06 | `/prabodh/reports/attendance` | Att sheet | FR-PRB-060 |
| PG-PRB-07 | `/prabodh/reports/result-sheet` | Result sheet | FR-PRB-061 |
| PG-PRB-08 | `/prabodh/reports/mark-sheet` | Mark sheet | FR-PRB-062 |
| PG-PRB-09 | `/prabodh/reports/certificate` | Certificate | FR-PRB-063 |
| PG-PRB-10 | `/prabodh/reports/hall-ticket` | Hall ticket | FR-PRB-064 |
| PG-PRB-11 | `/prabodh/reports/name-list` | Name list | FR-PRB-065 |
| PG-PRB-12 | `/prabodh/reports/register` | RG | FR-PRB-066 |
| PG-PRB-13 | `/prabodh/reports/lost-two-marks` | Lost 2 marks | FR-PRB-067 |
| PG-PRB-14 | `/admin/result-flags` | Frm_RegenResult (Prabodh tab) | FR-PRB-055 |

## Shared pages used

| Page | Route |
|------|-------|
| Login | `/login` |
| Session select | `/session` |
| Centre / Region / District / Exam / Paper masters | `/masters/*` |

## Components

| Component | Used on | Responsibility |
|-----------|---------|----------------|
| `PrabodhFormEditor` | PG-PRB-01 | Bound fields + validation |
| `CentreLookupField` | forms | Validate centre, show name, derive region |
| `GenderToggle` | forms | M/F |
| `RecordNavigator` | forms | First/Prev/Next/Last |
| `CrudToolbar` | forms | New/Save/Update/Delete/Undo/Search |
| `InsertBetweenDialog` | forms | Insert-between |
| `PrabodhMarksGrid` | PG-PRB-02 | Editable DataGrid MUI |
| `MarksCellEditor` | marks | A or 0–100 |
| `ResultGeneratePanel` | PG-PRB-03 | Region select + generate + progress |
| `ResultPreviewGrid` | PG-PRB-03 | Post-generate view |
| `ReportFilterBar` | reports | Session/region/centre/roll range |
| `ReportPreview` | reports | PDF iframe / download |
| `ResgenLockBanner` | forms/marks | Shows when locked |

## State & validation libraries (proposed)

- React Hook Form + Zod schemas mirroring `check_data` / marks rules
- React Query for API cache
- MUI DataGrid for marks
