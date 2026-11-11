# Balbodhini Exam — Source Inventory and Application Overview

| Item | Value |
| --- | --- |
| Document ID | INV-BAL-001 |
| Scope | Balbodhini exam only |
| Status | Draft for business review |
| Source reviewed | VB6 project `Project1.vbp` (executable name `balbodhini22122017.exe`) |
| Database file present | `database/MRSEXAM.mdb` |
| Schema status | Columns below are **confirmed from SQL in source**. Data types, nullability, indexes, and relationships were **not confirmed** from the database. Microsoft ACE OLEDB reported the file as an unrecognized database format on this machine. |

This build is a multi-exam desktop system. In `forms/MDIForm1.frm`, menu items for Pandit, Praveen, Prabodh, Subodh, Praveshika, and Prathamik are design-time disabled. Balbodhini menu items are enabled. Documents in this folder describe Balbodhini and the shared masters it depends on. Other exams are out of scope.

## 1. What the application does

Confirmed from screen captions and menu text (`forms/MDIForm1.frm`):

The application is a pre-exam and result system for the Balbodhini examination. Staff enter candidate forms for the default session, assign roll numbers, enter one paper’s marks, generate pass or fail and a grade, then print attendance sheets, name lists, result sheets, certificates, registers, and centre summaries.

Candidate names and several report headings use the font `DV-TTAakash` (Devanagari). Report captions in the designer are stored in that font’s encoding and are not transcribed here as Marathi text.

## 2. Runtime dependencies

Confirmed from `Project1.vbp` and form headers.

| Dependency | Where used |
| --- | --- |
| Microsoft ActiveX Data Objects 2.0 | All data access |
| Microsoft Data Environment 1.0 and Data Report Designer 6.0 | Reports |
| Microsoft DAO 3.51 and RDO 2.0 | Project references. Balbodhini paths reviewed use ADO, not DAO, for form save. |
| `MSCOMCTL.OCX` | MDI toolbar and status bar |
| `MSADODC.OCX`, `MSDATGRD.OCX` | Marks grid and result grid |
| `COMDLG32.OCX` | Login backup file picker |
| `MSFLXGRD.OCX`, `TABCTL32.OCX` | Project objects. Not used by the Balbodhini screens reviewed. |
| ODBC driver `Microsoft Access Driver (*.mdb)` | `classmodules/Module1.bas` opens `GS_dbPath` |
| Design-time DSN name `Balbodhini` | `reports/DataEnvironment1.Dsr` connection source. Runtime connection is replaced in `Module1`. |
| Database file | `App.Path & "\Database\MRSEXAM.mdb"` in `forms/frmLogin.frm` `Form_Load` |
| Font `DV-TTAakash` | Name entry and several combos |

The Access connection uses a hardcoded database password in `Module1`. The password value is not repeated in these documents. It must be moved to a secret store and rotated before go-live.

## 3. Balbodhini source inventory

### 3.1 Screens owned by Balbodhini

| Screen | File | Menu |
| --- | --- | --- |
| Examination form entry | `forms/Frm_FormBalbodhini.frm` | Transactions > Examination Form Entry > For Balbodhini |
| Marks entry | `forms/Frm_BalbodhiniMarks.frm` | Transactions > Marks Entry > For Balbodhini |
| Generate result | `forms/Frm_GenResultBalbodhini.frm` | Processing > Generate Result > For Balbodhini |

### 3.2 Shared screens used by Balbodhini

| Screen | File | Balbodhini entry |
| --- | --- | --- |
| Login | `forms/frmLogin.frm` | All users. User id `SUPER` sees the Supervisor menu. |
| Splash | `forms/frm_Splash.frm` | Startup form (`Startup="frm_Splash"`). |
| Main shell | `forms/MDIForm1.frm` | Menus, roll-number dispatch, register totals in `ProcPrintRegister` (the live register path is `Frm_RGOtherThanPandit`). |
| Search | `forms/Frm_Search.frm` | Name or roll number plus region for `Frm_FormBalbodhini`. |
| Insert between two names | `forms/Frm_InsertRecordBetween.frm` | Case `Frm_FormBalbodhini`. |
| Batch insert of placeholder names | `forms/frm_insertbatch.frm` | Exam combo value that maps to `form_balbodhini`. Menu: Supervisor > Insert batch of records with name = "-". |
| Set roll numbers | `forms/Frm_SetRollNo1.frm` | When `Sub_SetRollNos_Balbodhini` is checked. Table name is `form_` plus caption `Balbodhini`. |
| Aur roll numbers | `forms/Frm_SetRollNoAur.frm` | When `Sub_AurRollNoBalbodhini` is checked. Numbers only rows where `roll_no` is null. |
| Blank roll numbers | `forms/Frm_BlankRollNo.frm` | Called from set-roll-number screen. Updates `form_` plus exam caption. |
| Reset result flag | `forms/Frm_regen_res.frm` | Sets `session.resgen_balbodhini = 'N'`. |
| Correct marks after result | `forms/Frm_RegenResult.frm` | Exam value `Balbodhini`. One paper only. |
| Attendance sheet | `forms/Frm_AttSheet.frm` | `InsertRecord(..., "Balbodhini")` and report `Rpt_AttSheetPrathamik_Balbodhini`. |
| Name list | `forms/Frm_NameList.frm` | `Cmd_NameListBalbodhini_Grouping`, report `Rpt_NameListBalbodhini`. |
| Result sheet | `forms/Frm_ResultSheet.frm` | `CmdPrintPreviewBalbodhini_Click`. Named and no-name reports. |
| Certificate | `forms/Frm_Certificate_Printing.frm` | `Cmd_balbodhini_Click`. |
| Register | `forms/Frm_RGOtherThanPandit.frm` | `GS_RGForExam = "Balbodhini"`. |
| Region-wise register | `forms/Frm_RegionwiseRegister.frm` | `CmdBalbodhini_Click`. |
| Centre-wise student ranges | `forms/Frm_CentreWiseNoOfStudent.frm` | `ProcPrint("Balbodhini")`. |
| User-wise form count | `forms/Frm_Userwiselist_Totforms.frm` | In this build only the Balbodhini count is executed. Other exam inserts are commented out. |
| Export centre labels | `forms/Frm_ExportData.frm` | `form_balbodhini` is one branch of a union of form centres. Output file `App.Path & "\myfile.txt"`. |
| Region, district, centre, exam, paper, session, user master | `Frm_Region.frm`, `Frm_District.frm`, `Frm_Centre.frm`, `Frm_Exam.frm`, `Frm_Paper.frm`, `Frm_Session.frm`, `Frm_Usermast.frm` | Shared masters. |
| Select session | `forms/Frm_SelectSession.frm` | Utilities > Select Session. Not re-read in full. It is the menu companion to the toolbar Select Session button. |
| Continue prompt | `forms/FrmProcess.frm` | Shown before register print. Continue flag gates printing. |

### 3.3 Shared code

| File | Balbodhini role |
| --- | --- |
| `classmodules/Module1.bas` | Connection, `GS_dbPath`, `GS_Username`, `RS_General`, `RsSource`, `GS_Delete`, `GS_AfterSave`. |
| `classmodules/ClassMaster.cls` | Navigation, save, update, delete, field lock, form count for `Frm_FormBalbodhini`. A second copy exists at `forms/ClassMaster.cls`. The project reference should be confirmed before build. Behavior cited in these documents is from `classmodules/ClassMaster.cls`. |
| `classmodules/ClassCommon.cls` | Required-field checks and button enablement, including Insert on the Balbodhini form. |

### 3.4 Reports

| Report | Files | Command in `reports/DataEnvironment1.Dsr` |
| --- | --- | --- |
| Name list | `reports/Rpt_NameListBalbodhini.Dsr` | `Cmd_NameListBalbodhini`, parameter `Session_no` |
| Result sheet | `reports/Rpt_ResultSheetBalbodhini.Dsr` | `Cmd_ResultBalbodhini`, parameter `session_no` |
| Result sheet without name | `reports/Rpt_ResultSheetBalbodhininoname.Dsr` | Same command, different layout |
| Register | `reports/Rpt_RGBalbodhini.Dsr` | `Cmd_RGBalbodhini`, parameter `Session` |
| Certificate | `reports/Rpt_Certificate_balbodhini.Dsr` | `Cmd_Certificate_Balbodhini`, parameters `session` and `region` |
| Attendance | `reports/Rpt_AttSheetPrathamik_Balbodhini.Dsr` | Filled from temp table `attsheet`, not from a Balbodhini command |

Command SQL text is stored in `reports/DataEnvironment1.dsx` as a designer resource. The text was not recovered as readable SQL. Field lists in the data-mapping document are taken from the command field definitions in the `.Dsr` file. That is confirmed metadata, not a reconstructed query.

### 3.5 Files present but not part of the running Balbodhini menu

| File | Finding |
| --- | --- |
| `forms/Frm_setdist.frm` | Updates `form_balbodhini.district_name` and `region_no` where `region_no` is null. Caption is `Form1`. It is not listed in `Project1.vbp`. Treat as an unwired utility. |
| `forms/Frm_NameSearchBalbodhini.frm` | Empty form named `Form1` with one text box. Not in `Project1.vbp`. |
| `forms/Frm_SetRollNo.frm` and `Frm_SetRollNo_FromToCentre.frm` | Older or alternate roll-number screens. Balbodhini menu calls `Frm_SetRollNo1` through `ProcSetRollnoCheck`. |
| Hall ticket and mark sheet menus | No Balbodhini item. Do not add them unless the business asks. |
| Query > List of students losing a grade by 2 marks | No Balbodhini item. Grace is prompted during marks entry instead. |

### 3.6 Not in scope

Pandit, Praveen, Prabodh, Subodh, Praveshika, and Prathamik forms, marks, results, and reports, except where a shared procedure receives the exam name `Balbodhini`.

## 4. Confirmed workflow

```text
Login
  -> default session must exist (defa = 'Y')
  -> enter Balbodhini form (name, gender, form centre, exam centre)
  -> optional insert between two existing names, or supervisor batch insert
  -> set roll numbers by form centre and seat region
  -> optional Aur numbering for rows with a null roll number
  -> enter Paper 1 marks (or A for absent)
  -> generate result for one region
  -> optional state-wide first and second rank
  -> print attendance, name list, result sheet, certificate, register, centre ranges
```

When `session.resgen_balbodhini = 'Y'`, form maintenance buttons and the marks grid are disabled. The reviewed source sets that flag only to `N` (`forms/Frm_regen_res.frm`). No statement was found that sets it to `Y`. See open question Q-001.

## 5. Open questions that block a faithful build

| ID | Question | Why it matters |
| --- | --- | --- |
| Q-001 | What sets `session.resgen_balbodhini` to `Y`, and when should forms and marks lock? | Code only resets it to `N`. |
| Q-002 | Which `exam` row and which `paper` row are Balbodhini? Marks grace reads `exam_no = 1`. Result generation reads `exam_no = 2` and `paper_no = 1`. | Thresholds may be applied from the wrong master row. |
| Q-003 | What are the live values of `min_marks`, `min_total_khand1`, `class1_marks`, `class2_marks`, `class3_marks`, and `dist_marks` for Balbodhini? | The code does not hardcode the numbers, except a default of 105 on the Exam Master new record, and that default is not Balbodhini-specific. |
| Q-004 | Is serial number `max(srno) + 3` intentional so a row can be inserted between two candidates? | Confirmed in save and batch insert. Business reason is not written in code. |
| Q-005 | Should region rank text stay `FIRST IN` plus `region.region_name_eng`, and should Find Ranks overwrite it with `FIRST` and `SECOND`? | Both behaviors exist. `region_name_eng` is not on the Region Master screen. |
| Q-006 | Is the result-generation run number supposed to start at 1? The code stores `calculated run + 1`. | First generation stores 2 if the previous maximum is null. |
| Q-007 | Result generation reads region number as the first character of the combo text. Certificate reads the text before a comma. Result sheet reads the rightmost five characters. Which region-list format is correct? | A region number of 10 or more is unsafe in result generation. |
| Q-008 | Should a closed centre be rejected only as a form centre, as coded, or also as an exam centre? | `close_flag` is checked only in `Txt_Form_Centre_Validate`. |
| Q-009 | Does Balbodhini need a hall ticket or a mark sheet? Neither menu exists. | Do not invent them. |
| Q-010 | Is `Frm_setdist` still required? | It is not in the project file. |
| Q-011 | What does grade `Vi. Yo.` mean on the certificate, and what Marathi heading must each report show? | Grade code is confirmed. Display wording is in a legacy font and was not decoded. |
| Q-012 | May the login cipher be replaced by a one-way password hash? | Required for a web application. This changes stored passwords. |
| Q-013 | Is user id `SUPER` the only privileged user, with every other valid user allowed to perform every enabled menu action? | That is what the code does. No other role flags were found. |
| Q-014 | Should the database indexes and relationships be taken from a repaired copy of `MRSEXAM.mdb` before SQL Server design is frozen? | Current mapping has no confirmed keys. |

## 6. How to read the other documents

| Document | Contents |
| --- | --- |
| `01-Business-Requirements-Document.md` | Why the system exists, actors, business requirements `BR-*`, and in-scope modules |
| `02-Functional-Requirements-Specification.md` | Testable behavior `FR-*` |
| `03-Screen-Inventory.md` | Each screen, control, and operation |
| `04-Business-Rules-and-Workflows.md` | Rules `RULE-*` and workflows |
| `05-Access-to-SQL-Server-Data-Mapping.md` | Tables and columns evidenced by code |
| `06-React-Page-and-Component-Inventory.md` | Target pages |
| `07-ASPNET-Core-API-Specification.md` | Target endpoints |
| `08-Target-Architecture.md` | Technical design |
| `09-Requirements-Traceability-Matrix.md` | Legacy feature to new implementation |
| `10-Test-Scenarios-and-Acceptance-Criteria.md` | `TC-*` |
| `11-Implementation-Plan.md` | Milestones after sign-off |

Legend used throughout: **Confirmed** means the behavior is in the cited procedure. **Unconfirmed** means the code does not state it. These documents do not fill that gap with a guessed rule.
