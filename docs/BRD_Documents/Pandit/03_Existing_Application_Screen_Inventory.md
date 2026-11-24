# Existing Application Screen Inventory — Pandit

| Screen ID | Form | Menu | Purpose | Highlights |
|-----------|------|------|---------|------------|
| SCR-PND-01 | Frm_FormPandit | Transactions → Form → Pandit | Complex candidate + prior papers | Khand, UND, concession, 8 papers+oral, address, portion |
| SCR-PND-02 | Frm_PanditMarks | Transactions → Marks → Pandit | Marks grid/editor | NEW/OLD, khand column, save update |
| SCR-PND-03 | Frm_GenResultPandit | Processing → Generate Result → Pandit | Multi-path result | Khand I/II/Both/OLD |
| SCR-PND-04 | Frm_Pandit_CrossRef | Processing → Cross Reference | Cross ref | Dedicated Pandit processing |
| SCR-PND-05 | Frm_PanditRegister | Reports → Register → Pandit | Register | |
| SCR-PND-06 | Frm_StudentsPassingPandit | Reports → Students Passing Pandit | Passing list | |
| SCR-PND-07 | Frm_AttSheet | Attendance → Pandit | Att params | |
| SCR-PND-08 | Frm_ResultSheet / MarkSheet | Result/Mark → Pandit | Print params | |
| SCR-PND-09 | Frm_NameList | Name List → Pandit | | |
| SCR-PND-10 | Frm_regen_res | Supervisor → Regen → Pandit | Reset `RESGEN_PANDIT='N'` | |
| SCR-PND-11 | Shared shell/login/session/search | | | |

## Key FORM_PANDIT fields (UI-relevant)
ROLL_NO, NAME, SESSION_NO, FORM_CENTRE, EXAM_CENTRE, ROLL_NO_1..8, SESSION_NO_1..8, MARKS1..8, ORAL_ROLL_NO, ORAL_SESSION_NO, ORAL_MARKS, OPT_MARKS, KHAND1_TOTMARKS, KHAND2_TOTMARKS, TOT_MARKS, GRADE, UND_FLAG, UND_CLASS, SPECIAL_RANK, KHAND_APPEARING, BOTH_KHAND_FLAG, OTH_KHAND_ROLLNO, CONCESSION_FLAG, RES_DECL_FLAG, RESULT, ADD1..3, DUMMYCENTRECODE, userid, flgportion
