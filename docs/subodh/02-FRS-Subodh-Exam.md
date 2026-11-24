# Functional Requirements Specification (FRS) — Subodh Exam

| Field | Value |
|-------|-------|
| Document ID | SUB-FRS-001 |
| Version | 0.1 |
| Maps to | `01-BRD-Subodh-Exam.md` |
| Scope | Subodh exam only |

IDs: **FR-xxx** (functional), linked to **BR-xxx**.

---

## 1. Module M1 — Authentication & Session

### FR-001 Login
- **BR:** BR-001  
- **Description:** User enters userid/password; system validates against `USERS`.  
- **Source:** `frmLogin.frm`, `Module1.Login`  
- **Behaviour:** On success, store `GS_Username` for form stamping; open MDI. On failure, reject.  
- **Confirmed.** Encryption helper exists (`Module1.Encryption`) — exact password compare algorithm needs verification during implementation (**OQ-AUTH**).

### FR-002 Select / maintain default session
- **BR:** BR-002, BR-003  
- **Description:** User selects session and marks it default (`DEFA='Y'`). Subodh screens read only default session.  
- **Source:** `Frm_SelectSession.frm`, `Frm_Session.frm`, form Activate queries  
- **Confirmed.**

---

## 2. Module M2 — Masters

### FR-010 Region / District / Centre CRUD
- **BR:** BR-010, BR-011  
- **UI:** Existing master screens (modernized as web pages).  
- **Rules:** Centre may be closed (`CLOSE_FLAG`); Form Centre validation rejects closed centres. Region resolved via district of form centre.  
- **Source:** `Frm_Centre`, `Frm_District`, `Frm_Region`, `Frm_FormSubodh` validate  
- **Confirmed.**

### FR-011 Exam & Paper masters for Subodh
- **BR:** BR-012  
- **Data:** `EXAM` where `EXAM_NO=4`; `PAPER` where `EXAM_NO=4` and `PAPER_NO` in (1,2).  
- **Used by:** Result generation.  
- **Confirmed.**

### FR-012 Institution parameters
- **BR:** BR-013  
- **Source:** `INSTITUTION`, `PARAMETER`  
- **Confirmed** for headers; PARAMETER column usage for Subodh reports is partial (**Assumption** for full label mapping).

---

## 3. Module M3 — Candidate Form Entry

### FR-020 View / navigate candidates
- **BR:** BR-020, BR-021, BR-028  
- **Dataset:**  
  `Select SrNo,roll_no,name,session_no,Form_Centre,Exam_Centre,Region_No,Gender,userid from form_Subodh where session_no in (select session_no from session where defa='Y') order by Form_centre,srno`  
- **Navigation:** First / Previous / Next / Last via `ClassMaster.Check_Button_Key`.  
- **Source:** `Frm_FormSubodh.Form_Activate`  
- **Confirmed.**

### FR-021 Create candidate
- **BR:** BR-020–BR-027, BR-029  
- **Steps:** New → enter fields → Save.  
- **Validations (FR-V01):** Name, Form Centre, Exam Centre, Gender required; Gender M/F; centres exist; form centre not closed.  
- **Defaults:** Session = default; Exam Centre defaults to Form Centre; Region auto-filled; UserId = login.  
- **SRNO:** `max(srno)+3` unless insert-between (`Prev_SrNo+1`).  
- **Lock:** Disabled if `RESGEN_SUBODH='Y'`.  
- **Source:** `Cmd_new_Click`, `Cmd_save_Click`, `check_data`  
- **Confirmed.**

### FR-022 Update candidate
- **BR:** BR-021  
- **Behaviour:** Update mode; roll field locked visually during update (`Update_record`). Save updates selected fields via `GS_AfterSave` query.  
- **Source:** `Cmd_update_Click`, `ClassMaster.Store_Data`  
- **Confirmed.**

### FR-023 Delete candidate
- **BR:** BR-021  
- **SQL:** `Delete from form_Subodh where srno= {Txt_SrNo} and session_no={Txt_Session_No}` with confirm dialog.  
- **Source:** `Cmd_delete_Click`, `ClassMaster.Delete_Record`  
- **Confirmed.**

### FR-024 Search candidate
- **BR:** BR-030  
- **Behaviour:** Opens search UI; name prefix search on `form_subodh` for default session; position to `srno`.  
- **Source:** `Frm_Search` cases for `Frm_FormSubodh`  
- **Confirmed.**

### FR-025 Insert between records
- **BR:** BR-021, BR-027  
- **Behaviour:** Insert dialog shows adjacent names; sets `Insert=True` and `Prev_SrNo`; next save uses `Prev_SrNo+1`.  
- **Source:** `Cmd_Insert_Click`, `Frm_InsertRecordBetween`  
- **Confirmed.**

### FR-026 Result-gen lock on entry
- **BR:** BR-029  
- **Confirmed** as hard disable of mutating buttons.

---

## 4. Module M4 — Roll Number Allocation

### FR-040 Set roll numbers (standard)
- **BR:** BR-040, BR-041  
- **Exam context:** `LblExam = "Subodh"` → table `form_Subodh`.  
- **Inputs:** Session, seat-region grouping, centre, first/last roll.  
- **Process:** Walk centres ordered by `seat_district_no`, `centre_no`; assign sequential rolls to candidates of that form centre ordered by `srno`.  
- **Source:** `Frm_SetRollNo1.frm`  
- **Confirmed** for Subodh path.

### FR-041 Aurangabad roll path
- **BR:** BR-042  
- **Entry:** MDI `Sub_AurRollNoSubodh_Click` → `ProcAurSetRollno("Subodh")`  
- **Confirmed** entry point; detailed algorithm in `Frm_SetRollNoAur.frm` (treat as same preservation requirement).

### FR-042 Blank / from-to centre utilities
- **BR:** BR-043  
- **Status:** Menu exists; treat as Must-if-used historically. Detail to be confirmed in UAT with operators (**OQ-ROLL**).

---

## 5. Module M5 — Marks Entry

### FR-050 Filter & display marks grid
- **BR:** BR-050  
- **UI:** Session (locked), Region combo, Roll No, Show → DataGrid bound to `FORM_SUBODH` columns: roll_no, session_no, marks1, marks2, tot_marks (+ region filter).  
- **Filter:** `session_no = {session} and region_no={region} and roll_no >= {roll}`  
- **Source:** `Frm_SubodhMarks`  
- **Confirmed.**

### FR-051 Edit marks with validation
- **BR:** BR-051–BR-053  
- **Rules:** numeric 0–100 or `A`; recompute total.  
- **Confirmed.**

### FR-052 Lock marks after result gen
- **BR:** BR-054  
- **Confirmed.**

---

## 6. Module M6 — Result Generation

### FR-060 Generate Subodh result for region
- **BR:** BR-060–BR-066  
- **Preconditions:** Region selected; Exam/Paper masters present for exam 4.  
- **Candidate set:** marks1 & marks2 not null, result null, session = label session, region = selected.  
- **Outputs:** Updates `result`, `grade`, `tot_marks` (when both absent), `special_rank` (region first), `resgen_run`.  
- **Post:** Refresh grid for session+region.  
- **Source:** `Frm_GenResultSubodh.cmd_gen_result_Click`  
- **Confirmed.**  
- **Note:** Legacy shows `MsgBox RsSubodh.RecordCount` mid-process — modernization should replace with progress UI (cosmetic change; approve).

### FR-061 Assign Maharashtra special ranks
- **BR:** BR-064  
- **Behaviour:** Pass candidates ordered by tot_marks desc; mark tied top as FIRST, next tied band as SECOND into `special_rank`.  
- **Source:** `Cmd_ranks_Click`  
- **Confirmed** logic; print path commented (**OQ-003**).

---

## 7. Module M7 — Pre-exam reports

### FR-070 Attendance sheet
- **BR:** BR-070  
- **Behaviour:** Build temporary `AttSheet` rows (two roll columns) per exam centre from `form_subodh`; print via shared report with Subodh title.  
- **Source:** `Frm_AttSheet.InsertRecord(...,"Subodh")`, `CmdPrintSubodh_Click`  
- **Confirmed.**

### FR-071 Hall ticket
- **BR:** BR-071  
- **Data command:** `Cmd_HallTicket_Subodh`  
- **Filters:** region; optional from/to roll.  
- **Confirmed.**

### FR-072 Name list
- **BR:** BR-072  
- **Data command:** `Cmd_NameListSubodh` / grouping  
- **Confirmed.**

### FR-073 Register
- **BR:** BR-073  
- **Data command:** `Cmd_RGSubodh` / grouping; `GS_RGForExam="Subodh"`  
- **Confirmed.**

---

## 8. Module M8 — Post-exam reports

### FR-080 Result sheet (named)
- **BR:** BR-080  
- **Command:** `Cmd_ResultSubodh` grouping; report `Rpt_ResultSheetSubodh`  
- **Confirmed.**

### FR-081 Result sheet (no name)
- **BR:** BR-081  
- **Report:** `Rpt_ResultSheetSubodhnoname`  
- **Confirmed.**

### FR-082 Certificate
- **BR:** BR-082  
- **Command:** `Cmd_Certificate_Subodh(session, region)` + optional roll filter  
- **Confirmed.**

### FR-083 Lost by two marks
- **BR:** BR-083  
- **Command:** `Cmd_LosingTwoMarksSubodh` with param `4`  
- **Confirmed** invocation; exact SQL criterion in DataEnvironment (**preserve as-is**).

---

## 9. Module M9 — Utilities

### FR-090 Regen result entry points
- **BR:** BR-090  
- **Confirmed** menu; detailed regen algorithm shared form — preserve Subodh branch.

### FR-091 Export / backup include Subodh
- **BR:** BR-092  
- **Confirmed** `form_subodh` delete/restore branches in `FrmBackup.frm`.

### FR-092 Centre-wise student counts / user-wise totals
- **BR:** BR-091, BR-093  
- **Confirmed** forms exist; Subodh key `SUBODH` in `TOT_FORMS`.

---

## 10. Cross-cutting functional rules

| ID | Rule |
|----|------|
| FR-X01 | All Subodh transactional screens default to session `DEFA='Y'` unless a report explicitly selects another session |
| FR-X02 | Exam identity for Subodh is **table-based** (`FORM_SUBODH`) plus `EXAM_NO=4` for rules — not a discriminator column on a shared form table |
| FR-X03 | Marks are stored as text to allow `A` |
| FR-X04 | SQL injection-prone string concatenation in legacy must be replaced with parameterized queries in API (security modernization; behaviour preserved) |

---

## 11. FR ↔ BR coverage check

All BR-001…BR-093 Must/Should items have at least one FR above. Could items (BR-093) mapped to FR-092.
