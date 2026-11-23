# Business Rules and Workflows — Praveshika

| Document ID | DOC-04 |
| Version | 1.0 |
| Date | 2026-03-23 |

Legend: **[C]** Confirmed in code/DB · **[A]** Assumption · **[O]** Open

---

## 1. Domain constants

| Rule ID | Rule | Status | Source |
|---------|------|--------|--------|
| BRL-001 | Praveshika has exactly 2 papers (Marks1, Marks2) | [C] | `EXAM.NO_OF_PAPERS=2`; form fields |
| BRL-002 | Praveshika ExamNo in master = **3** | [C] | `EXAM` table |
| BRL-003 | Gen-result code currently queries Exam/Paper with ExamNo **4** | [C] | `Frm_GenResultPraveshika` lines 547–551 |
| BRL-004 | Lost-two-marks uses ExamNo **3** | [C] | `MDIForm1.Sub_LostTwoMarksPraveshika` |
| BRL-005 | Active operations use Session where `DEFA='Y'` | [C] | Multiple forms |
| BRL-006 | Marks per paper: integer 0–100 or `'A'` | [C] | Marks form |
| BRL-007 | Gender allowed values: `M`, `F` | [C] | `Txt_Gender_Change` |

---

## 2. Form entry rules

| Rule ID | Rule | Status | Source |
|---------|------|--------|--------|
| BRL-010 | Name, Form Centre, Exam Centre, Gender required | [C] | `check_data` |
| BRL-011 | Form Centre must exist and `CLOSE_FLAG <> 'Y'` | [C] | Validate |
| BRL-012 | Exam Centre must exist in CENTRE | [C] | Validate |
| BRL-013 | RegionNo derived from FormCentre → District.RegionNo | [C] | Validate |
| BRL-014 | RollNo not user-entered on form screen | [C] | Locked textbox |
| BRL-015 | On insert, UserId = logged-in user | [C] | Save path |
| BRL-016 | Normal insert SrNo = Max(SrNo)+**3** | [C] | `ClassMaster.Store_Data` |
| BRL-017 | Insert-between SrNo = PrevSrNo+**1** | [C] | Insert path |
| BRL-018 | If `RESGEN_PRAVESHIKA='Y'`, no add/edit/delete | [C] | `Proc_CheckResultGen` |
| BRL-019 | Changing Form Centre on New/Update copies to Exam Centre | [C] | Change handler |

---

## 3. Roll assignment rules

| Rule ID | Rule | Status | Source |
|---------|------|--------|--------|
| BRL-020 | Only rows with `ROLL_NO IS NULL` are numbered | [C] | SetRoll SQL |
| BRL-021 | Order: `FORM_CENTRE`, `SRNO` | [C] | ORDER BY |
| BRL-022 | Rolls assigned sequentially from FirstRoll to LastRoll | [C] | Loop |
| BRL-023 | Commit only after operator confirms first/last names match | [C] | MsgBox Yes → Commit else Rollback |
| BRL-024 | If count of null-roll forms &lt; requested roll span, abort | [C] | Validation |
| BRL-025 | Warn if max roll already exists for region/session | [C] | MsgBox |

---

## 4. Marks rules

| Rule ID | Rule | Status | Source |
|---------|------|--------|--------|
| BRL-030 | Editable only when `RESULT IS NULL` | [C] | RecordSource |
| BRL-031 | Non-numeric allowed only as `A` | [C] | AfterColEdit |
| BRL-032 | Numeric marks must be ≥ 0 and ≤ 100 | [C] | AfterColEdit |
| BRL-033 | `TOT_MARKS = Val(Marks1)+Val(Marks2)` | [C] | AfterColEdit |
| BRL-034 | Grid disabled if ResgenPraveshika=Y | [C] | Form_Load |

---

## 5. Result generation rules

Eligible row: `MARKS1 IS NOT NULL AND MARKS2 IS NOT NULL AND RESULT IS NULL` for selected session+region. **[C]**

| Rule ID | Condition | RESULT | GRADE | Notes |
|---------|-----------|--------|-------|-------|
| BRL-040 | Marks1=`A` AND Marks2=`A` | Fail | A | TotMarks set Null |
| BRL-041 | Either mark =`A` (not both) | Fail | X | |
| BRL-042 | TotMarks &lt; `EXAM.MIN_TOTAL_KHAND1` | Fail | X | Comment says 70; value from master (70 for exam 3) |
| BRL-043 | Marks1 or Marks2 empty string | `-` | `-` | After total check |
| BRL-044 | Val(Marks1) &lt; Paper1.MinMarks OR Val(Marks2) &lt; Paper2.MinMarks | Fail | X | MinMarks from PAPER |
| BRL-045 | Else | Pass | see BRL-046 | |

### Grade for Pass (BRL-046) **[C]**

Using TotMarks against Exam master:

| Condition | Grade code |
|-----------|------------|
| TotMarks ≥ DIST_MARKS | `Vi. Yo.` |
| TotMarks ≥ CLASS1_MARKS | `1` |
| TotMarks ≥ CLASS2_MARKS | `2` |
| Else | `3` |

**Sample values (ExamNo=3):** Dist=150, Class1=120, Class2=100, MinTotal=70.  
**Paper MinMarks used by legacy gen code:** from ExamNo=4 papers = **25** each. **[C]** / **[O]** OQ-002

### Ranks

| Rule ID | Rule | Status |
|---------|------|--------|
| BRL-050 | On first run (`li_runno=1`), top Pass TotMarks in region get `SPECIAL_RANK = "FIRST IN " & REGION_NAME_ENG` (ties share); **Update saved** | [C] |
| BRL-051 | Find Ranks: assign statewide `FIRST` then `SECOND` among Pass by TotMarks desc (ties share) | [C] logic |
| BRL-052 | Find Ranks persistence | [O] Missing `.Update` in `Cmd_ranks_Click` |

### Unused fields in gen path
- `PAPER.PASSING_MARKS` selected but not applied **[C]**

---

## 6. Report eligibility rules

| Rule ID | Report | Filter rule | Status |
|---------|--------|-------------|--------|
| BRL-060 | Certificate | `GRADE <> 'A' AND GRADE <> 'X'` | [C] |
| BRL-061 | Result sheet | `RESULT IS NOT NULL` | [C] |
| BRL-062 | Hall ticket | `ROLL_NO IS NOT NULL` | [C] |
| BRL-063 | Lost two marks | TotMarks in {Class1-1, Class1-2, Class2-1, Class2-2} for exam | [C] |
| BRL-064 | Attendance | Candidates of exam centre for session | [C] |

---

## 7. Workflows

### WF-01 Form registration
1. Login → ensure default session  
2. Open Form Entry  
3. New → enter Name, Gender, Centres → Save  
4. Optional Search / Insert-between  
5. Repeat until centre batch complete  

### WF-02 Roll numbering
1. Open Set Roll Nos (Praveshika)  
2. Select seat-region / session / from–to centre / first–last roll  
3. Set → verify names → Commit  

### WF-03 Marks
1. Open Marks Entry  
2. Select region + roll-from → Show  
3. Enter marks; totals auto-calc; move off row to save  

### WF-04 Result
1. Open Generate Result  
2. Select region → Generate  
3. Optional Find Ranks  
4. **[O]** Whether Resgen flag flips to Y  

### WF-05 Publish prints
Attendance → Name List → Hall Tickets → Result Sheets → Register → Certificates  

### WF-06 Correction
Supervisor Reset Flag → optional Blank Rolls / Regen Result → re-enter → re-generate  

---

## 8. Authorization rules

| Rule ID | Rule | Status |
|---------|------|--------|
| BRL-070 | Valid USERS row required | [C] |
| BRL-071 | KEY=`SUPER` required for Super menu (flag reset) | [C] |
| BRL-072 | No per-exam or per-region ACL in legacy | [C] |

---

## 9. Ambiguities summary

See BRD OQ-002, OQ-004, OQ-005, OQ-006, OQ-007.
