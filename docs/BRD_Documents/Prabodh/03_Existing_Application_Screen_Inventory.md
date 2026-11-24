# Existing Application Screen Inventory — Prabodh

| Screen ID | Legacy form | Caption / Menu path | Purpose | Key controls | Operations | Primary table |
|-----------|-------------|---------------------|---------|--------------|------------|---------------|
| SCR-PRB-01 | Frm_FormPrabodh | Transactions → Examination Form Entry → For Prabodh | Candidate form capture | Txt_SrNo, Txt_Roll_No, Txt_Name, Txt_Session_No, Txt_Form_Centre, Txt_Exam_Centre, Txt_Region_*, OptMale/OptFemale, Txt_Gender, Cmd_new/save/update/delete/undo/search/nav/Insert, LblCount | CRUD, Nav, Search, Insert-between | FORM_PRABODH |
| SCR-PRB-02 | Frm_PrabodhMarks | Transactions → Marks Entry → For Prabodh | Grid marks entry | CmbRegion, Txt_Session_No, Txt_Roll_No, DataGrid (marks1-3, oral, tot), CmdShow, CmdExit | View/Edit marks | FORM_PRABODH |
| SCR-PRB-03 | Frm_GenResultPrabodh | Processing → Generate Result → For Prabodh | Result + rank | Cmb_region, cmd_gen_result, cmd_print (dup ranks), Cmd_ranks, DataGrid, Lblsession | Generate, View | FORM_PRABODH, PAPER, EXAM, SESSION |
| SCR-PRB-04 | Frm_SetRollNo_FromToCentre | Processing → Set Roll No's → For Prabodh | Assign roll nos (`LblExam="Prabodh"` → `form_Prabodh`) | From/To centre, roll range | Update ROLL_NO | FORM_PRABODH |
| SCR-PRB-05 | Frm_SetRollNoAur | Processing → Aur Forms Set Roll → For Prabodh (Aur) | Aur roll assignment | — | Update ROLL_NO | FORM_PRABODH |
| SCR-PRB-06 | Frm_AttSheet | Reports → Attendance → For Prabodh | Attendance params | Exam selector via GS_RGForExam | Print | FORM_PRABODH + PARAMETER |
| SCR-PRB-07 | Frm_ResultSheet | Reports → Result Sheet → For Prabodh | Result sheet params | — | Print | FORM_PRABODH |
| SCR-PRB-08 | Frm_MarkSheet | Reports → Mark Sheet → For Prabodh | Mark sheet params | — | Print | FORM_PRABODH |
| SCR-PRB-09 | Frm_Certificate_Printing | Reports → Certificate → For Prabodh | Certificate params | Menu check Sub_CertiPrabodh | Print | FORM_PRABODH |
| SCR-PRB-10 | Frm_PrintHallTicket | Reports → Hall Ticket → For Prabodh | Hall ticket | Sub_HallTicket_Prabodh | Print | FORM_PRABODH |
| SCR-PRB-11 | Frm_NameList | Reports → Name List → For Prabodh | Name list | — | Print | FORM_PRABODH |
| SCR-PRB-12 | Frm_RGOtherThanPandit | Reports → Register → Prabodh | Register/RG | GS_RGForExam | Print | FORM_PRABODH |
| SCR-PRB-13 | Frm_regen_res | Supervisor → Reset Result Flag → For Prabodh | Clear `RESGEN_PRABODH='N'` | Sub_Regen_Prabodh | Update SESSION | SESSION |
| SCR-PRB-13b | Frm_RegenResult | Supervisor → Update Marks (exam=Prabodh) | Single-student mark correction; clears result/grade/rank; if ranked, clears region results | Sub_UpdateMarks | Update FORM_PRABODH | FORM_PRABODH |
| SCR-PRB-14 | Frm_Search | (from form Search) | Find record | Search fields | Locate | FORM_PRABODH |
| SCR-PRB-15 | Frm_InsertRecordBetween | (from Insert) | Insert between names | Text1/Text2 | Insert | FORM_PRABODH |
| SCR-PRB-16 | MDIForm1 | Shell | Navigation | Menus | — | — |
| SCR-PRB-17 | frmLogin / frm_Splash / Frm_SelectSession | Startup | Auth & session | — | — | USERS, SESSION |

## Report designers (Prabodh)

| Report ID | File | Used for |
|-----------|------|----------|
| RPT-PRB-01 | Rpt_AttSheetPrabodh.Dsr | Attendance |
| RPT-PRB-02 | Rpt_ResultSheetPrabodh.Dsr | Result sheet |
| RPT-PRB-03 | Rpt_MarkSheetPrabodh.Dsr | Mark sheet |
| RPT-PRB-04 | Rpt_Certificate_Prabodh.Dsr | Certificate |
| RPT-PRB-05 | Rpt_HallTicket_Prabodh.Dsr | Hall ticket |
| RPT-PRB-06 | Rpt_NameListPrabodh.Dsr | Name list |
| RPT-PRB-07 | Rpt_RGPrabodh.Dsr | Register |
| RPT-PRB-08 | Rpt_LostTwoMarksPrabodh.Dsr | Near-miss grades |

## Control → column map (Form Entry)

| Control | DB column |
|---------|-----------|
| Txt_SrNo | SRNO |
| Txt_Roll_No | ROLL_NO (locked on form; assigned via Set Roll / Aur) |
| Txt_Name | NAME |
| Txt_Session_No | SESSION_NO |
| Txt_Form_Centre | FORM_CENTRE |
| Txt_Exam_Centre | EXAM_CENTRE |
| Txt_Region_No | REGION_NO |
| Txt_Gender / Opt* | GENDER |
| Txt_UserID | userid |

### Marks grid extras
| Grid field | Column | Notes |
|------------|--------|-------|
| Papers 1–3 | MARKS1–3 | 0–100 or A |
| Oral | ORAL_MARKS | max 100 |
| Optional Paper | REG_LANG | max 50; **not used in result gen** |
| Total | TOT_MARKS | sum of papers 1–3 only |
