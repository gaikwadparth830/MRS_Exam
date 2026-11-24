# Proposed React Page and Component Inventory — Subodh

| Field | Value |
|-------|-------|
| Document ID | SUB-UI-001 |
| Stack | React + TypeScript + Material UI |
| Scope | Subodh exam modernization |

---

## 1. App shell

| Page / component | Route (proposed) | Legacy | FRs |
|------------------|------------------|--------|-----|
| `LoginPage` | `/login` | `frmLogin` | FR-001 |
| `AppLayout` (nav) | `/*` | `MDIForm1` | — |
| `SelectSessionPage` | `/sessions/select` | `Frm_SelectSession` | FR-002 |
| `StatusSnackbar` | global | `ClsCommon.StatusMessage` | — |

---

## 2. Master data pages

| Page | Route | Legacy | Notes |
|------|-------|--------|-------|
| `RegionListPage` / `RegionForm` | `/masters/regions` | `Frm_Region` | |
| `DistrictListPage` / `DistrictForm` | `/masters/districts` | `Frm_District` | |
| `CentreListPage` / `CentreForm` | `/masters/centres` | `Frm_Centre` | close flag |
| `ExamPage` | `/masters/exams/4` | `Frm_Exam` | Subodh focused |
| `PaperListPage` | `/masters/exams/4/papers` | `Frm_Paper` | papers 1–2 |
| `UserAdminPage` | `/admin/users` | `Frm_Usermast` | |
| `InstitutionPage` | `/masters/institution` | INSTITUTION | |

**Shared components:** `MasterDataGrid`, `ConfirmDeleteDialog`, `YNflagToggle`.

---

## 3. Subodh core pages

| Page | Route | Legacy | FRs |
|------|-------|--------|-----|
| `SubodhCandidatePage` | `/subodh/candidates` | `Frm_FormSubodh` | FR-020…026 |
| `SubodhCandidateSearchDialog` | modal | `Frm_Search` | FR-024 |
| `SubodhInsertBetweenDialog` | modal | `Frm_InsertRecordBetween` | FR-025 |
| `SubodhMarksPage` | `/subodh/marks` | `Frm_SubodhMarks` | FR-050…052 |
| `SubodhResultGeneratePage` | `/subodh/results/generate` | `Frm_GenResultSubodh` | FR-060…061 |
| `SubodhRollNumberPage` | `/subodh/roll-numbers` | `Frm_SetRollNo1` | FR-040 |
| `SubodhRollNumberAurPage` | `/subodh/roll-numbers/aur` | `Frm_SetRollNoAur` | FR-041 |

### Candidate page components

| Component | Responsibility |
|-----------|----------------|
| `CandidateFormFields` | Name, gender, centres, region, roll, session |
| `CentreLookupField` | Validate + display name/city |
| `RecordNavigator` | First/Prev/Next/Last |
| `CrudToolbar` | New/Save/Update/Delete/Undo/Search/Insert |
| `ResultLockBanner` | Shown when ResgenSubodh |
| `CentreFormCountChip` | LblCount |

### Marks page components

| Component | Responsibility |
|-----------|----------------|
| `MarksFilterBar` | Session, region, from-roll, Show |
| `MarksEditableGrid` | Paper1/Paper2 + total; validation |
| `MarksLockBanner` | When result generated |

---

## 4. Report / print pages

| Page | Route | Legacy | FRs |
|------|-------|--------|-----|
| `SubodhAttendancePage` | `/subodh/reports/attendance` | `Frm_AttSheet` | FR-070 |
| `SubodhHallTicketPage` | `/subodh/reports/hall-tickets` | `Frm_PrintHallTicket` | FR-071 |
| `SubodhNameListPage` | `/subodh/reports/name-list` | `Frm_NameList` | FR-072 |
| `SubodhRegisterPage` | `/subodh/reports/register` | `Frm_RGOtherThanPandit` | FR-073 |
| `SubodhResultSheetPage` | `/subodh/reports/result-sheet` | `Frm_ResultSheet` | FR-080/081 |
| `SubodhCertificatePage` | `/subodh/reports/certificates` | `Frm_Certificate_Printing` | FR-082 |
| `SubodhLostByTwoPage` | `/subodh/reports/lost-by-two` | LostTwoMarks menu | FR-083 |

**Shared report components:** `SessionRegionFilter`, `RollRangeFilter`, `PdfPreviewPane`, `PrintActionBar`.

---

## 5. Utility pages

| Page | Route | Legacy |
|------|-------|--------|
| `SubodhRegenResultPage` | `/subodh/results/regen` | `Frm_regen_res` |
| `CentreWiseStudentsPage` | `/subodh/reports/centre-wise-count` | `Frm_CentreWiseNoOfStudent` |
| `BackupExportPage` | `/admin/backup-export` | Backup/Export |
| `UserWiseTotalsPage` | `/admin/user-wise-totals` | Tot forms |

---

## 6. UI behaviour notes (preserve)

- Disable mutate actions when result lock active.
- Gender radio Male/Female maps to M/F.
- Hindi text: use Unicode fonts suitable for Devanagari (replace DV-TTAakash dependency).
- Prefer MUI DataGrid for marks; server-side filter for large sessions.

---

## 7. Out of scope UI

All non-Subodh exam menus/pages (Pandit, Praveen, Prabodh, Praveshika, Prathamik, Balbodhini) unless later BR approved.
