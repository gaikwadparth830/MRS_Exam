# Existing Application Screen Inventory — Subodh Scope

| Field | Value |
|-------|-------|
| Document ID | SUB-SCR-001 |
| Scope | Screens used by Subodh exam workflows |

Legend: **D** = dedicated Subodh; **S** = shared, Subodh-parameterised; **M** = shared master dependency.

---

## 1. Navigation (MDI)

**Source:** `Forms/MDIForm1.frm`

| Menu path | Handler | Opens | Type |
|-----------|---------|-------|------|
| Examination Form → For Subodh | `Sub_FormSubodh_Click` | `Frm_FormSubodh` | D |
| Marks Entry → For Subodh | `Sub_SubodhMarks_Click` | `Frm_SubodhMarks` | D |
| Generate Result → For Subodh | `Sub_GenResSubodh_Click` | `Frm_GenResultSubodh` | D |
| Set Roll Nos → For Subodh | `Sub_SetRollNos_Subodh_Click` | SetRollNo flow | S |
| Set Roll Nos → For Subodh (Aur) | `Sub_AurRollNoSubodh_Click` | Aur roll flow | S |
| Attendance → For Subodh | `Sub_ForSubodh_Click` | `Frm_AttSheet` | S |
| Hall Ticket → For Subodh | `Sub_HallTicket_Subodh_Click` | `Frm_PrintHallTicket` | S |
| Certificate → For Subodh | `Sub_CertiSubodh_Click` | `Frm_Certificate_Printing` | S |
| Result Sheet → For Subodh | `Sub_ResultSheetForSubodh_Click` | `Frm_ResultSheet` | S |
| Result Sheet → For Subodh(no name) | `Sub_ResultSubodhnoname_Click` | `Frm_ResultSheet` | S |
| Name List → For Subodh | `Sub_NameListSubodh_Click` | Name list flow | S |
| Register → Subodh | `Sub_RegisterSubodh_Click` | `Frm_RGOtherThanPandit` | S |
| Lost Two Marks → For Subodh | `Sub_LostTwoMarksSubodh_Click` | Report direct | D |
| Regen Result → For Subodh | `Sub_Regen_Subodh_Click` | `Frm_regen_res` | S |
| Toolbar exam key “Subodh” | Button menu | Form entry | D |

---

## 2. Dedicated Subodh screens

### 2.1 Frm_FormSubodh — Candidate Entry

| Item | Detail |
|------|--------|
| File | `Forms/Frm_FormSubodh.frm` (+ `.frx`) |
| Purpose | CRUD for Subodh applications |
| Table | `FORM_SUBODH` |

**Controls (business-relevant):**

| Control | Purpose |
|---------|---------|
| `Txt_Name` | Candidate name |
| `Txt_Gender` / `OptMale` / `OptFemale` | Gender M/F |
| `Txt_Form_Centre` / `Txt_FormCentre_Name` | Form-filled centre + display |
| `Txt_Exam_Centre` / `Txt_ExamCentre_Name` | Exam centre + display |
| `Txt_Region_No` / `Txt_Region_Name` | Region (derived) |
| `Txt_Roll_No` | Roll number (often system-assigned later) |
| `Txt_Session_No` | Session (locked) |
| `Txt_SrNo` | Internal serial (hidden) |
| `Txt_UserID` | Operator (hidden) |
| `LblCount` | Forms count for centre |
| Nav: First/Prev/Next/Last | Record navigation |
| Cmd: New/Insert/Update/Save/Delete/Undo/Search/Exit | Operations |

**Operations:** Add, Edit, Delete, View/Navigate, Search, Insert-between.

### 2.2 Frm_SubodhMarks — Marks Entry

| Item | Detail |
|------|--------|
| File | `Forms/Frm_SubodhMarks.frm` |
| Caption | “Subodh Marks Entry Form” |
| Purpose | Enter Paper1/Paper2 marks |

**Controls:** `Txt_Session_No`, `CmbRegion`, `Txt_Roll_No`, `CmdShow`, `DataGrid1` (roll_no, session_no, marks1, marks2, tot_marks), `CmdExit`.

**Operations:** Filter, Edit marks, Auto-total, Exit. No separate Save — grid bound updates (**Confirmed** pattern).

### 2.3 Frm_GenResultSubodh — Generate Result

| Item | Detail |
|------|--------|
| File | `Forms/Frm_GenResultSubodh.frm` |
| Caption | “Generate Result For Subodh” |

**Controls:** Session label, `Cmb_region`, `cmd_gen_result`, `Cmd_ranks`, `cmd_print` (stub), result `DataGrid1`, `CmdExit`.

**Operations:** Generate result, Assign special ranks, View results.

---

## 3. Shared screens (Subodh behaviour)

| Screen | File | Subodh trigger | Purpose |
|--------|------|----------------|---------|
| Login | `frmLogin.frm` | Startup | Auth |
| Splash | `frm_Splash.frm` | Startup | Branding / load |
| Select Session | `Frm_SelectSession.frm` | Utilities | Default session |
| Session master | `Frm_Session.frm` | Masters | Includes `RESGEN_SUBODH` |
| Region/District/Centre/Exam/Paper | respective forms | Masters | Reference data |
| Users | `Frm_Usermast.frm` | Masters | User accounts |
| Search | `Frm_Search.frm` | From form entry | Name search on `form_subodh` |
| Insert between | `Frm_InsertRecordBetween.frm` | Form Insert | SrNo insert |
| Set Roll No | `Frm_SetRollNo1.frm` | Menu Subodh | Roll allocation |
| Set Roll Aur | `Frm_SetRollNoAur.frm` | Aur menu | Aurangabad rolls |
| Attendance | `Frm_AttSheet.frm` | For Subodh | Attendance print |
| Hall ticket | `Frm_PrintHallTicket.frm` | HallTicket Subodh | Admit cards |
| Certificate | `Frm_Certificate_Printing.frm` | Certi Subodh | Certificates |
| Result sheet | `Frm_ResultSheet.frm` | Result Subodh | Result sheets |
| Name list | `Frm_NameList.frm` | NameList Subodh | Name lists |
| Register | `Frm_RGOtherThanPandit.frm` | Register Subodh | Register |
| Regionwise register | `Frm_RegionwiseRegister.frm` | CmdSubodh | Region register |
| Regen | `Frm_regen_res.frm` | Regen Subodh | Regen UI |
| Backup | `FrmBackup.frm` | Utilities | Includes form_subodh |
| Export | `Frm_ExportData.frm` | Utilities | Data export |
| Centre-wise students | `Frm_CentreWiseNoOfStudent.frm` | Reports | Counts |
| User-wise totals | `Frm_Userwiselist_Totforms.frm` | Reports | Totals |

---

## 4. Reports inventory (Subodh)

| Report ID | Designer | Invoked from |
|-----------|----------|--------------|
| RPT-SUB-01 | `Rpt_ResultSheetSubodh` | Result sheet |
| RPT-SUB-02 | `Rpt_ResultSheetSubodhnoname` | Result sheet no-name |
| RPT-SUB-03 | `Rpt_RGSubodh` | Register |
| RPT-SUB-04 | `Rpt_NameListSubodh` | Name list |
| RPT-SUB-05 | `Rpt_HallTicket_Subodh` | Hall ticket |
| RPT-SUB-06 | `Rpt_Certificate_Subodh` | Certificate |
| RPT-SUB-07 | `Rpt_LostTwoMarksSubodh` | Lost two marks menu |
| RPT-SUB-08 | `Rpt_AttSheetPraveshika_Subodh` | Attendance (Subodh title) |

**DataEnvironment commands:** `Cmd_AttSheet_Subodh`, `Cmd_ResultSubodh`, `Cmd_NameListSubodh`, `Cmd_LosingTwoMarksSubodh`, `Cmd_HallTicket_Subodh`, `Cmd_Certificate_Subodh`, `Cmd_RGSubodh`.

---

## 5. Screen → FR mapping (summary)

| Screen | Primary FRs |
|--------|-------------|
| Frm_FormSubodh | FR-020…FR-026 |
| Frm_SubodhMarks | FR-050…FR-052 |
| Frm_GenResultSubodh | FR-060, FR-061 |
| Frm_SetRollNo* | FR-040…FR-042 |
| Frm_AttSheet | FR-070 |
| Frm_PrintHallTicket | FR-071 |
| Frm_NameList | FR-072 |
| Frm_RG* | FR-073 |
| Frm_ResultSheet | FR-080, FR-081 |
| Frm_Certificate_Printing | FR-082 |
| LostTwoMarks report | FR-083 |
