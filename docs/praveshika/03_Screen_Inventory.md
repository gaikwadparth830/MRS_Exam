# Existing Application Screen Inventory — Praveshika

| Document ID | DOC-03 |
| Version | 1.0 |
| Date | 2026-03-23 |

---

## 1. Navigation map (from `MDIForm1.frm`)

| Menu path | Handler | Opens |
|-----------|---------|-------|
| Transactions → Form Entry → For Praveshika | `Sub_FormPraveshika_Click` | `Frm_FormPraveshika` |
| Toolbar → Praveshika | `Toolbar1_ButtonMenuClick` | same |
| Transactions → Marks → For Praveshika | `Sub_PraveshikaMarks_Click` | `Frm_PraveshikaMarks` |
| Processing → Generate Result → For Praveshika | `Sub_GenResPraveshika_Click` | `Frm_GenResultPraveshika` |
| Processing → Set Roll No's → For Praveshika | `Sub_SetRollNos_Praveshika_Click` | `Frm_SetRollNo_FromToCentre` |
| Processing → Aur Forms → For Praveshika (Aur) | `Sub_AurRollNoPraveshika_Click` | `Frm_SetRollNoAur` |
| Supervisor → Reset Result Flag → For Praveshika | `Sub_Regen_Praveshika_Click` | `Frm_regen_res` |
| Reports → Attendance → For Praveshika | `Sub_ForPraveshika_Click` | `Frm_AttSheet` |
| Reports → Name List → For Praveshika | `Sub_NameListPraveshika_Click` | `Frm_NameList` |
| Reports → Result Sheet → For Praveshika | `Sub_ResultSheetForPraveshika_Click` | `Frm_ResultSheet` |
| Reports → Result Sheet → For Praveshika(no name) | `Sub_ResultPraveshikanoname_Click` | `Frm_ResultSheet` |
| Reports → Hall Ticket → For Praveshika | `Sub_HallTicket_Praveshika_Click` | `Frm_PrintHallTicket` |
| Reports → Certificate → For Praveshika | `Sub_CertiPraveshika_Click` | `Frm_Certificate_Printing` |
| Reports → Register → Praveshika | `Sub_RegisterPraveshika_Click` | `Frm_RGOtherThanPandit` |
| Query → Losing grade by 2 marks → For Praveshika | `Sub_LostTwoMarksPraveshika_Click` | Report direct |

---

## 2. Screen catalogue

### SCR-001 Login — `frmLogin.frm`
- **Purpose:** Authenticate against `USERS`.
- **Controls:** Userid, Password, Login/Cancel.
- **Ops:** Validate; open MDI; hide Super menu if KEY ≠ SUPER.
- **Status:** Confirmed.

### SCR-002 Splash — `frm_Splash.frm`
- **Purpose:** Startup splash then login.
- **Status:** Confirmed.

### SCR-003 MDI Shell — `MDIForm1.frm`
- **Purpose:** Menus, toolbar, status.
- **Status:** Confirmed.

### SCR-004 Form Entry Praveshika — `Frm_FormPraveshika.frm`
- **Purpose:** Candidate form CRUD.
- **Key controls:** Name, Gender (M/F), Form Centre, Exam Centre, Region (display), Session (locked), Roll (locked), nav + CRUD buttons, Search, Insert, Exit.
- **Ops:** New, Insert-between, Save, Update, Delete, Undo, Search, Navigate.
- **Table:** `FORM_PRAVESHIKA`.
- **Status:** Confirmed.

### SCR-005 Search — `Frm_Search.frm`
- **Purpose:** Name lookup for form entry.
- **Ops:** Prefix search; position to SrNo.
- **Status:** Confirmed (Praveshika branch).

### SCR-006 Insert Between — `Frm_InsertRecordBetween.frm`
- **Purpose:** Choose previous SrNo for insert-between.
- **Status:** Confirmed (shared).

### SCR-007 Marks Entry — `Frm_PraveshikaMarks.frm`
- **Purpose:** Enter Paper1/Paper2 marks.
- **Controls:** Session, Region combo, Roll-from, Show, DataGrid (Roll, Marks1, Marks2, Total).
- **Ops:** Filter, edit cells, auto total.
- **Status:** Confirmed.

### SCR-008 Set Roll (From–To Centre) — `Frm_SetRollNo_FromToCentre.frm`
- **Purpose:** Bulk assign rolls.
- **Controls:** Session, seat-region, from/to centre, first/last roll, Set, grid preview.
- **Ops:** Assign in transaction; confirm names.
- **Status:** Confirmed.

### SCR-009 Set Roll Aur — `Frm_SetRollNoAur.frm`
- **Purpose:** Assign remaining null rolls for a centre.
- **Status:** Confirmed.

### SCR-010 Blank Roll No — `Frm_BlankRollNo.frm`
- **Purpose:** Clear rolls for correction.
- **Status:** Confirmed (LblExam from caller).

### SCR-011 Generate Result — `Frm_GenResultPraveshika.frm`
- **Purpose:** Compute result/grade/ranks for region.
- **Controls:** Region combo, session label, Generate, Find Ranks, grid view.
- **Ops:** Generate; Find Ranks; (print stub unused).
- **Status:** Confirmed.

### SCR-012 Regen Result (manual) — `Frm_RegenResult.frm`
- **Purpose:** Clear/re-enter marks & clear result for a candidate.
- **Status:** Confirmed (Praveshika = 2 papers).

### SCR-013 Reset Result Flag — `Frm_regen_res.frm`
- **Purpose:** Set `RESGEN_PRAVESHIKA='N'`.
- **Status:** Confirmed. Message text may say “Subodh” (copy-paste bug).

### SCR-014 Attendance — `Frm_AttSheet.frm`
- **Purpose:** Build/print attendance.
- **Ops:** Select centres; fill `AttSheet`; print `Rpt_AttSheetPraveshika_Subodh`.
- **Status:** Confirmed.

### SCR-015 Name List — `Frm_NameList.frm`
- **Purpose:** Print name list.
- **Status:** Confirmed.

### SCR-016 Result Sheet — `Frm_ResultSheet.frm`
- **Purpose:** Print result sheets (named / no-name).
- **Filters:** Centre or Region; result date caption.
- **Status:** Confirmed.

### SCR-017 Hall Ticket — `Frm_PrintHallTicket.frm`
- **Purpose:** Print hall tickets.
- **Filters:** Region, optional roll from–to.
- **Status:** Confirmed.

### SCR-018 Certificate — `Frm_Certificate_Printing.frm`
- **Purpose:** Print certificates.
- **Filters:** Session, region, optional rolls; excludes grade A/X.
- **Status:** Confirmed.

### SCR-019 Register — `Frm_RGOtherThanPandit.frm` / `Frm_RegionwiseRegister.frm`
- **Purpose:** Result register with dummy centre codes.
- **Status:** Confirmed.

### SCR-020 Batch Insert — `frm_insertbatch.frm`
- **Purpose:** Bulk create form rows for Praveshika.
- **Status:** Confirmed.

### SCR-021 Export Data — `Frm_ExportData.frm`
- **Purpose:** Export centres (Praveshika branch unions form centres).
- **Status:** Confirmed partial.

### SCR-022 User Master — `Frm_Usermast.frm`
- **Purpose:** Maintain USERS.
- **Status:** Confirmed.

### SCR-023–028 Masters
| Screen | File |
|--------|------|
| Region | `Frm_Region.frm` |
| District | `Frm_District.frm` |
| Centre | `Frm_Centre.frm` |
| Exam | `Frm_Exam.frm` |
| Session | `Frm_Session.frm` |
| Paper | `Frm_Paper.frm` |

---

## 3. Report inventory

| ID | Report | Trigger |
|----|--------|---------|
| RPT-01 | `Rpt_NameListPraveshika` | SCR-015 |
| RPT-02 | `Rpt_AttSheetPraveshika_Subodh` | SCR-014 |
| RPT-03 | `Rpt_ResultSheetPraveshika` | SCR-016 |
| RPT-04 | `Rpt_ResultSheetPraveshikanoname` | SCR-016 |
| RPT-05 | `Rpt_HallTicket_Praveshika` | SCR-017 |
| RPT-06 | `Rpt_Certificate_Praveshika` | SCR-018 |
| RPT-07 | `Rpt_RGPraveshika` | SCR-019 |
| RPT-08 | `Rpt_LostTwoMarksPraveshika` | Menu direct |
