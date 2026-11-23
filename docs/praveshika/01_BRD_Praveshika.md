# Business Requirements Document (BRD) — Praveshika Exam System

| Field | Value |
|-------|-------|
| Document ID | BRD-PRAVESHIKA-001 |
| Version | 1.0 (Draft for review) |
| Date | 2026-03-23 |
| System | Praveshika Examination Processing |
| Legacy | VB6 + Microsoft Access (`MRSEXAM.mdb`) |
| Target | React + TypeScript + MUI · ASP.NET Core · SQL Server |
| Scope | **Praveshika exam only** |
| Classification | Confirmed = observed in source/DB · Assumption = labelled · Open = needs business confirmation |

---

## 1. Executive summary

Modernize the **Praveshika** exam operations currently performed in the legacy MrsExam VB6 application into a web application, **preserving existing business behaviour** unless changes are explicitly approved.

Praveshika is a **two-paper** exam. Candidates are registered via form entry, assigned roll numbers, awarded marks, then evaluated (pass/fail + grade + ranks). Outputs include attendance sheets, name lists, hall tickets, result sheets, registers, and certificates.

---

## 2. Business objectives

| ID | Objective |
|----|-----------|
| BO-001 | Preserve all confirmed Praveshika operational workflows from the legacy system |
| BO-002 | Replace Access with SQL Server while retaining semantic data fidelity |
| BO-003 | Provide a secure web UI for data entry, processing, and report generation |
| BO-004 | Improve maintainability and remove known legacy defects only after business approval |
| BO-005 | Support Hindi (Devanagari) candidate/centre names as in legacy data |

---

## 3. Stakeholders (inferred)

| Role | Interest |
|------|----------|
| Exam operations staff | Form entry, marks, roll numbers |
| Supervisors | Result generation, flag reset, corrections |
| Regional officers | Region-filtered reports |
| IT / modernization team | Architecture, migration, APIs |
| Business owners | Rule confirmation (open questions) |

*Exact org roles beyond `USERS.KEY` (`SUPER` vs others) are **not** defined in code — **Open (OQ-001)**.*

---

## 4. In-scope / out-of-scope

### In scope
- Praveshika form entry, marks, roll assignment, result generation, ranks  
- Shared masters as used by Praveshika (Region, District, Centre, Session, Exam, Paper, Grade, Users)  
- Praveshika reports listed in DOC-00  
- Auth equivalent to legacy (login + SUPER menu privilege)  
- Data migration of Praveshika-related tables  

### Out of scope (this BRD)
- Other exams (Pandit, Praveen, Prabodh, Subodh, Prathamik, Balbodhini) as full products  
- Building the complete application in this phase (documentation only)  
- Inventing new business rules not present in legacy  

---

## 5. Current-state summary

| Area | Current state |
|------|----------------|
| UI | VB6 MDI (`MDIForm1`) |
| Data | Access MDB; ODBC DSN `Praveshika` |
| Core entity | `FORM_PRAVESHIKA` (~470k historical rows) |
| Exam master key | `EXAM_NO = 3` for Praveshika |
| Papers | 2 (`MARKS1`, `MARKS2`), max 100 each or `"A"` (absent) |
| Locking | `SESSION.RESGEN_PRAVESHIKA` disables edit when `'Y'` |
| Reports | VB Data Reports via Data Environment |

---

## 6. Business requirements (module-wise)

### 6.1 Authentication & access — Module AUTH

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-001 | Users must authenticate with userid/password against user master before accessing the system | Must | Confirmed | `frmLogin.frm` |
| BR-002 | Non-`SUPER` users must not access Supervisor functions (result-flag reset and related) | Must | Confirmed | `frmLogin.frm` hides `Sub_Super` |
| BR-003 | System must record `userid` on form insert | Should | Confirmed | `Frm_FormPraveshika` / `ClassMaster` |

### 6.2 Session & masters — Module MASTER

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-010 | System operates against a designated default session (`DEFA='Y'`) for most Praveshika operations | Must | Confirmed | Multiple forms |
| BR-011 | Maintain Region (`REGION_NO`, names, `SEAT_REGION_NO`) | Must | Confirmed | `Frm_Region` |
| BR-012 | Maintain District linked to Region (`SEAT_DISTRICT_NO` for seating order) | Must | Confirmed | `Frm_District` |
| BR-013 | Maintain Centre linked to District; support `CLOSE_FLAG` preventing closed centres for form centre | Must | Confirmed | `Frm_Centre`, form validate |
| BR-014 | Maintain Exam master thresholds for Praveshika: `MIN_TOTAL_KHAND1`, `CLASS1/2/3_MARKS`, `DIST_MARKS`, `NO_OF_PAPERS` | Must | Confirmed | `EXAM` where `EXAM_NO=3` |
| BR-015 | Maintain Paper master (paper 1 & 2) with `MIN_MARKS` used in pass logic | Must | Confirmed (logic) / **Open data** | Gen result + `PAPER` |
| BR-016 | Maintain Grade lookup for display/certificate captions | Should | Confirmed | `GRADE` table / reports |
| BR-017 | Maintain Session including `RESGEN_PRAVESHIKA`, month, result date | Must | Confirmed | `SESSION` |

**Current DB thresholds for Praveshika (`EXAM_NO=3`) — Confirmed:**

| Field | Value |
|-------|------:|
| `NO_OF_PAPERS` | 2 |
| `FEES` | 14 |
| `MIN_TOTAL_KHAND1` | 70 |
| `CLASS1_MARKS` | 120 |
| `CLASS2_MARKS` | 100 |
| `CLASS3_MARKS` | 70 |
| `DIST_MARKS` | 150 |

*Paper `MIN_MARKS` currently only exist under `EXAM_NO=4` (=25). See OQ-002.*

### 6.3 Form entry — Module FORM

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-020 | Capture candidate forms: Name, Gender (M/F), Form Centre, Exam Centre, Session, Region (derived) | Must | Confirmed | `Frm_FormPraveshika` |
| BR-021 | Roll number is **not** entered by user at form entry; assigned later | Must | Confirmed | `ClassMaster` comments / locked control |
| BR-022 | Support New, Save (insert), Update, Delete, Undo, Search, First/Prev/Next/Last | Must | Confirmed | Form buttons + `ClassMaster` |
| BR-023 | Support insert-between using previous SrNo | Should | Confirmed | `Cmd_Insert` → `Frm_InsertRecordBetween` |
| BR-024 | Validate non-blank Name, Form Centre, Exam Centre, Gender | Must | Confirmed | `check_data` |
| BR-025 | Validate centres exist; Form Centre must not be closed (`CLOSE_FLAG <> 'Y'`) | Must | Confirmed | Validate events |
| BR-026 | Derive Region from Form Centre → District → Region | Must | Confirmed | `Txt_Form_Centre_Validate` |
| BR-027 | On new/update, changing Form Centre copies value to Exam Centre by default | Should | Confirmed | Change handler |
| BR-028 | When `RESGEN_PRAVESHIKA='Y'`, disable New/Insert/Save/Update/Delete/Undo | Must | Confirmed | `Proc_CheckResultGen` |
| BR-029 | Show count of forms for current form centre + session | Could | Confirmed | `CountFormsForCentre` |
| BR-030 | Name max length 60 | Must | Confirmed | Schema / control |
| BR-031 | Support name search for navigation | Should | Confirmed | `Frm_Search` |

### 6.4 Roll number assignment — Module ROLL

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-040 | Assign sequential roll numbers to forms with `ROLL_NO IS NULL` within selected centre range and session, ordered by `FORM_CENTRE`, `SRNO` | Must | Confirmed | `Frm_SetRollNo_FromToCentre` |
| BR-041 | User specifies first/last roll and from/to centre; confirm first/last names before commit | Must | Confirmed | Same form (transaction commit/rollback) |
| BR-042 | Support Aurangabad/late path assigning null rolls for a selected form centre | Should | Confirmed | `Frm_SetRollNoAur` |
| BR-043 | Support blanking roll numbers from a given roll onward within region (correction) | Should | Confirmed | `Frm_BlankRollNo` |
| BR-044 | Seat-region grouping drives region selection for roll assignment | Should | Confirmed | `SEAT_REGION_NO` |

### 6.5 Marks entry — Module MARKS

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-050 | Enter/edit `MARKS1` and `MARKS2` only for records with `RESULT IS NULL` | Must | Confirmed | `Frm_PraveshikaMarks` |
| BR-051 | Filter by session, region, and roll-from | Must | Confirmed | `CmdShow` |
| BR-052 | Marks must be numeric ≥ 0 and ≤ **100**, or letter **`A`** (absent) | Must | Confirmed | `DataGrid1_AfterColEdit` |
| BR-053 | `TOT_MARKS = Val(MARKS1) + Val(MARKS2)` (`A` contributes 0) | Must | Confirmed | Same |
| BR-054 | Disable marks grid when `RESGEN_PRAVESHIKA='Y'` | Must | Confirmed | `Form_Load` |
| BR-055 | Persist marks on row leave / grid update (no separate Save button) | Must | Confirmed | Adodc optimistic update |

### 6.6 Result generation — Module RESULT

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-060 | Generate results for selected region + default session for rows where both marks present and `RESULT IS NULL` | Must | Confirmed | `Frm_GenResultPraveshika.cmd_gen_result_Click` |
| BR-061 | Apply pass/fail/grade rules per BR-DOC-04 (business rules) using Exam/Paper thresholds | Must | Confirmed | Same |
| BR-062 | Assign region-wise special rank `"FIRST IN {REGION_NAME_ENG}"` for top total(s) among Pass, on first run for region | Should | Confirmed | Same (`li_runno = 1`) |
| BR-063 | Support statewide FIRST / SECOND rank assignment among Pass by total marks (ties share) | Should | Confirmed logic / **Open persistence** | `Cmd_ranks_Click` (AMB-003) |
| BR-064 | Increment / store `RESGEN_RUN` per generation | Should | Confirmed | Field update |
| BR-065 | Require Exam and Paper master data before generation | Must | Confirmed | Error messages in form |

**Open:** Whether generation should read `EXAM_NO=3` (Praveshika) or continue legacy `EXAM_NO=4` (OQ-002).

### 6.7 Result correction / unlock — Module REGEN

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-070 | Supervisor can reset `RESGEN_PRAVESHIKA='N'` for default session | Must | Confirmed | `Frm_regen_res` |
| BR-071 | Authorized user can clear/re-enter marks and clear grade/result/rank for a roll | Should | Confirmed | `Frm_RegenResult` |
| BR-072 | Clearing a record with special rank clears special ranks for whole region | Should | Confirmed | `Frm_RegenResult` |

### 6.8 Reporting & printing — Module REPORT

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-080 | Attendance sheet by centre (pack rolls into temp AttSheet; 2 columns × 25) | Must | Confirmed | `Frm_AttSheet` |
| BR-081 | Name list by session / optional exam centre | Must | Confirmed | `Frm_NameList` |
| BR-082 | Hall tickets by region ± roll range | Must | Confirmed | `Frm_PrintHallTicket` |
| BR-083 | Result sheet with name; and result sheet without name | Must | Confirmed | `Frm_ResultSheet` |
| BR-084 | Certificates for non-fail grades (`grade <> 'A'` and `<> 'X'`) by region ± roll | Must | Confirmed | `Frm_Certificate_Printing` |
| BR-085 | Result register (region-wise) with dummy centre codes for layout | Must | Confirmed | `Frm_RGOtherThanPandit` / Regionwise |
| BR-086 | “Losing grade by 2 marks” query/report | Should | Confirmed | `Cmd_LosingTwoMarksPraveshika` + report |

### 6.9 Batch / utility — Module UTIL

| ID | Requirement | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| BR-090 | Batch insert forms into `FORM_PRAVESHIKA` for a roll/centre range | Could | Confirmed | `frm_insertbatch` |
| BR-091 | Export centres used by Praveshika forms for a session | Could | Confirmed | `Frm_ExportData` Option2 |
| BR-092 | User maintenance (userid/password/key) | Should | Confirmed | `Frm_Usermast` |

---

## 7. Non-functional requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| NFR-001 | Support Devanagari text (names, centres) end-to-end | Must | Legacy data is Hindi |
| NFR-002 | Handle large `FORM_PRAVESHIKA` volumes (100k+ rows/session historically) | Must | Indexing/pagination |
| NFR-003 | Auditable result generation (who/when/run) | Should | Legacy has `resgen_run` + `userid` on forms only |
| NFR-004 | Role-based access at least SUPER vs Operator | Must | Expand roles = change request |
| NFR-005 | Report output: PDF (and print) replacing VB Data Reports | Must | Modern equivalent |
| NFR-006 | Secure password storage (upgrade from legacy reversible/encryption scheme) | Must | **Change from legacy** — confirm OQ-003 |
| NFR-007 | Response times suitable for grid marks entry | Should | |
| NFR-008 | Backup/restore of SQL Server DB | Must | Ops |

---

## 8. Assumptions

| ID | Assumption |
|----|------------|
| AS-001 | Only Praveshika is modernized in phase 1; shared masters may be reused later for other exams |
| AS-002 | Business wants behavioural parity with legacy rules unless an open question decides otherwise |
| AS-003 | Web app replaces desktop; multi-user concurrent entry is desired |
| AS-004 | Report layouts may be redesigned visually but must retain same data fields and filters |

---

## 9. Open questions (business confirmation required)

| ID | Question | Why it matters |
|----|----------|----------------|
| OQ-001 | What user roles beyond SUPER/operator are required? | Authorization design |
| OQ-002 | Should result generation use `EXAM_NO=3` (Praveshika) with dedicated PAPER rows, or keep legacy hardcode `EXAM_NO=4`? | Correct thresholds |
| OQ-003 | Approve modern password hashing vs legacy scheme? | Security |
| OQ-004 | When should `RESGEN_PRAVESHIKA` become `'Y'`? (No setter found in VB6) | Lock workflow |
| OQ-005 | Should statewide FIRST/SECOND ranks be persisted (fix missing `.Update`)? | Rank integrity |
| OQ-006 | Confirm SrNo allocation strategy (`max+3` vs insert-between `+1`) for new system | Key generation |
| OQ-007 | Are `UND_FLAG` / `UND_CLASS` used for Praveshika? (columns exist; no Praveshika UI found) | Data model |
| OQ-008 | Certificate eligibility: only Pass grades, or any grade not A/X (includes Pass only in practice)? | Report filter already `grade<>A/X` |
| OQ-009 | Multi-session historical reporting vs default-session-only operations | UX |
| OQ-010 | Should fees (`EXAM.FEES=14`) appear in new UI? (not used in Praveshika processing forms) | Scope |

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| exam_no 3 vs 4 mismatch | Resolve OQ-002 before coding result engine |
| Large Access migration | Staged ETL + checksums by session |
| Hindi encoding | UTF-8 SQL Server + NVARCHAR |
| Silent rank bug | Confirm OQ-005; add tests |
| Lock flag never set | Confirm OQ-004; implement explicit post-gen lock |

---

## 11. Success criteria

1. All Must-priority BR/FR items implemented and traced (RTM).  
2. Result engine produces same Pass/Fail/Grade outcomes as legacy for a frozen sample session (given same master thresholds).  
3. All Praveshika reports regenerable with equivalent filters.  
4. Open questions closed or formally deferred.  
5. No unauthorized change to business rules.

---

## 12. Approval

| Role | Name | Date | Sign-off |
|------|------|------|----------|
| Business owner | | | |
| Operations lead | | | |
| IT / modernization lead | | | |

---

*Related: `00_Source_Inventory_and_Overview.md`, `02_FRS_Praveshika.md`, `04_Business_Rules_and_Workflows.md`*
