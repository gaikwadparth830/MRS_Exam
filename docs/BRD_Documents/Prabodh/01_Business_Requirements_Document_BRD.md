# Business Requirements Document (BRD) — Prabodh Exam

| Field | Value |
|-------|-------|
| Document ID | BRD-PRABODH-001 |
| Exam | Prabodh (EXAM_NO = 5) |
| Legacy sources | `Frm_FormPrabodh.frm`, `Frm_PrabodhMarks.frm`, `Frm_GenResultPrabodh.frm`, `MDIForm1.frm`, `Module1.bas`, `ClassMaster.cls`, `ClassCommon.cls`, `FORM_PRABODH` |
| Target | React + TS + MUI / ASP.NET Core / SQL Server |
| Version | 1.0 (Draft for review) |
| Status | Analysis complete — pending business sign-off |

---

## 1. Purpose

Modernize the **Prabodh** examination lifecycle (candidate form entry → marks → result → reports) while preserving confirmed legacy business rules.

## 2. Business objectives

| ID | Objective |
|----|-----------|
| BR-PRB-001 | Capture Prabodh candidate forms for the active session with centre, region, gender, and operator userid. |
| BR-PRB-002 | Assign / maintain roll numbers and support Aur (supplementary) roll-number setting. |
| BR-PRB-003 | Enter and validate written paper marks (3) and oral marks; auto-calculate total. |
| BR-PRB-004 | Generate Pass/Fail/grade/rank by region using master thresholds. |
| BR-PRB-005 | Produce attendance, result, mark sheet, certificate, hall ticket, name list, register, and “lost by 2 marks” reports. |
| BR-PRB-006 | Lock add/update/delete of forms when `SESSION.RESGEN_PRABODH = 'Y'` (confirmed on form activate). |
| BR-PRB-007 | Allow supervisor to reset result-generated flag to re-process. |

## 3. Scope

### In scope
- All Prabodh menus under Transactions, Processing, Query, Reports, Supervisor (regen), and Prabodh roll-number paths.
- Migration of `FORM_PRABODH` and related master data used by Prabodh.
- Equivalent React screens and ASP.NET APIs.

### Out of scope
- Other exams (Subodh, Praveshika, Prathamik, Balbodhini) except shared masters.
- Inventing new grading rules not present in source.
- Full application code generation (this phase is requirements only).

## 4. Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Exam operations staff | Form & marks entry accuracy |
| Supervisor | Result regen, user control |
| Result declaration team | Grades, ranks, certificates |
| IT modernization team | Migration fidelity |

## 5. Current-state summary

- Table `FORM_PRABODH` holds candidate + marks + result in one denormalized row (~79k rows).
- Key is effectively `SRNO` + `SESSION_NO` (delete/search use `srno` and session).
- New SRNO allocated as `MAX(srno)+3` (confirmed `Cmd_save_Click`) — unusual step of 3.
- Gender M/F required; OptMale/OptFemale set `Txt_Gender`.
- Region derived from Centre → District → Region.
- Closed centres (`CLOSE_FLAG='Y'`) rejected on form-centre validate.
- Result generation is **region-wise** and only for rows where all marks including oral are non-null and `result is null`.
- Ranking: highest `TOT_MARKS` among PASS gets `SPECIAL_RANK = 'FIRST'` (session-wide; SECOND logic commented out in main path).

## 6. Business requirements (detailed)

### 6.1 Session & access
| ID | Requirement | Source | Confidence |
|----|-------------|--------|------------|
| BR-PRB-010 | System shall operate only on the session marked default (`SESSION.DEFA='Y'`). | `Frm_FormPrabodh.Form_Activate` | Confirmed |
| BR-PRB-011 | Authenticated users shall be recorded on new forms (`userid`). | `Cmd_save_Click` | Confirmed |
| BR-PRB-012 | SUPER user shall access supervisor functions including Prabodh result-flag reset. | `frmLogin`, `MDIForm1` | Confirmed |

### 6.2 Form entry
| ID | Requirement | Source | Confidence |
|----|-------------|--------|------------|
| BR-PRB-020 | Capture Name, Form Centre, Exam Centre, Region, Gender, Session, optional Roll No, SRNO. | Form controls / `RsSource` | Confirmed |
| BR-PRB-021 | Name, Form Centre, Exam Centre, Gender mandatory. | `check_data` | Confirmed |
| BR-PRB-022 | Form centre must exist and not be closed. | `Txt_Form_Centre_Validate` | Confirmed |
| BR-PRB-023 | Exam centre must exist. | `Txt_Exam_Centre_Validate` | Confirmed |
| BR-PRB-024 | On new entry, default Exam Centre = Form Centre. | `Txt_Form_Centre_Change` | Confirmed |
| BR-PRB-025 | Support New, Save, Update, Delete, Undo, First/Prev/Next/Last, Search, Insert-between. | Cmd_* + `Frm_InsertRecordBetween` | Confirmed |
| BR-PRB-026 | When `RESGEN_PRABODH='Y'`, disable New/Insert/Save/Undo/Update/Delete. | `Form_Activate` | Confirmed |
| BR-PRB-027 | Display running form count for current form centre. | `CountFormsForCentre` | Confirmed |

### 6.3 Marks
| ID | Requirement | Source | Confidence |
|----|-------------|--------|------------|
| BR-PRB-030 | Enter MARKS1–3 and ORAL_MARKS by region and roll filter. | `Frm_PrabodhMarks` | Confirmed |
| BR-PRB-031 | Marks numeric ≥0, ≤100, or 'A' (Absent). | `DataGrid1_AfterColEdit` | Confirmed |
| BR-PRB-032 | Oral max 100 (changed from 50 on 30-11-2016 — comment by Hemalata). | Same | Confirmed |
| BR-PRB-033 | TOT_MARKS = MARKS1+MARKS2+MARKS3 (oral **not** included in total). | `AfterColEdit` | Confirmed |
| BR-PRB-034 | Block marks change if result already generated for session. | `Form_Load` comment/logic | Confirmed (pattern) |

### 6.4 Result generation
| ID | Requirement | Source | Confidence |
|----|-------------|--------|------------|
| BR-PRB-040 | Generate result for selected region + active session where all four mark fields non-null and result null. | `cmd_gen_result_Click` | Confirmed |
| BR-PRB-041 | Use PAPER min_marks for papers 1–3 (exam_no=5) and EXAM grade thresholds. | Same | Confirmed |
| BR-PRB-042 | All three papers 'A' → Result Fail, Grade A, tot null. | Same | Confirmed |
| BR-PRB-043 | Any paper 'A' (not all) → Fail, Grade X. | Same | Confirmed |
| BR-PRB-044 | Total &lt; MIN_TOTAL_KHAND1 (105) → Fail, Grade X. | EXAM + code | Confirmed |
| BR-PRB-045 | Blank mark fields → Result/Grade '-'. | Same | Confirmed |
| BR-PRB-046 | Any paper &lt; min_marks OR oral &lt; 35 → Fail, Grade X. | Comment: oral 20→35 on 30-11-2016 | Confirmed |
| BR-PRB-047 | Else Pass; grade by total: ≥DIST(225) Vi. Yo.; ≥CLASS1(180) 1; ≥CLASS2(150) 2; else 3. | Same | Confirmed |
| BR-PRB-048 | Assign SPECIAL_RANK FIRST to all PASS with highest tot_marks in session. | Rank loop | Confirmed |
| BR-PRB-049 | Increment/store `Resgen_run` per generation batch. | Same | Confirmed |

### 6.5 Reports & printing
| ID | Requirement | Source | Confidence |
|----|-------------|--------|------------|
| BR-PRB-050 | Attendance sheet for Prabodh. | Menu + `Rpt_AttSheetPrabodh` | Confirmed |
| BR-PRB-051 | Result sheet, Mark sheet, Certificate, Hall ticket, Name list, Register (RG), Lost-by-2-marks. | MDI + reports | Confirmed |

## 7. Non-functional requirements

| ID | Requirement |
|----|-------------|
| BR-PRB-NFR-01 | Preserve Hindi/Devnagari display for names and report captions (Unicode UTF-8 in new system). |
| BR-PRB-NFR-02 | Support concurrent multi-user entry with optimistic concurrency on candidate rows. |
| BR-PRB-NFR-03 | Audit userid on create; *Assumption:* add update audit in new system. |
| BR-PRB-NFR-04 | Result generation must be transactional and restartable with clear status. |

## 8. Constraints

- Do not change pass thresholds or oral minimum without approved change request.
- SRNO increment-by-3 behavior must be confirmed before redesign (*Open Question*).
- Legacy single-table design may be normalized in SQL Server if mapped 1:1 functionally.

## 9. Open questions (business confirmation required)

1. Should new SRNO continue as `MAX+3`, or switch to identity/sequence +1?
2. Is SECOND rank still required? (`Cmd_ranks_Click` has FIRST+SECOND; main generate assigns FIRST only. Rank `Update` often missing — confirm intended persistence.)
3. Does `TOT_MARKS` intentionally exclude oral (and optional `REG_LANG`) forever?
4. Should region-wise rank (“FIRST IN &lt;Region&gt;”) be restored? (Commented since 26/11/2003.)
5. Is FoxPro centre export still required for Prabodh operations?
6. Exact “lost by 2 marks” definition (report SQL in `.Dsr` — confirm with sample).
7. **Where/when is `SESSION.RESGEN_PRABODH` set to `'Y'`?** Generate form does not set it (unlike Praveen/Pandit). Confirmed only that `Frm_regen_res` clears it to `'N'`.
8. Keep optional paper (`REG_LANG`) on marks UI even though result gen ignores it?
9. Oral NULL currently behaves as 0 (fails &lt;35) — preserve or treat as incomplete (`-`)?

See also: `BRD_Documents/00_DeepDive_Analysis_Addendum.md`.

## 10. Success criteria

- All confirmed BR-PRB-* implemented and traceable to React + API + SQL.
- Side-by-side result comparison on sample session/region matches legacy outputs for Pass/Fail/Grade/Rank.
- Reports produce equivalent business content (layout modernization allowed).
