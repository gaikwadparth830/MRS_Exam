# Business Requirements Document — Balbodhini Examination System

| Item | Value |
| --- | --- |
| Document ID | BRD-BAL-001 |
| Version | 0.1 draft |
| Audience | Business owner, examination office, modernization team |
| Scope | Balbodhini exam and the shared masters required to run it |
| Replacement | Visual Basic 6 desktop application and Microsoft Access database |
| Target | React + TypeScript + Material UI, ASP.NET Core Web API, SQL Server |
| Rule | Existing Balbodhini behavior is retained unless a question in section 8 is answered with an approved change |

## 1. Purpose

The examination office records Balbodhini candidates, assigns roll numbers, records one written paper, calculates result and grade, and prints the operational documents used at centres and for certification.

The current application is a Windows desktop program bound to one Access file on the PC that runs it. The replacement must let authorized staff perform the same work from a browser, with one SQL Server database, without dropping a Balbodhini rule that the code actually implements.

## 2. Actors

| Actor | Confirmed identification | What they do |
| --- | --- | --- |
| Examination user | Any user id in `users` whose password matches | Form entry, marks, roll numbers, result generation, reports. No finer permission was found. |
| Supervisor | User id compared as `SUPER` in `forms/frmLogin.frm` `CmdOk_Click` | Same as an examination user, plus User Master, reset of the result-generated flag, update of marks after a result exists, and batch insert. The Supervisor menu is hidden for every other user. |
| Centre, region, and session data | Master records, not people | Drive validation and report grouping. |

There is no candidate self-service login in the source.

## 3. In scope

| Module | Business outcome |
| --- | --- |
| M1 Access and session | A user signs in. Work uses the session marked default (`defa = 'Y'`). A session flagged as backup can open another database file and hide operational menus. |
| M2 Organization masters | Regions, districts, centres, exam thresholds, paper thresholds, and sessions can be maintained. |
| M3 Candidate form | A Balbodhini application is added, viewed, corrected, deleted, and searched for the default session. |
| M4 Roll numbers | Roll numbers are assigned in centre order, can be cleared, and late forms with a null roll number can be numbered (Aur). |
| M5 Marks | Paper 1 is entered for candidates who do not yet have a result. |
| M6 Result | Pass or fail, grade, region rank, and optional overall first and second rank are calculated. |
| M7 Corrections | A supervisor can clear the lock flag and can change marks after a result exists, which clears the result so it can be generated again. |
| M8 Outputs | Attendance sheet, name list, result sheet, result sheet without name, certificate, register, region-wise register, centre roll ranges, user-wise form count, and centre-label export. |

## 4. Out of scope unless later approved

- Other examinations stored in the same source tree.
- Hall tickets and mark sheets. No Balbodhini menu exists (`forms/MDIForm1.frm`).
- A query that lists candidates who are two marks below a grade boundary. Grace is offered on the marks screen instead.
- Online payment, fees collection, and candidate portal. Exam Master has a `fees` field. Balbodhini form entry does not calculate or collect a fee.
- Changing pass marks, grade names, or rank wording without an answer to Q-002, Q-003, Q-005, and Q-011.

## 5. Business requirements

### M1 Access and session

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-001 | A person must sign in with a user id and password before any examination work. | `frmLogin.frm` `CmdOk_Click` | Confirmed |
| BR-002 | The user id `SUPER` is the supervisor. Every other valid user is a standard user. | `frmLogin.frm` `CmdOk_Click` | Confirmed. See Q-013. |
| BR-003 | Operational entry uses the session whose `defa` flag is `Y`. If none exists, Balbodhini form entry closes. | `Frm_FormBalbodhini.frm` `Form_Activate` | Confirmed |
| BR-004 | A session number is five characters or longer and ends in `1` or `2`. The month must be one of the four months stored in `Parameter`. | `Frm_Session.frm` `check_data` | Confirmed for session master |
| BR-005 | If the selected session is marked backup, the user may open another Access file and the operational menus are hidden. | `frmLogin.frm` `CmdOk_Click` | Confirmed. Web replacement must define an equivalent read-only historical session. See section 8. |

### M2 Organization masters

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-010 | The office maintains regions, including a seat-region number used when roll numbers are assigned. | `Frm_Region.frm` load query; `Frm_SetRollNo1.frm` `Form_Load` | Confirmed |
| BR-011 | The office maintains districts linked to a region, with a seat-district order used to walk centres. | `Frm_District.frm`; `Frm_SetRollNo1.frm` `Proc_ShowNextCentre` | Confirmed |
| BR-012 | The office maintains centres. A centre can be marked closed. | `Frm_Centre.frm` fields `pandit_flag`, `close_flag` | Confirmed. `pandit_flag` is not used by Balbodhini form entry. |
| BR-013 | Grade boundaries used for grace and for result come from the Exam master. The passing minimum for the paper comes from the Paper master. | `Frm_BalbodhiniMarks.frm` `Form_Load`; `Frm_GenResultBalbodhini.frm` `cmd_gen_result_Click` | Confirmed that masters are read. Which row is Balbodhini is unconfirmed (Q-002, Q-003). |
| BR-014 | English region name (`region_name_eng`) is required for the rank phrase printed into `special_rank`. It is not editable on Region Master. | `Frm_GenResultBalbodhini.frm` rank loop | Confirmed read. Maintenance screen missing. Q-005. |

### M3 Candidate form

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-020 | Staff can add, view, update, delete, and search a Balbodhini candidate in the default session. | `Frm_FormBalbodhini.frm` command buttons; `ClassMaster.Check_Button_Key` | Confirmed |
| BR-021 | A candidate has a name, gender `M` or `F`, the centre that submitted the form, the centre chosen for the exam, the region of the form centre, the session, and the user who saved a new row. | `check_data`, `Txt_Form_Centre_Validate`, `Cmd_save_Click` | Confirmed |
| BR-022 | Roll number is not typed on the form. It is assigned later. | `ClassMaster.Disable_Fields` comment dated 9/7/2003, and the roll-number lock for `Frm_FormBalbodhini` | Confirmed |
| BR-023 | The form centre must exist and must not be closed. Choosing it fills the region from centre, then district, then region, and copies that centre into the exam centre until the user changes it. | `Txt_Form_Centre_Change`, `Txt_Form_Centre_Validate` | Confirmed |
| BR-024 | The exam centre must exist. Its name and city are shown. Closed status is not checked. | `Txt_Exam_Centre_Validate` | Confirmed. Q-008. |
| BR-025 | The screen shows how many forms for the current form centre exist in the session. | `ClassMaster.CountFormsForCentre` | Confirmed |
| BR-026 | Staff can insert one new candidate between two existing names at the same form centre when their serial numbers are not consecutive. | `Cmd_Insert_Click`, `Frm_InsertRecordBetween.frm` | Confirmed |
| BR-027 | A supervisor can insert a roll-number range for one centre. The first and last names are stored. Names in between are stored as `-`. | `frm_insertbatch.frm` `cmdins_Click` | Confirmed |
| BR-028 | After the result-generated flag is `Y`, staff cannot add, insert, save, undo, update, or delete forms, and cannot edit marks. | `Proc_CheckResultGen`, `Frm_BalbodhiniMarks.frm` `Form_Load` | Confirmed as a lock. How the flag becomes `Y` is unconfirmed (Q-001). |
| BR-029 | Delete asks for confirmation and removes the row for that serial number and session. | `Cmd_delete_Click`, `ClassMaster.Delete_Record` | Confirmed |

### M4 Roll numbers

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-030 | Roll numbers are assigned for one seat region, one session, and one form centre, from a first number through a last number, in serial-number order. | `Frm_SetRollNo1.frm` `CmdSet_Click` | Confirmed |
| BR-031 | The range must be numeric, the last number must be greater than or equal to the first, and the centre must already have at least that many forms. | `CmdSet_Click` | Confirmed |
| BR-032 | The operator must confirm that the last candidate name matches the paper bundle (`Bitti`) before the numbers are kept. Otherwise the assignment is rolled back. | `CmdSet_Click` | Confirmed |
| BR-033 | After a successful assignment the screen moves to the next centre in seat-district and centre order that has forms, and proposes the next first roll number as one more than the current maximum in the seat region. | `Proc_ShowNextCentre` | Confirmed |
| BR-034 | Aur numbering assigns numbers only to forms whose roll number is still null, starting at one more than the maximum roll number in the seat region. | `Frm_SetRollNoAur.frm` `CmdSet_Click`, `TxtCentre_Change` | Confirmed |
| BR-035 | Staff can clear roll numbers from a chosen centre onward inside that centre’s region, from that centre’s minimum roll number upward. | `Frm_BlankRollNo.frm` `cmd_blank_Click` | Confirmed |

### M5 Marks

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-040 | Marks are entered for the default session, one region, from a starting roll number, and only for candidates who do not yet have a result. | `Frm_BalbodhiniMarks.frm` record source and `CmdShow_Click` | Confirmed |
| BR-041 | Balbodhini has one paper. The total stored with the mark is the numeric value of Paper 1. | Grid columns `marks1` and `tot_marks`; `DataGrid1_AfterColEdit` | Confirmed |
| BR-042 | A mark is a number from 0 to 100, or `A` for absent. | `DataGrid1_AfterColEdit` | Confirmed |
| BR-043 | If the entered mark is 1 or 2 below a class or distinction boundary, the operator is asked whether to add that many grace marks. | `DataGrid1_AfterColEdit` | Confirmed. Boundary row is Q-002. |
| BR-044 | The grid saves when the operator leaves the edited cell. The screen tells the operator to click the next row to save. | Label on `Frm_BalbodhiniMarks.frm` | Confirmed as operator instruction |

### M6 Result

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-050 | Result is generated for one selected region and the default session, only for rows that have Paper 1 and do not yet have a result. | `cmd_gen_result_Click` | Confirmed |
| BR-051 | Absent (`A`) is Fail with grade `A`, and total marks are cleared. | Same procedure | Confirmed |
| BR-052 | A candidate whose total is below the exam minimum fails with grade `X`. A candidate whose Paper 1 is below the paper minimum also fails with grade `X`. | Same procedure | Confirmed. Threshold values are Q-003. |
| BR-053 | A passing candidate receives grade `Vi. Yo.` at or above distinction, otherwise `1`, `2`, or `3` by the class boundaries. | `Select Case li_tot` | Confirmed codes. Meaning of `Vi. Yo.` is Q-011. `class3_marks` is used for grace prompts and is not used in this grade selection. |
| BR-054 | If Paper 1 is blank after the absent and total checks, result and grade are stored as `-`. | Same procedure | Confirmed |
| BR-055 | Among passing candidates in the region, everyone tied for the highest total receives `special_rank` = `FIRST IN` plus the English region name. | Rank loop | Confirmed. Q-005. |
| BR-056 | Find Ranks, across all passing candidates in the session, marks the highest total as `FIRST` and the next distinct total as `SECOND`, replacing any region rank on those rows. | `Cmd_ranks_Click` | Confirmed |
| BR-057 | The generation screen shows roll number, Paper 1, total, grade, rank, and result for the region. The grid is not editable. | `DataGrid1` `AllowUpdate = 0` | Confirmed |
| BR-058 | Each generation stores a run number on the rows it processes. | `resgen_run` assignment | Confirmed that a number is stored. The starting number is Q-006. |

### M7 Corrections

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-060 | A supervisor can reset `resgen_balbodhini` to `N` for the default session after confirmation, so forms and marks can be changed and the result generated again. | `Frm_regen_res.frm` | Confirmed |
| BR-061 | A supervisor can open a candidate who already has a result, change Paper 1, and clear grade, result, run number, and special rank so the result can be generated again. | `Frm_RegenResult.frm` `CmdSave_Click` for `Balbodhini` | Confirmed |
| BR-062 | If that candidate already has a special rank, the same clear is applied to every Balbodhini row in that session and region, and the operator is told to regenerate the region. | Same procedure | Confirmed |

### M8 Outputs

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-070 | An attendance sheet can be printed for one exam centre or for the centres selected through region and district, for the default session. | `Frm_AttSheet.frm` | Confirmed |
| BR-071 | A name list can be printed for every exam centre or for one exam centre. | `Frm_NameList.frm` | Confirmed |
| BR-072 | A result sheet can be printed with names, or without names, for one centre, one region, or the loaded set. A result date is required. | `Frm_ResultSheet.frm` `CmdPrintPreviewBalbodhini_Click` | Confirmed |
| BR-073 | A certificate can be printed for one session and one region, for all roll numbers or a from-to range. The year printed is the first four digits of the session number. | `Frm_Certificate_Printing.frm` `Cmd_balbodhini_Click` | Confirmed |
| BR-074 | A register can be printed for a chosen session after the operator confirms, with counts of candidates, passes, fails with grade `X`, absents with grade `A`, and rows whose result is still null. Pass percent is passes divided by all candidates in the session. | `Frm_RGOtherThanPandit.frm` `ProcPrintRegister` | Confirmed |
| BR-075 | A region-wise register can be printed for the default session and one region. | `Frm_RegionwiseRegister.frm` `CmdBalbodhini_Click` | Confirmed |
| BR-076 | A centre-wise list shows contiguous roll-number ranges at each exam centre. | `Frm_CentreWiseNoOfStudent.frm` `ProcPrint` | Confirmed |
| BR-077 | A supervisor report counts how many Balbodhini forms each user entered in the default session. | `Frm_Userwiselist_Totforms.frm` `Cmd_Printpre_Click` | Confirmed for this build |
| BR-078 | Centre address labels can be exported to a text file for centres that submitted any form, including a Balbodhini form, for a selected session. | `Frm_ExportData.frm` `CmdExport_Click` | Confirmed. The menu caption says FoxPro. The code writes `myfile.txt`. |

## 6. Business rules that must not be invented

The following are not specified by the code and must not be added during the build:

- A second or third Balbodhini paper, oral marks, or an optional language.
- A pass mark other than the values stored on the confirmed Exam and Paper rows.
- Eligibility by age, prior exam, or photograph.
- Duplicate-name rejection. Search can find a name. Save does not reject a duplicate name.
- Automatic setting of the result-generated flag when generation finishes.
- A Balbodhini hall ticket or individual mark sheet.

## 7. Non-functional business expectations

| ID | Expectation | Note |
| --- | --- | --- |
| BR-090 | Marathi or Devanagari names and report headings must remain printable. | Legacy font is `DV-TTAakash`. Target must use Unicode. A conversion of existing names is a separate data task and is not specified in code. |
| BR-091 | More than one staff member will use the system at the same time. | The desktop program opens one Access file. `ClassMaster` comments mention a multi-user requery. Web design must use SQL Server locking rather than copying Access behavior that loses updates. |
| BR-092 | Historical sessions remain available. | Backup login hides entry menus. The web system should open a past session as read-only rather than swapping database files. This is a proposed change and needs approval. |
| BR-093 | Passwords must not be stored with the legacy substitution cipher. | Proposed security change. Q-012. |

## 8. Decisions required before build

Answer the questions Q-001 through Q-014 in `00-Source-Inventory-and-Overview.md`. Until Q-001, Q-002, and Q-003 are answered, result calculation and the post-result lock must not be coded as if the thresholds and the lock were known.

## 9. Success criteria for the replacement

1. A standard user can complete BR-020 through BR-035 and BR-040 through BR-058 for one session without a desktop install.
2. A supervisor can complete BR-060 through BR-062 and BR-077.
3. Each report in BR-070 through BR-076 can be produced for the same filters as the legacy screen.
4. A candidate calculated under the signed-off thresholds receives the same result, grade, and rank text as the legacy program for the same marks.
5. No other examination is created, migrated, or shown in the Balbodhini application.
