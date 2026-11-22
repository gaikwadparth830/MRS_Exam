# Business Requirements Document — Prathamik Examination System

| Item | Value |
| --- | --- |
| Document ID | BRD-PRA-001 |
| Version | 0.1 draft |
| Audience | Business owner, examination office, modernization team |
| Scope | **Prathamik exam only** and the shared masters required to run it |
| Legacy | Visual Basic 6 desktop application (`Prathamik20122019.exe`, `mrsexam/Project1.vbp`) and Microsoft Access database (`mrsexam/database/MRSEXAM.mdb`) |
| Target (future) | React + TypeScript + Material UI, ASP.NET Core Web API, SQL Server |
| Rule | Existing Prathamik behavior is retained unless a question in section 8 is answered with an approved change |
| Evidence | VB6 forms, reports, and shared classes under `mrsexam/` in this repository |

## 1. Purpose

The examination office records **Prathamik** candidates, assigns roll numbers, records one written paper (Paper 1), calculates result and grade, assigns region and state ranks, and prints operational documents used at centres and for certification.

The current application is a Windows desktop program bound to one Access file on the PC that runs it. A replacement must let authorized staff perform the same work from a browser, with one SQL Server database, without dropping a Prathamik rule that the code actually implements.

In this **Prathamik build**, `forms/MDIForm1.frm` enables Prathamik menu items and design-time disables Pandit, Praveen, Prabodh, Subodh, Praveshika, and Balbodhini. Documents for other exams are out of scope.

## 2. Actors

| Actor | Confirmed identification | What they do |
| --- | --- | --- |
| Examination user | Any user id in `users` whose password matches | Form entry, marks, roll numbers, result generation, reports. No finer permission was found in the Prathamik paths reviewed. |
| Supervisor | User id compared as `SUPER` in `forms/frmLogin.frm` `CmdOk_Click` | Same as an examination user, plus User Master, reset of the result-generated flag, update of marks after a result exists, batch insert, and other Supervisor menus. The Supervisor menu is hidden for every other user. |
| Centre, region, and session data | Master records, not people | Drive validation and report grouping. |

There is no candidate self-service login in the source.

## 3. In scope

| Module | Business outcome |
| --- | --- |
| M1 Access and session | A user signs in. Work uses the session marked default (`defa = 'Y'`). A session flagged as backup can open another database file and hide operational menus (login behavior). |
| M2 Organization masters | Regions, districts, centres, exam thresholds, paper thresholds, and sessions can be maintained. |
| M3 Candidate form | A Prathamik application is added, viewed, corrected, deleted, and searched for the default session. |
| M4 Roll numbers | Roll numbers are assigned in centre order, can be cleared, and late forms with a null roll number can be numbered (Aur). |
| M5 Marks | Paper 1 is entered for candidates who do not yet have a result. |
| M6 Result | Pass or fail, grade, region rank, and optional overall first and second rank are calculated. |
| M7 Corrections | A supervisor can clear the lock flag and can change marks after a result exists, which clears the result so it can be generated again. |
| M8 Outputs | Attendance sheet, name list, result sheet, result sheet without name, certificate, register, region-wise register, centre roll ranges, centre-label export, and related Prathamik reports wired in `Project1.vbp`. |

## 4. Out of scope unless later approved

- Other examinations stored in the same source tree (disabled in this executable build).
- Hall tickets and mark sheets (no Prathamik menu item found in `MDIForm1.frm` for this build).
- Online payment, fees collection, and candidate portal (`Frm_Exam.frm` may store fees; Prathamik form entry does not collect fees in the reviewed code).
- The hidden `Command1` import on `Frm_FormPrathamik.frm` that bulk-loads from table `impprath` (developer or one-off migration utility, not a menu workflow).
- Changing pass marks, grade names, or rank wording without answers to Q-003 and Q-011.

## 5. Business requirements

### M1 Access and session

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-001 | A person must sign in with a user id and password before any examination work. | `frmLogin.frm` | Confirmed |
| BR-002 | The user id `SUPER` is the supervisor. Every other valid user is a standard user. | `frmLogin.frm` `CmdOk_Click` | Confirmed. See Q-013. |
| BR-003 | Operational entry uses the session whose `defa` flag is `Y`. If none exists, Prathamik form entry closes with “Session not selected.” | `Frm_FormPrathamik.frm` `Form_Activate` | Confirmed |
| BR-004 | Session master rules (length, month from `Parameter`, backup session) apply when maintaining sessions. | `Frm_Session.frm` (shared) | Confirmed for session master |
| BR-005 | If the selected session is marked backup, the user may open another Access file and operational menus are hidden. | `frmLogin.frm` | Confirmed. Web replacement must define an equivalent read-only historical session. See section 8. |

### M2 Organization masters

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-010 | The office maintains regions, including seat-region number used when roll numbers are assigned. | `Frm_Region.frm`; `Frm_SetRollNo1.frm` | Confirmed |
| BR-011 | The office maintains districts linked to a region, with seat-district order used to walk centres. | `Frm_District.frm`; set-roll logic | Confirmed |
| BR-012 | The office maintains centres. A centre can be marked closed (`close_flag = 'Y'`). | `Frm_Centre.frm` | Confirmed |
| BR-013 | Grade boundaries and minimum total for result come from the Exam master. Minimum mark for Paper 1 comes from the Paper master. For Prathamik, both marks entry and result generation read **`exam_no = 2`**; result uses **`paper_no = 1`**. | `Frm_PrathamikMarks.frm` `Form_Load`; `Frm_GenResultPrathamik.frm` `cmd_gen_result_Click` | Confirmed that masters are read. Live threshold values are Q-003. |
| BR-014 | English region name (`region_name_eng`) is required for the rank phrase printed into `special_rank`. It is not editable on Region Master in the reviewed screens. | `Frm_GenResultPrathamik.frm` rank loop | Confirmed read. Maintenance screen missing. Q-005. |

### M3 Candidate form (`form_prathamik`)

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-020 | Staff can add, view, update, delete, and search a Prathamik candidate in the default session. | `Frm_FormPrathamik.frm`; `ClassMaster.cls` | Confirmed |
| BR-021 | A candidate has a name, gender `M` or `F`, form centre, exam centre, region (from form centre), session, and `userid` on new save. | `check_data`, centre validation, `Cmd_save_Click` | Confirmed |
| BR-022 | Roll number is not typed on the form during normal entry; it is assigned later. Roll is locked on update. | `ClassMaster.cls` `Disable_Fields`; `Update_record` | Confirmed |
| BR-023 | Form centre must exist and must not be closed. Choosing it fills region from centre → district → region, and copies that centre into exam centre until the user changes it. | `Txt_Form_Centre_Change`, `Txt_Form_Centre_Validate` | Confirmed |
| BR-024 | Exam centre must exist; name and city are shown. Closed status is **not** checked for exam centre. | `Txt_Exam_Centre_Validate` | Confirmed. See Q-008. |
| BR-025 | The screen shows how many forms for the current form centre exist in the session. | `ClassMaster.CountFormsForCentre` | Confirmed |
| BR-026 | Staff can insert one new candidate between two existing names at the same form centre when serial numbers are not consecutive. | `Cmd_Insert_Click`, `Frm_InsertRecordBetween.frm` | Confirmed |
| BR-027 | A supervisor can insert a roll-number range for one centre (batch); names in between may be stored as `-`. | `frm_insertbatch.frm` (exam maps to `form_prathamik`) | Confirmed |
| BR-028 | When `session.resgen_prathamik` (or legacy field name `resgen_Prathamik`) is `Y`, staff cannot add, insert, save, undo, update, or delete forms; marks grid is disabled. | `Proc_CheckResultGen`; `Frm_PrathamikMarks.frm` `Form_Load` | Confirmed as a lock. How the flag becomes `Y` is unconfirmed (Q-001). **Note:** Form entry code references `resgen_Prathamik`; marks and regenerate code use `resgen_prathamik` (case difference). |
| BR-029 | Delete removes the row for that `srno` and `session_no` after confirmation. | `Cmd_delete_Click`, `ClassMaster` | Confirmed |
| BR-030 | New serial number is `max(srno) + 3` unless insert-between supplies `Prev_SrNo + 1`. | `Cmd_save_Click` | Confirmed. See Q-004. |

Navigation for the default session lists candidates ordered by `form_centre`, then `srno` (`Form_Activate` record source).

### M4 Roll numbers

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-040 | Roll numbers are assigned for Prathamik when menu **Set Roll Numbers → For Prathamik** is active (`LblExam.Caption = "Prathamik"`, table `form_prathamik`). | `Frm_SetRollNo1.frm`; `MDIForm1.frm` | Confirmed |
| BR-041 | Range must be numeric; last ≥ first; centre must have enough forms; operator confirms last name matches bundle (Bitti). | Shared set-roll logic in `Frm_SetRollNo1.frm` | Confirmed (same pattern as other exams) |
| BR-042 | Aur numbering assigns numbers only to forms whose roll number is still null. | `Frm_SetRollNoAur.frm` via `ProcAurSetRollno("Prathamik")` | Confirmed |
| BR-043 | Staff can clear roll numbers from a chosen centre onward. | `Frm_BlankRollNo.frm` | Confirmed |

### M5 Marks

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-050 | Marks are entered for the default session, one region, from a starting roll number, for rows with `result is null`. | `Frm_PrathamikMarks.frm` | Confirmed |
| BR-051 | Prathamik has one paper. Total stored with the mark equals the numeric value of Paper 1 (or cleared logic for absent). | Grid columns `marks1`, `tot_marks` | Confirmed |
| BR-052 | A mark is 0–100 or `A` for absent. | `DataGrid1_AfterColEdit` | Confirmed |
| BR-053 | If the entered mark is 1 or 2 below a class or distinction boundary (`class1_marks`, `class2_marks`, `class3_marks`, `dist_marks` from `exam` where `exam_no = 2`), the operator is asked whether to add grace marks. | `DataGrid1_AfterColEdit` | Confirmed |
| BR-054 | Grid saves when the operator leaves the edited cell; on-screen instruction: click the next row to save the previous row. | Label on form | Confirmed |
| BR-055 | Starting roll number must exist exactly once for session and region. | `Txt_Roll_No_Validate` | Confirmed |

### M6 Result

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-060 | Result is generated for one selected region and the default session, only for rows with `marks1` not null and `result` null. | `Frm_GenResultPrathamik.frm` `cmd_gen_result_Click` | Confirmed |
| BR-061 | Absent (`A`): Fail, grade `A`, `tot_marks` cleared (null). | Same procedure | Confirmed |
| BR-062 | If total &lt; `min_total_khand1` on exam 2: Fail, grade `X`. | Same procedure | Confirmed. Threshold Q-003. |
| BR-063 | If Paper 1 numeric value &lt; `min_marks` on paper 1 exam 2: Fail, grade `X`. | Same procedure | Confirmed |
| BR-064 | Passing candidate receives grade `Vi. Yo.` at or above `dist_marks`, else `1`, `2`, or `3` by `class1_marks` / `class2_marks`. | `Select Case li_tot` | Confirmed. `class3_marks` used in grace only, not in this grade switch. |
| BR-065 | If Paper 1 is blank after checks, result and grade are `-`. | Same procedure | Confirmed |
| BR-066 | Among passing candidates in the region, everyone tied for highest total receives `special_rank` = `FIRST IN` + `region_name_eng`. | Region rank loop | Confirmed. Q-005. |
| BR-067 | **Find Ranks** marks session-wide highest total as `FIRST` and next distinct total as `SECOND`, overwriting region rank on those rows. | `Cmd_ranks_Click` | Confirmed |
| BR-068 | Each processed row stores `resgen_run` incremented from the region’s prior maximum (stored value uses `li_runno + 1` on each row). | `cmd_gen_result_Click` | Confirmed. Starting value Q-006. |
| BR-069 | Before calculating, selected pending rows have `special_rank`, `grade`, and `result` cleared. | Pre-update command | Confirmed |

**Defect to track (legacy, not to copy blindly):** region is parsed as `Mid(Cmb_region.Text, 1, 1)` in `Cmb_region_Change` / generation. Region numbers ≥ 10 are unsafe. Modern design should use integer region id (Q-007).

### M7 Corrections

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-070 | A supervisor can reset `session.resgen_prathamik` to `N` for the default session after confirmation (`exam_code = 2`). | `Frm_regen_res.frm` | Confirmed |
| BR-071 | A supervisor can change Paper 1 after a result exists; update clears `grade`, `result`, `resgen_run`, `special_rank` so result can be regenerated. | `Frm_RegenResult.frm` when `CmbExam.Text = "Prathamik"` | Confirmed |
| BR-072 | If the candidate had a special rank, the same clear can apply to all Prathamik rows in that session and region; operator is told to regenerate the region. | `Frm_RegenResult.frm` | Confirmed |

### M8 Outputs (Prathamik reports in this project)

| ID | Requirement | Source | Status |
| --- | --- | --- | --- |
| BR-080 | Attendance sheet for Prathamik centres (uses `Rpt_AttSheetPrathamik_Balbodhini` and `InsertRecord(..., "Prathamik")`). | `Frm_AttSheet.frm` | Confirmed |
| BR-081 | Name list — `Rpt_NameListPrathamik.Dsr`. | `Frm_NameList.frm`; `Project1.vbp` | Confirmed |
| BR-082 | Result sheet with names — `Rpt_ResultSheetPrathamik.Dsr`; without names — `Rpt_ResultSheetPrathamiknoname.Dsr`. | `Frm_ResultSheet.frm` | Confirmed |
| BR-083 | Certificate — `RPT_Certificate_prathamik.Dsr`. | `Frm_Certificate_Printing.frm` | Confirmed |
| BR-084 | Register — `Rpt_RGPrathamik.Dsr` via `Frm_RGOtherThanPandit.frm`. | Confirmed |
| BR-085 | Region-wise register, centre-wise student ranges, export centre labels | Shared forms with Prathamik menu branches | Confirmed where menu exists in `MDIForm1.frm` |
| BR-086 | User-wise form count for Prathamik | Not confirmed in `Frm_Userwiselist_Totforms.frm` for this build | Unconfirmed. Verify before BR sign-off. |

Candidate names and several report headings use font `DV-TTAakash` (Devanagari). Target system must use Unicode; exact Marathi report titles are Q-011.

## 6. Business rules that must not be invented

- A second or third Prathamik paper beyond Paper 1 in operational screens reviewed.
- Pass or grade rules other than those driven by exam 2 and paper 1 master rows.
- Eligibility by age, prior exam, or photograph.
- Duplicate-name rejection on save (search may find duplicates).
- Automatic setting of `resgen_prathamik` to `Y` when generation finishes (no such update found in reviewed source).
- Prathamik hall ticket or individual mark sheet menus in this build.

## 7. Non-functional business expectations

| ID | Expectation | Note |
| --- | --- | --- |
| BR-090 | Marathi or Devanagari names and report headings must remain printable. | Unicode migration is a data task. |
| BR-091 | More than one staff member may use the system concurrently. | Web design must use SQL Server concurrency, not single-file Access semantics. |
| BR-092 | Historical sessions remain available. | Backup login behavior should become read-only session mode on the web. Proposed change — approve in section 8. |
| BR-093 | Passwords must not remain as the legacy reversible cipher. | Required for web. Q-012. |

## 8. Decisions required before build

| ID | Question | Why it matters |
| --- | --- | --- |
| Q-001 | What sets `resgen_prathamik` to `Y`, and when should forms and marks lock? | Reviewed code only resets to `N`. Lock behavior is implemented on read. |
| Q-002 | Confirm **`exam_no = 2`** and **`paper_no = 1`** are always the Prathamik masters in production data. | Consistent in marks and result code; `Frm_regen_res` uses `exam_code = 2`. |
| Q-003 | Live values of `min_marks`, `min_total_khand1`, `class1_marks`, `class2_marks`, `class3_marks`, `dist_marks` for exam 2. | Result acceptance tests depend on real numbers. |
| Q-004 | Is serial number `max(srno) + 3` intentional for insert-between? | Confirmed in code; business reason not documented. |
| Q-005 | Keep region rank `FIRST IN` + `region_name_eng` and state ranks `FIRST` / `SECOND` overwriting region rank? | Both exist. |
| Q-006 | Is first `resgen_run` on a row intended to be 2 when no prior run exists? | Code stores `li_runno + 1` per row. |
| Q-007 | Replace single-character region parsing with integer region id everywhere? | Recommended deviation from legacy bug. |
| Q-008 | Reject closed centres only as form centre, not exam centre? | Matches legacy. |
| Q-009 | Standardize Access column name `resgen_prathamik` vs `resgen_Prathamik` in SQL Server? | ODBC may hide case; SQL Server will not. |
| Q-010 | Is user-wise Prathamik form count required in this build? | Menu/report path not verified. |
| Q-011 | Approved Marathi/English text for report headings and meaning of grade `Vi. Yo.` on certificate. | Legacy designer encoding not transcribed here. |
| Q-012 | Password hash migration strategy for web login. | Security change. |
| Q-013 | Is `SUPER` the only elevated user? | No other roles found. |
| Q-014 | Extract keys, indexes, and column sizes from a readable `MRSEXAM.mdb` before freezing SQL schema. | Schema not confirmed from file on review machine. |

## 9. Success criteria for a future replacement

1. A standard user can complete M3–M6 (BR-020 through BR-069) for one pilot session without the VB6 client.
2. A supervisor can complete M7 (BR-070 through BR-072) and supervisor-only utilities approved from section 8.
3. Each report in BR-080 through BR-085 can be produced for the same filters as the legacy screen.
4. For signed-off thresholds, result, grade, and rank text match the legacy program for the same marks and session.
5. No other examination module is shipped in the Prathamik-only application.

## 10. Prathamik source reference (for traceability)

| Area | Primary legacy files |
| --- | --- |
| Form entry | `mrsexam/forms/Frm_FormPrathamik.frm` |
| Marks | `mrsexam/forms/Frm_PrathamikMarks.frm` |
| Result | `mrsexam/forms/Frm_GenResultPrathamik.frm` |
| Menus | `mrsexam/forms/MDIForm1.frm` |
| Shared save/navigation | `mrsexam/classmodules/ClassMaster.cls`, `ClassCommon.cls`, `Module1.bas` |
| Data table | `form_prathamik` (columns evidenced in SQL in form and result modules) |
| Reports | `mrsexam/reports/Rpt_*Prathamik*`, `RPT_Certificate_prathamik.Dsr` |

---

*This document is **requirements only**. It does not authorize implementation. If a partial `src/` scaffold remains from an earlier attempt, delete it manually (close any process locking that folder). After BRD sign-off, the next step is a pilot module plan (recommended pilot: **M3 candidate form entry** with M1 session context and read-only masters).*