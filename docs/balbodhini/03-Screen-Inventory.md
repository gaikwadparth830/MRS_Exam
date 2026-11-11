# Existing Application Screen Inventory — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | SCR-BAL-001 |
| Status | Draft |
| Scope | Screens a Balbodhini user can open from the enabled menus, plus supervisor screens |

Operations: A add, E edit, D delete, V view, S search, P print, X other.

Menu enabled means the item does not have `Enabled = 0` in `forms/MDIForm1.frm`. Other exams are listed only when needed to show they are switched off.

## 1. Shell

| ID | Screen | File | Purpose | Operations | Notes |
| --- | --- | --- | --- | --- | --- |
| SCR-001 | Splash | `forms/frm_Splash.frm` | Startup | V | `Project1.vbp` startup object. Not re-analyzed control by control. |
| SCR-002 | Login | `forms/frmLogin.frm` | Authenticate and optionally open a backup database | S | User, password, session. Cipher check in `CmdOk_Click`. |
| SCR-003 | Main window | `forms/MDIForm1.frm` | Menus, toolbar, status bar | X | Toolbar: form entry (Balbodhini item enabled), select session, exit. Status bar shows a message, date, and time. Caption: Pre-Exam & Result System. |

## 2. Enabled Balbodhini menus

| Menu path | Opens | Screen ID |
| --- | --- | --- |
| Transactions > Examination Form Entry > For Balbodhini | `Frm_FormBalbodhini` | SCR-010 |
| Transactions > Marks Entry > For Balbodhini | `Frm_BalbodhiniMarks` | SCR-020 |
| Processing > Generate Result > For Balbodhini | `Frm_GenResultBalbodhini` | SCR-030 |
| Processing > Set Roll No's > For Balbodhini | `Frm_SetRollNo1` | SCR-040 |
| Processing > Aur Forms : Set Roll Numbers > For Balbodhini (Aur) | `Frm_SetRollNoAur` | SCR-041 |
| Processing > Export Centre Data to Foxpro | `Frm_ExportData` | SCR-070 |
| Reports > Attendance Sheet > For Balbodhini | `Frm_AttSheet` | SCR-050 |
| Reports > Result Sheet > For Balbodhini | `Frm_ResultSheet` | SCR-051 |
| Reports > Result Sheet > For Balbodhini (no name) | `Frm_ResultSheet` | SCR-052 |
| Reports > Certificate > For Balbodhini | `Frm_Certificate_Printing` | SCR-053 |
| Reports > Name List > For Balbodhini | `Frm_NameList` | SCR-054 |
| Reports > Register > Balbodhini | `Frm_RGOtherThanPandit` | SCR-055 |
| Reports > Register > RegionwiseRegister | `Frm_RegionwiseRegister` | SCR-056 |
| Reports > Centre-wise Number of Students Appearing | `Frm_CentreWiseNoOfStudent` | SCR-057 |
| Reports > Userwise Examwise Total Number of Forms Entered | `Frm_Userwiselist_Totforms` | SCR-058 |
| Supervisor > Reset Result Generated Flag > For Balbodhini | `Frm_regen_res` | SCR-060 |
| Supervisor > Update Marks | `Frm_RegenResult` | SCR-061 |
| Supervisor > Insert batch of records with name = "-" | `frm_insertbatch` | SCR-062 |
| Supervisor > User Master | `Frm_Usermast` | SCR-008 |

Cross Reference (`Sub_CrossRef`) is enabled and opens the Pandit cross-reference screen. It is not a Balbodhini function. Leave it out of the Balbodhini application.

## 3. SCR-010 Examination form

File: `forms/Frm_FormBalbodhini.frm`. Caption: Form Entry for 'Balbodhini' Exam.

| Control | Label or caption | Behavior |
| --- | --- | --- |
| `Txt_Roll_No` | Roll Number | Shown, locked during new and update. Not saved from the insert field list as a user entry. Navigation displays it. |
| `Txt_Name` | Name | Required. |
| `Txt_Form_Centre` | Form Filled From Centre | Required. Validated. |
| `Txt_FormCentre_Name` | (display) | Centre name and city. |
| `Txt_Exam_Centre` | Centre Chosen For Exam | Required. Validated. Copied from form centre while editing. |
| `Txt_ExamCentre_Name` | (display) | Centre name and city. |
| `Txt_Region_No` | (no separate caption in the caption list; region name caption is Region Name) | Filled from the form centre’s district. |
| `Txt_Region_Name` | Region Name | Display from `region`. |
| `Txt_Gender`, `OptMale`, `OptFemale` | Gender, Male, Female | `M` or `F`. |
| `Txt_Session_No` | Session | Default session. Locked. |
| `Txt_SrNo` | (hidden) | Serial number. |
| `Txt_Userid` | (hidden) | Signed-in user on new save. |
| `LblCount` | No of Forms entered for the centre is | Count for form centre and session. |
| `Cmd_First`, `Cmd_Prev`, `Cmd_Next`, `Cmd_Last` | First, Previous, Next, Last | V |
| `Cmd_New`, `Cmd_Update`, `Cmd_Save`, `Cmd_Delete`, `Cmd_Undo`, `Cmd_Search`, `Cmd_Exit` | New, Update, Save, Delete, Undo, Search, Exit | A E D S |
| `Cmd_Insert` | Insert | Opens SCR-011 |

Search screen SCR-012 is `forms/Frm_Search.frm`, opened by `ClassMaster` case `Search`. For this form the choices are applicant name, or roll number with region.

## 4. SCR-011 Insert between

File: `forms/Frm_InsertRecordBetween.frm`. Modal.

| Control | Behavior |
| --- | --- |
| Name before and name after | Filled from the current row and the next row when Insert is clicked on the form. |
| Insert | Checks both names, refuses identical names, refuses a serial gap of 1, sets `Insert = True` and `Prev_SrNo`. |
| Exit | Closes without insert. |

## 5. SCR-020 Marks entry

File: `forms/Frm_BalbodhiniMarks.frm`. Caption: Balbodhini Marks Entry Form.

| Control | Behavior |
| --- | --- |
| `Txt_Session_No` | Default session. Locked. |
| `CmbRegion` | Region names from `region`. |
| `Txt_Roll_No` | Starting roll number. Hidden until a region is chosen. |
| `CmdShow` | Applies the filter and shows the grid. |
| `DataGrid1` | Columns Roll No, session_no, Paper 1, Total Marks, region_no. Paper 1 is the edited column. |
| `Cmdexit` | Closes. |
| Instruction label | Click the next row to save the previous row. |

## 6. SCR-030 Generate result

File: `forms/Frm_GenResultBalbodhini.frm`. Caption: Generate Result For Balbodhini.

| Control | Behavior |
| --- | --- |
| `cmd_gen_result` | Generate Result. |
| `Cmb_region` | `region_no` plus space plus `region_name`. |
| `Lblsession` | Caption prefixed with the default session number. |
| `Cmd_ranks` | Find Ranks. |
| `cmd_print` | Caption: Show students with duplicate ranks. No procedure. |
| `Cmdexit` | Unload. |
| `DataGrid1` | Read-only. roll no, marks1, total, grade, rank, result. Hidden until generation finishes. |

## 7. SCR-040 and SCR-041 Roll numbers

| Control on set-roll screen | Behavior |
| --- | --- |
| Session combo | All session numbers. |
| Region combo | Seat region plus the names of regions in that seat region. |
| Centre | Form centre being numbered. |
| First and last roll number | Inclusive range. |
| Last name label | Name on the last numbered row, for the Bitti check. |
| Set | Assigns numbers inside a transaction. |
| Blank | Opens SCR-042 `Frm_BlankRollNo`. |

Aur screen (`Frm_SetRollNoAur.frm`) asks for last roll number only. Start roll number is calculated. Centre is validated against the centre master and against the selected seat region.

## 8. SCR-050 Attendance

File: `forms/Frm_AttSheet.frm`. Balbodhini shows `CmdPrintBalbodhini` and the heading for that exam.

| Control | Behavior |
| --- | --- |
| Session and month | From the default session. |
| Region list, district list, centre combo | Centres that are an exam centre on a Balbodhini form for the session. |
| Print | Builds `attsheet` and shows `Rpt_AttSheetPrathamik_Balbodhini`. |

## 9. SCR-051 and SCR-052 Result sheet

File: `forms/Frm_ResultSheet.frm`. Same screen for named and no-name output. Which report opens depends on `Sub_ResultSheetForBalbodhini` versus `Sub_ResultBalbodhininoname`.

| Control | Behavior |
| --- | --- |
| Session, month | From the default session. |
| Result date | Required valid date. Printed on the report. |
| Centre option and centre combo | Filters by centre number. |
| Region option and region combo | Filters by the rightmost five characters. |
| Print preview | `CmdPrintPreviewBalbodhini`. |

Report field list is in the data-mapping document. Layout captions are in `reports/Rpt_ResultSheetBalbodhini.Dsr` in the legacy font.

## 10. SCR-053 Certificate

File: `forms/Frm_Certificate_Printing.frm`. For Balbodhini only `Cmd_balbodhini` is visible.

| Control | Behavior |
| --- | --- |
| Session combo | All sessions. |
| Region combo | `region_no`, comma, `region_name`. Region number is the text before the comma. |
| All or range | Range uses from roll and to roll. |
| Print | `Rpt_Certificate_balbodhini`. |

## 11. SCR-054 Name list

File: `forms/Frm_NameList.frm`.

| Control | Behavior |
| --- | --- |
| All or one centre | One centre filters `Exam_centre`. |
| Centre combo | Distinct exam centres for the session. |
| Print | `Rpt_NameListBalbodhini`. |

## 12. SCR-055 Register

File: `forms/Frm_RGOtherThanPandit.frm`. Session combo. Print preview runs the Balbodhini branch because `GS_RGForExam` was set to `Balbodhini` before the form was shown.

`FrmProcess` asks whether to continue. Cancel stops the print.

## 13. SCR-056 Region-wise register

File: `forms/Frm_RegionwiseRegister.frm`. Button `CmdBalbodhini`. Region combo is a region name. Session is the default session only.

## 14. SCR-057 Centre-wise students

File: `forms/Frm_CentreWiseNoOfStudent.frm`. Button `CmdPrintBalbodhini` calls `ProcPrint("Balbodhini")`. Session display comes from the default session.

## 15. SCR-058 User-wise form count

File: `forms/Frm_Userwiselist_Totforms.frm`.

| Control | Behavior |
| --- | --- |
| All users or one user | One user uses the user combo filled from `users`. |
| Print preview | Rebuilds `tot_forms` for Balbodhini only and shows `Rpt_TotalForms`. |

## 16. SCR-060 Reset flag

File: `forms/Frm_regen_res.frm`. Shows the default session and the heading for Balbodhini. Confirm sets the flag to `N`.

## 17. SCR-061 Update marks

File: `forms/Frm_RegenResult.frm`. Exam combo includes Balbodhini. For that value only Paper 1 and total are visible. Display and Save as in FR-071 to FR-074.

## 18. SCR-062 Batch insert

File: `forms/frm_insertbatch.frm`. Supervisor menu.

| Control | Behavior |
| --- | --- |
| Exam combo | The Devanagari item mapped in code to `form_balbodhini`. |
| Start roll, end roll, start name, end name, region, centre | Written as specified in FR-036. |
| Session | Default session. Locked. |

## 19. Shared master screens used by Balbodhini

| ID | Screen | File | Fields the Balbodhini flow reads |
| --- | --- | --- | --- |
| SCR-004 | Region | `forms/Frm_Region.frm` | `region_no`, `region_name`, `seat_region_no` |
| SCR-005 | District | `forms/Frm_District.frm` | `district_name`, `region_no`, `seat_district_no` |
| SCR-006 | Centre | `forms/Frm_Centre.frm` | `centre_no`, `centre_name`, `city`, `district_name`, `close_flag`, address fields for export |
| SCR-007 | Exam | `forms/Frm_Exam.frm` | Class and distinction marks. Also `min_total_khand1`, which is not on the screen. |
| SCR-008 | User | `forms/Frm_Usermast.frm` | `USERID`, `PASSWORD`, `KEY` |
| SCR-009 | Paper | `forms/Frm_Paper.frm` | `paper_no`, `exam_no`, `min_marks` |
| SCR-013 | Session | `forms/Frm_Session.frm` | `session_no`, `month`, `defa`, `resgen_balbodhini`, `backup` |

Standard master buttons are First, Previous, Next, Last, New, Update, Save, Delete, Undo, Search, Exit, implemented by `ClassMaster`.

## 20. Screens reviewed and excluded

| File | Reason |
| --- | --- |
| `forms/Frm_setdist.frm` | Not in the project file. |
| `forms/Frm_NameSearchBalbodhini.frm` | Not in the project file. Empty. |
| Hall ticket and mark sheet forms | No enabled Balbodhini menu. |
| Other exam forms | Disabled menus. |
