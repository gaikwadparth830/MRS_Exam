# Business Rules and Workflows — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | RULE-BAL-001 |
| Status | Draft |
| Rule | A rule is included only when a procedure implements it |

## 1. Candidate identity

| ID | Rule | Source |
| --- | --- | --- |
| RULE-001 | A Balbodhini candidate row is identified by `srno` within `form_balbodhini`. Navigation and delete use `srno` plus `session_no`. | `Cmd_save_Click`, `Cmd_delete_Click`, `Frm_Search.Proc_MoveRecord` |
| RULE-002 | A new `srno` is the table-wide maximum plus 3. If the maximum is null, the stored value is 3. | `Cmd_save_Click` |
| RULE-003 | A row inserted between two names receives `previous srno + 1`. The insert is refused when the next serial is exactly one greater, or when the two names are not adjacent in form-centre order. | `Frm_InsertRecordBetween.Cmd_Insert_Click` |
| RULE-004 | Batch insert also steps `srno` by 3. Middle names are the single character `-`. | `frm_insertbatch.cmdins_Click` |
| RULE-005 | Roll number is assigned by a later process. It is not entered on the candidate form. Update does not write a new roll number. | `Disable_Fields`, `Update_record`, `GS_AfterSave` |
| RULE-006 | Gender must be `M` or `F` before save. | `check_data`, `Txt_Gender_Change` |
| RULE-007 | Name, form centre, and exam centre are mandatory. | `check_data` via `ClsCommon.Non_Blank` |
| RULE-008 | There is no duplicate check on name or roll number at save. | Absence in `check_data`. Confirmed by what the procedure does not do. |

## 2. Centre and region

| ID | Rule | Source |
| --- | --- | --- |
| RULE-010 | Form centre must match `centre.centre_no`. | `Txt_Form_Centre_Validate` |
| RULE-011 | If that centre’s `close_flag` is `Y`, the form centre is rejected. | Same |
| RULE-012 | Region is the region of the district whose name equals the centre’s `district_name`. | Same nested query |
| RULE-013 | While the form is in New or Update, the exam centre is set equal to the form centre whenever the form centre changes. The operator may then change the exam centre. | `Txt_Form_Centre_Change` |
| RULE-014 | Exam centre must exist. `close_flag` is not consulted. | `Txt_Exam_Centre_Validate` |
| RULE-015 | Display of a centre is `centre_name`, comma, city. A null city is shown as `-`. | Both validate procedures |
| RULE-016 | Seat region groups one or more regions. Roll-number walks use `SEAT_REGION_NO` and `seat_district_no`. | `Frm_SetRollNo1.Form_Load`, `Proc_ShowNextCentre` |

## 3. Session lock

| ID | Rule | Source |
| --- | --- | --- |
| RULE-020 | Ordinary entry uses the session with `defa = 'Y'`. | Form, marks, and result load queries |
| RULE-021 | If `resgen_balbodhini = 'Y'`, candidate maintenance buttons are disabled and the marks grid is disabled. | `Proc_CheckResultGen`, marks `Form_Load` |
| RULE-022 | The only write found for that flag sets it to `N`, and only after supervisor confirmation. | `Frm_regen_res.frm` |
| RULE-023 | Session number length and the final digit `1` or `2` are session-master rules. They are not rechecked on the candidate form because the session is copied from the default row. | `Frm_Session.frm` |

## 4. Roll numbers

| ID | Rule | Source |
| --- | --- | --- |
| RULE-030 | Regular numbering updates existing rows for the session and form centre in `srno` order. It does not skip rows that already have a roll number. | `Frm_SetRollNo1.CmdSet_Click` |
| RULE-031 | The count of numbers in the inclusive range must not exceed the number of forms at that centre. | Same |
| RULE-032 | The assignment is kept only if the operator confirms the last name. | Same, `BeginTrans` / `CommitTrans` / `RollbackTrans` |
| RULE-033 | Aur numbering updates only rows with a null roll number. | `Frm_SetRollNoAur.CmdSet_Click` |
| RULE-034 | Aur start number is max roll in the seat region’s regions, plus 1, for the selected session. | `TxtCentre_Change` |
| RULE-035 | A centre whose seat region is not the selected seat region cannot be numbered on the Aur screen. The comparison uses the first character of the combo. | `TxtCentre_Change` |
| RULE-036 | Blanking nulls roll numbers in the same region from the selected centre’s minimum roll number upward, for the session shown on the roll-number screen. | `Frm_BlankRollNo.cmd_blank_Click` |

## 5. Marks and grace

| ID | Rule | Source |
| --- | --- | --- |
| RULE-040 | Only rows with a null `result` are in the marks recordset. | Adodc `RecordSource` |
| RULE-041 | The working set is the default session, one region, and roll numbers from the entered value upward. | `CmdShow_Click` |
| RULE-042 | Paper 1 is a number from 0 to 100, or the letter `A`. Negative numbers and numbers above 100 are rejected. Non-numeric text other than `A` is rejected. | `DataGrid1_AfterColEdit` |
| RULE-043 | Grace is offered when a class or distinction boundary minus the entered mark is 1 or 2. Boundaries are `class1_marks`, `class2_marks`, `class3_marks`, and `dist_marks` from `exam` where `exam_no = 1`. The operator may accept or refuse. | Same. Exam number is Q-002. |
| RULE-044 | Total marks on the marks screen are the numeric value of Paper 1. The numeric value of `A` is 0, so an absent row can be stored with total 0 until result generation. | Same |
| RULE-045 | On the supervisor correction screen, total is again the numeric value of Paper 1 and `A` is allowed. The same 0-to-100 rule applies. Grace is not offered there. | `Frm_RegenResult.ValidateMarks` |

## 6. Result calculation

Apply in this order. Source: `Frm_GenResultBalbodhini.cmd_gen_result_Click`.

| ID | Rule |
| --- | --- |
| RULE-060 | Process only rows with Paper 1 not null, result null, selected region, and default session. |
| RULE-061 | Before the loop, set `special_rank`, `grade`, and `result` to null on those same rows. |
| RULE-062 | Store `resgen_run` as the computed run plus 1. Computed run is 1 when the current maximum is null or 0, otherwise maximum plus 1. See Q-006. |
| RULE-063 | If Paper 1 is `A`: total becomes null, result `Fail`, grade `A`. No further grade test. |
| RULE-064 | Else if existing `tot_marks` is null, treat total as 0. If total is below `exam.min_total_khand1` for the Balbodhini exam row: result `Fail`, grade `X`. |
| RULE-065 | Else if Paper 1 is an empty string: result `-`, grade `-`. |
| RULE-066 | Else if numeric Paper 1 is below `paper.min_marks` for paper 1 of that exam: result `Fail`, grade `X`. |
| RULE-067 | Else result is `Pass` and grade is `Vi. Yo.` when total is at least `dist_marks`, else `1` when total is at least `class1_marks`, else `2` when total is at least `class2_marks`, else `3`. |
| RULE-068 | `passing_marks` is read and not used. `class3_marks` is not used in this grade selection. |
| RULE-069 | After the loop, for passing rows in that region and session ordered by total descending, every row tied at the highest total gets `special_rank` equal to `FIRST IN ` plus `region_name_eng`. |
| RULE-070 | Find Ranks repeats a similar tie rule for the whole session: top total `FIRST`, next distinct total `SECOND`. It overwrites `special_rank`. |

Result text is stored as `Fail` and `Pass`. Register counts compare with `ucase(result) = 'PASS'` and `'FAIL'`.

## 7. Rank correction side effect

| ID | Rule | Source |
| --- | --- | --- |
| RULE-080 | Changing marks for a candidate who already has a special rank clears result fields for every candidate in that session and region, not only the edited candidate. | `Frm_RegenResult.CmdSave_Click` |
| RULE-081 | Changing marks for a candidate with no special rank clears result fields only for that roll number, session, and region. That branch sets `SPECIAL_RANK` to an empty string rather than null. | Same |

## 8. Report counts

Source: `Frm_RGOtherThanPandit.ProcPrintRegister`.

| ID | Rule |
| --- | --- |
| RULE-090 | Total candidates is the count of Balbodhini rows in the default session. |
| RULE-091 | Pass count is result `PASS` after upper-casing. |
| RULE-092 | Pass percent is pass count times 100 divided by total candidates, formatted with two decimal places. It is not divided only by candidates who have a result. |
| RULE-093 | Fail count is result `FAIL` and grade `X`. Absent candidates are not in this count. |
| RULE-094 | Absent count is grade `A`. |
| RULE-095 | The stopped count is rows whose result is null. If that count is 0, the label is `-`. |
| RULE-096 | Before those counts, blank result strings are updated to null. |

## 9. Attendance layout

| ID | Rule | Source |
| --- | --- | --- |
| RULE-100 | `attsheet` is deleted completely before each centre is printed. | `InsertRecord` |
| RULE-101 | Up to 50 roll numbers are taken at a time and stored as 25 rows of two roll-number columns. | Same |
| RULE-102 | The maximum roll number shown is the last roll number placed in the array. | Same |

`InsertRecord` reads `exam_centre` after the roll-number loop has moved the cursor. That can attach the wrong centre or fail at the end of the file. Do not copy that cursor bug. The new attendance sheet must list the selected centre and that centre’s roll numbers.

## 10. Workflows

### WF-01 Register candidates

1. A default session exists.
2. The user opens Balbodhini form entry.
3. The user enters name, gender, and form centre. Region and exam centre fill in. The user may change the exam centre.
4. Save stores the serial number and user id. Roll number stays empty.
5. The user repeats for the centre. The count shows how many forms that centre has.
6. Optional: insert between two names, or a supervisor batch-inserts a range.

### WF-02 Number the forms

1. The user opens Set Roll Numbers for Balbodhini and selects session and seat region.
2. The user enters the first and last roll number for the current form centre.
3. The system numbers the forms in serial order and shows the last name.
4. The user confirms the name against the bundle, or rejects and nothing is saved.
5. The system offers the next centre and the next starting number.
6. Late forms are numbered with Aur, which changes only null roll numbers.

### WF-03 Enter marks and generate

1. The user selects a region and a starting roll number and shows candidates without a result.
2. The user enters Paper 1. Grace may be accepted.
3. The user generates the result for that region.
4. The system writes Fail or Pass, grade, run number, and region first-rank text.
5. Optional: Find Ranks writes overall first and second.

### WF-04 Correct and regenerate

1. The supervisor resets the result flag if forms or the marks grid must be edited.
2. If a resulted candidate’s mark is wrong, the supervisor uses Update Marks.
3. If that candidate had a special rank, the region’s results are cleared.
4. The user generates the region again.

### WF-05 Publish

Print attendance, name list, result sheet with or without names, certificates, register or region-wise register, centre roll ranges, and when needed the user form-count and the centre-label file.

## 11. Observed defects

These are recorded so they are not treated as silent requirements to preserve without a decision.

| ID | Observation |
| --- | --- |
| DEF-01 | `resgen_balbodhini` is never set to `Y` in the reviewed source. |
| DEF-02 | Grace uses exam 1. Result uses exam 2. |
| DEF-03 | Result region number is the first character of the combo. |
| DEF-04 | Run number is stored as the computed value plus 1. |
| DEF-05 | `cmd_print` on the result screen has no code. |
| DEF-06 | Register click computes a four-digit year into a local variable and later loads the default session again for the report. |
| DEF-07 | Attendance insert reads `exam_centre` after the roll-number loop has moved the cursor. |
| DEF-08 | User-wise counting for every exam except Balbodhini is commented out in this build. |
| DEF-09 | Result generation can clear grade and result before it discovers that the paper master is missing. |
