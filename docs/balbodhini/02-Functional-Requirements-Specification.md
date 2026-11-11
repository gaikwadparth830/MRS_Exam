# Functional Requirements Specification — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | FRS-BAL-001 |
| Version | 0.1 draft |
| Related | BRD-BAL-001, rules in `04-Business-Rules-and-Workflows.md` |
| Status | Draft. Requirements that depend on an open question say so. |

Each requirement is one behavior the new system must implement. Source citations point at the legacy procedure that establishes the behavior.

## M1 Authentication and session

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-001 | The system authenticates a user id and password against the user store. User id match is case-insensitive on entry and stored in upper case by the legacy login lookup. | Wrong password is rejected. Unknown user is rejected. Blank user or password is rejected. | `frmLogin.frm` `CmdOk_Click`, `TXTUSER_NAME_Validate` |
| FR-002 | The signed-in user id `SUPER` receives supervisor functions. Any other authenticated user does not. | Supervisor menus or pages are absent for a non-SUPER user. | `CmdOk_Click` |
| FR-003 | The system has one current session, the row with `defa = 'Y'`. Form entry, marks, and result generation use that session and do not let the operator type a different session number on those screens. | Session control is read-only on form entry and marks. | `Frm_FormBalbodhini.Form_Activate`, `Frm_BalbodhiniMarks.Form_Load` |
| FR-004 | If no default session exists, candidate form entry does not open. | Message equivalent to "Session not selected." | `Form_Activate` |
| FR-005 | Session master enforces: numeric, not negative, length at least 5, last digit `1` or `2`, month is one of `Parameter.session_month11`, `session_month12`, `session_month21`, or `session_month22`. Result date, when entered, must be a valid date. | Invalid session is not saved. | `Frm_Session.frm` validation |
| FR-006 | Utilities can change which session is the default. | After the change, FR-003 reads the new session. | Menu `Sub_SelectSession`. The select-session form body was not fully re-verified in this pass. Confirm during master-module review. |
| FR-007 | When a session is flagged backup, opening it does not allow form entry, marks, processing, or the listed report menus. | Historical data is viewable only through the approved read-only path. | `frmLogin.frm` hides `Mnu_Masters`, `Mnu_Processing`, `Mnu_Transactions`, `Mnu_Utilities`, toolbar, attendance, certificate, hall ticket, mark sheet, and name list. Result sheet and register are not in that hide list. Treat the exact report set as confirmed only for the menus named in code. |

## M2 Masters

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-010 | Region master maintains `region_no`, `region_name`, and `seat_region_no`. | Create, update, delete, search, and navigation work for regions. | `Frm_Region.frm` load query |
| FR-011 | The system stores `region_name_eng` because result ranking writes it into `special_rank`. Provide a field for it. | Rank text uses the English name. | `Frm_GenResultBalbodhini.frm`. Field is not on the current Region screen. |
| FR-012 | District master maintains `district_name`, `region_no`, `district_city`, `short_name`, and `seat_district_no`. | A district belongs to one region. | `Frm_District.frm` |
| FR-013 | Centre master maintains `centre_no`, `address_to`, `centre_name`, `district_name`, `add1`, `add2`, `city`, `pincode`, `phone`, `pandit_flag`, and `close_flag`. New centre defaults `pandit_flag` and `close_flag` to `N` in the shared clear routine. | Closed centres cannot be selected as a Balbodhini form centre. | `Frm_Centre.frm`, `ClassMaster.Clear_Fields`, `Txt_Form_Centre_Validate` |
| FR-014 | Exam master maintains exam number, name, number of papers, fees, attendance-printed flag, result-generated flag, class 1, class 2, class 3, and distinction marks. | Balbodhini calculation reads the row identified by the answer to Q-002. | `Frm_Exam.frm` |
| FR-015 | The result routine also reads `exam.min_total_khand1`. The Exam Master screen query does not include that column. The new exam screen must show it for the Balbodhini exam. | Result fail rule uses the stored minimum. | `cmd_gen_result_Click` |
| FR-016 | Paper master maintains paper number, name, exam number, passing marks, exemption marks, and minimum marks. Balbodhini result reads `min_marks` for paper 1 of the Balbodhini exam. `passing_marks` is selected and not used in the reviewed procedure. | A missing paper row stops result generation with the legacy message. | `Frm_Paper.frm`, `cmd_gen_result_Click` |
| FR-017 | User master maintains user id, password, and the legacy key field. New passwords are stored with a modern hash, subject to Q-012. | SUPER can create and change users. | `Frm_Usermast.frm` |

## M3 Candidate registration

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-020 | The form list for the default session is ordered by form centre, then serial number. | First, previous, next, and last follow that order. | `Form_Activate` query |
| FR-021 | New, update, and save follow the shared button rules: New clears fields and enables editing; Save inserts when the action is New; Save updates when the action is Update; Undo restores the current row; navigation locks fields. | Buttons match `ClassCommon.Menu_Enable` and `Menu_Disable`. | `ClassMaster.Check_Button_Key`, `ClassCommon.cls` |
| FR-022 | Save requires name, form centre, exam centre, and gender. | Each missing value is rejected with the legacy message. | `check_data` |
| FR-023 | Gender is `M` or `F`, set by the option buttons or by typing. Any other character is cleared. | `M` selects Male and `F` selects Female when a row is shown. | `Txt_Gender_Change`, `OptMale_Click`, `OptFemale_Click`, `Displ_Region` |
| FR-024 | On New, the previous form centre and region are kept, the session is the default session and is locked, and focus moves to name unless focus is already on roll number. | Operator can enter the next candidate for the same centre without retyping the centre. | `Cmd_new_Click` |
| FR-025 | A new serial number is `max(srno) + 3` across `form_balbodhini`, not per session, when the insert-between flag is false. A null maximum becomes 3 (`0 + 3`). | Serial numbers skip by 3. | `Cmd_save_Click` |
| FR-026 | An insert-between save uses the previous row’s serial number plus 1, and only if `Frm_InsertRecordBetween` set the insert flag. | A row appears between the two names. If the serial gap is 1, insert is refused. | `Frm_InsertRecordBetween.Cmd_Insert_Click` |
| FR-027 | Update does not change roll number. The roll-number field stays locked. | Update SQL fields are name, form centre, exam centre, region, gender, and user id. | `GS_AfterSave` in `Cmd_save_Click`; `Update_record` |
| FR-028 | A new row stores the signed-in user id. | `USERID` equals the login name. | `Cmd_save_Click` |
| FR-029 | Form centre validation: centre must exist; `close_flag = 'Y'` is rejected; region number and region name are filled from the centre’s district. | Invalid or closed centre cannot leave the field. | `Txt_Form_Centre_Validate` |
| FR-030 | While adding or updating, changing the form centre copies it into the exam centre. | Exam centre starts equal to form centre. | `Txt_Form_Centre_Change` |
| FR-031 | Exam centre must exist. Display is centre name, a comma, and city, or `-` when city is null. | Unknown centre is rejected. | `Txt_Exam_Centre_Validate` |
| FR-032 | The centre form count is `count(*)` of `form_balbodhini` for that form centre and session. | Label updates on navigation and after save when the centre changes. On a new save the label is also incremented locally before the recount. | `CountFormsForCentre`, `Cmd_save_Click` |
| FR-033 | Delete removes `form_balbodhini` where `srno` and `session_no` match, after confirmation, then shows the last remaining row or a new blank row. | Deleted row is gone. | `Cmd_delete_Click`, `Delete_Record` |
| FR-034 | Search by name lists names in the default session and positions the form on the matching serial number. Search by roll number requires a region and a roll number. | Name search and roll search both land on the candidate. | `Frm_Search.frm` cases `Frm_FormBalbodhini` |
| FR-035 | When `resgen_balbodhini = 'Y'`, New, Insert, Save, Undo, Update, and Delete are disabled on activate and again whenever the user navigates. | Locked session cannot change forms. | `Form_Activate`, `Proc_CheckResultGen` |
| FR-036 | Supervisor batch insert writes the start name at the start roll number, `-` for each roll number in between, and the end name at the end roll number. Form centre and exam centre are both the entered centre. Serial numbers increase by 3. Gender is not written. | Count message equals end roll minus start roll plus 1. | `frm_insertbatch.frm` `cmdins_Click` |

## M4 Roll numbers

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-040 | Set Roll Numbers opens for exam `Balbodhini` and lists seat regions with the region names that share that seat-region number. | Combo items come from `region.SEAT_REGION_NO`. | `Frm_SetRollNo1.Form_Load` |
| FR-041 | The operator must select a region and enter numeric first and last roll numbers, with last greater than or equal to first. | Otherwise the action stops. | `CmdSet_Click` |
| FR-042 | Forms for the session and form centre are read in `srno` order. If the form count is less than the roll-number count, assignment stops. | Message: that many forms are not entered. | `CmdSet_Click` |
| FR-043 | Roll numbers are written from first through last. The operator must confirm the last candidate’s name. No confirmation rolls the transaction back. | Confirmed assignment commits. Rejected assignment leaves roll numbers unchanged. | `CmdSet_Click` |
| FR-044 | The next centre is the next centre, in seat-district and centre order, that has at least one form in the seat region’s regions. The suggested first roll number is the seat-region maximum plus 1. | Operator does not have to guess the next centre. | `Proc_ShowNextCentre` |
| FR-045 | Aur assignment selects `roll_no is null` for the session and form centre, ordered by `srno`. The start number is the maximum roll number in the seat region plus 1, or 1 when the maximum is null. The centre’s seat region must match the selected seat region. | Numbered forms are not renumbered. A centre outside the seat region is rejected. | `Frm_SetRollNoAur.frm` |
| FR-046 | Blanking sets `roll_no` to null for the exam where session matches, roll number is greater than or equal to the centre’s minimum roll number, and region equals that centre’s region on the form table. | Operator must confirm. | `Frm_BlankRollNo.cmd_blank_Click` |

## M5 Marks entry

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-050 | The marks list is `roll_no, session_no, marks1, tot_marks, region_no` from `form_balbodhini` where `result` is null, ordered by roll number. | Candidates with a result do not appear. | Adodc record source |
| FR-051 | Show filters to the default session, the selected region’s `region_no`, and `roll_no` greater than or equal to the entered roll number. The roll number must be numeric and not negative, and must exist for that session and region. An apostrophe typed in the roll number is removed. | Unknown roll number is rejected. | `CmdShow_Click`, `Txt_Roll_No_Validate` |
| FR-052 | Paper 1 accepts only a number from 0 through 100, or `A`. `A` is stored in upper case. | Values outside that set are cleared. | `DataGrid1_AfterColEdit` |
| FR-053 | After a numeric edit, if the mark is exactly 1 or exactly 2 below `class1_marks`, `class2_marks`, `class3_marks`, or `dist_marks` of `exam` where `exam_no = 1`, ask whether to add 1 or 2 grace marks. | Yes increases the mark. No keeps the typed mark. | `DataGrid1_AfterColEdit`. Exam row is Q-002. |
| FR-054 | The total column is set to the numeric value of Paper 1 after the edit, including when the cell is cleared. | Total equals `Val(marks1)`. For `A`, that value is 0 until result generation clears it. | `DataGrid1_AfterColEdit` |
| FR-055 | If `resgen_balbodhini = 'Y'`, the grid is disabled. | No mark changes. | `Form_Load` |

## M6 Result generation

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-060 | The operator must select a region. The region number used by the procedure is the first character of the combo text. | Empty region stops the action. | `cmd_gen_result_Click`, `Cmb_region_Click`. See Q-007. Do not silently change this until Q-007 is answered. The target screen should still display the full region number so the defect is visible in test. |
| FR-061 | If the Balbodhini exam row is missing, generation stops and asks for exam details. If paper 1 for that exam is missing, generation stops and asks for paper details. | No partial write of grades when masters are missing. The paper check happens after an update that nulls rank, grade, and result on eligible rows. Preserve that order only if the business accepts it. It is observed behavior. | `cmd_gen_result_Click` |
| FR-062 | Eligible rows have `marks1` not null, `result` null, the default session, and the selected region, ordered by roll number. | Other rows are unchanged. | Open statement in `cmd_gen_result_Click` |
| FR-063 | For each eligible row, apply RULE-060 through RULE-066 in `04-Business-Rules-and-Workflows.md`. | Result, grade, total, and rank match those rules. | `cmd_gen_result_Click` |
| FR-064 | The screen then shows the region’s rows, including rows that already had results, in roll-number order. The grid is read-only. | Columns: roll number, marks1, total, grade, rank, result. | Adodc record source and filter at the end of `cmd_gen_result_Click` |
| FR-065 | Find Ranks reads every passing row in the session ordered by total descending, writes `FIRST` on the top total, then `SECOND` on the next distinct total, and stops. Ties share the word. | Region rank text on those rows is replaced. | `Cmd_ranks_Click` |
| FR-066 | The button captioned "Show students with duplicate ranks" (`cmd_print`) has no click procedure. | Do not invent a duplicate-rank report. The button is not a requirement. | `Frm_GenResultBalbodhini.frm` control `cmd_print` with no `Cmd_print_Click` |

## M7 Supervisor corrections

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-070 | Reset shows the default session and, for Balbodhini, asks for confirmation, then sets `resgen_balbodhini` to `N`. | Cancel does not change the flag. | `Frm_regen_res.frm` |
| FR-071 | Update Marks for Balbodhini shows only Paper 1 and total. Display requires a row for the default session, roll number, and region that already has a result. | A missing result or unknown roll number is rejected. | `Frm_RegenResult.frm` `CmbExam_Click`, `CmdDisplay_Click` |
| FR-072 | Paper 1 on that screen is `A` or a number from 0 to 100. Total is set to the numeric value of Paper 1 before save. | Invalid marks are not saved. | `ValidateMarks` |
| FR-073 | Save writes `marks1` and `tot_marks` and clears `grade`, `result`, `RESGEN_RUN`, and `SPECIAL_RANK` for that roll number, session, and region. | The candidate disappears from "already resulted" and reappears for generation. | `CmdSave_Click` |
| FR-074 | If the displayed special rank is not empty, the clear of grade, result, run, and rank is then applied to every Balbodhini row in that session and region, and the operator is told to regenerate. | One ranked candidate’s mark change invalidates the whole region result. | `CmdSave_Click` |

## M8 Reports and export

| ID | Requirement | Acceptance | Legacy source |
| --- | --- | --- | --- |
| FR-080 | Attendance rebuilds temp table `attsheet` for one exam centre: delete all rows, read candidates for that centre and session ordered by roll number, and store roll numbers in pairs of columns. The report header carries month, year, centre, and the last roll number encountered. | Sheet is for Balbodhini only when that menu is checked. | `Frm_AttSheet.InsertRecord`, `CmdPrintBalbodhini_Click` |
| FR-081 | Name list runs for the default session, all exam centres or one exam centre, and shows roll number, name, exam centre, centre name, and district name. Header shows session month and the first four digits of the session. | Filter matches the option selected. | `Frm_NameList.frm` |
| FR-082 | Result sheet runs `Cmd_ResultBalbodhini` for the session on screen. Centre filter uses the centre number found from centre name and city. Region filter uses the rightmost five characters of the region combo. A valid result date is required. The named layout or the no-name layout is chosen from which menu was clicked. | Both layouts use the same data command. | `CmdPrintPreviewBalbodhini_Click` |
| FR-083 | Certificate requires session and region. Optional numeric from and to roll numbers filter the data report. Year on the certificate is characters 1 to 4 of the session. | All-region-in-session, from-only, to-only, and from-to all work as coded. | `Cmd_balbodhini_Click` |
| FR-084 | Register print clears `dummyCentreCode` for the selected session, asks the operator to continue, assigns a new dummy centre sequence, clears blank results to null, and prints counts described in BR-074. The data command is invoked with the default session, not the year fragment computed earlier in the click procedure. | Counts on the report footer match the SQL in `ProcPrintRegister`. | `Frm_RGOtherThanPandit.frm` |
| FR-085 | Dummy centre codes number exam centres in roll-number order within each region, starting at 1, and increment when the exam centre changes. Regions are processed distinctly. | Register grouping can follow that sequence. | `ProcSetDummyCenterCode` |
| FR-086 | Region-wise register resolves the region by name, assigns dummy centre codes, and filters the Balbodhini register command to that region for the default session. | One region is printed. | `Frm_RegionwiseRegister.CmdBalbodhini_Click` |
| FR-087 | Centre-wise student report deletes `centre_count`, then for each exam centre builds up to two contiguous roll ranges plus an "other" list when the roll numbers are not consecutive. | Output is ordered by region and first roll number. | `ProcPrint` |
| FR-088 | User-wise form count deletes `tot_forms`, counts `FORM_BALBODHINI` for each selected user and the default session, and prints the temp table. | Other exams are not counted in this build. | `Cmd_Printpre_Click` |
| FR-089 | Centre export writes one text line per centre that appears as a form centre on any exam table, including `form_balbodhini`, for the selected session. Fields are separated by `%`: centre number, address-to, centre name, district, address 1, address 2, pin code, then month, hyphen, and the first four digits of the session. | File is produced for the selected session. | `Frm_ExportData.CmdExport_Click` |

## M9 Explicit non-requirements

| ID | Statement |
| --- | --- |
| FR-100 | The system does not implement Pandit, Praveen, Prabodh, Subodh, Praveshika, or Prathamik. |
| FR-101 | The system does not add a Balbodhini hall ticket or mark sheet. |
| FR-102 | The system does not add a "losing grade by 2 marks" query. Grace remains an entry-time prompt (FR-053). |
| FR-103 | The unwired form `Frm_setdist.frm` is not migrated unless Q-010 says to keep it. |
