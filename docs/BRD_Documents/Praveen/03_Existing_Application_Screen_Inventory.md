# Existing Application Screen Inventory — Praveen

| Screen ID | Form | Menu | Purpose | Key fields/ops | Table |
|-----------|------|------|---------|----------------|-------|
| SCR-PRV-01 | Frm_FormPraveen | Transactions → Form Entry → Praveen | Candidate entry | Roll, Name, Session, Form/Exam Centre, Region, UserID; CRUD/Nav/Search | FORM_PRAVEEN |
| SCR-PRV-02 | Frm_PraveenMarks | Transactions → Marks → Praveen | Marks grid | Region, RollFrom, marks1–5, oral, reg_lang, tot | FORM_PRAVEEN |
| SCR-PRV-03 | Frm_GenResultPraveen | Processing → Generate Result → Praveen | Result+rank | Generate, grid, session label | FORM_PRAVEEN |
| SCR-PRV-04 | Frm_SelectRegionPraveen | (supporting) | Region selection | Region combo | REGION |
| SCR-PRV-05 | Frm_MarkSheetPraveen | Reports path | Mark sheet params | — | FORM_PRAVEEN |
| SCR-PRV-06 | Frm_AttSheet | Reports → Attendance → Praveen | Att params | — | FORM_PRAVEEN |
| SCR-PRV-07 | Frm_ResultSheet | Reports → Result → Praveen | Result sheet | — | FORM_PRAVEEN |
| SCR-PRV-08 | Frm_Certificate_Printing | Certificate → Praveen | Certificate | Sub_CertiPraveen | FORM_PRAVEEN |
| SCR-PRV-09 | Frm_NameList | Name List → Praveen | Name list | — | FORM_PRAVEEN |
| SCR-PRV-10 | Frm_RGOtherThanPandit | Register → Praveen | RG | — | FORM_PRAVEEN |
| SCR-PRV-11 | Frm_regen_res | Supervisor → Regen → Praveen | Reset `RESGEN_PRAVEEN='N'` | — | SESSION |
| SCR-PRV-12 | Shared login/session/MDI/search | — | Shell | — | — |

**Not in active `Project1.vbp` (orphan):** `Frm_SelectRegionPraveen.frm`, `Frm_MarkSheetPraveen.frm`.  
**Note:** `Frm_RegenResult` (Update Marks) exam combo has **no Praveen** — unlike Prabodh.

## Control map (Form)
| Control | Column |
|---------|--------|
| Txt_Roll_No | ROLL_NO |
| Txt_Name | NAME |
| Txt_Session_No | SESSION_NO |
| Txt_Form_Centre | FORM_CENTRE |
| Txt_Exam_Centre | EXAM_CENTRE |
| Txt_Region_No | REGION_NO |
| Txt_UserID | userid |
