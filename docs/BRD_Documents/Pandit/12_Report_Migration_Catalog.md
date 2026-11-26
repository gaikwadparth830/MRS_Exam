# Report Migration Catalog — Pandit

Document ID: RPT-CAT-PANDIT-001  
Parent: `../00_Report_Migration_Guide_React_ASPNET.md`  
Exam: Pandit (`EXAM_NO = 7`) | Table: `FORM_PANDIT` → `dbo.FormPandit`  
**No application code — specification only.**

---

## Common Pandit report context

| Item | Value |
|------|-------|
| Structure | Khand I / II; NEW (`flgportion=N`) vs OLD (`O`); CrossRef flags |
| Papers (NEW) | Marks1–4 (Khand I); Marks5–8 + Oral (Khand II area) |
| Result texts | Absent, Fail, Pandit Khand1 Pass, Pandit Khand2 Pass, Pandit Exam Pass |
| Grades | A, X, `-`, 1, 2, 3, Vi. Yo. |
| Gate | `RESGEN_PANDIT='Y'` for result/mark prints |
| Variants | Mark sheet: `new` / `onlynew` / `20162` — single API + `variant` param |
| API base | `POST /api/v1/pandit/reports/{reportKey}` |
| SP prefix | `usp_Pandit_Rpt_*` |

### Extra filters (beyond standard)

| Filter | Use |
|--------|-----|
| portion | N / O / All |
| khandAppearing | I / II / All |
| variant | mark-sheet layout |
| passingMode | full / khand1 / khand2 for students-passing |

---

## RPT-PND-01 — Attendance Sheet

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_AttSheetPandit.Dsr` / `_new` |
| UI | `Frm_AttSheet` → Attendance → Pandit |
| FR | FR-PND-050 |
| React | `/pandit/reports/attendance` |
| API key | `attendance` |
| SP | `usp_Pandit_Rpt_Attendance` |
| Notes | PARAMETER centre-head texts for Pandit; session variant |
| Status | Spec ready |

---

## RPT-PND-02 — Result Sheet

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_ResultPandit.Dsr` |
| UI | `Frm_ResultSheet` → Result → Pandit |
| FR | FR-PND-051 |
| React | `/pandit/reports/result` |
| API key | `result` |
| SP | `usp_Pandit_Rpt_Result` |
| Columns | Roll, Name, Khand, Khand1/2 tots, Tot, Grade, Result, Rank, Centres |
| Gate | `RESGEN_PANDIT='Y'` |
| Status | Spec ready |

---

## RPT-PND-03 — Result Details

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_ResultPanditDetails.Dsr` |
| UI | Result details path |
| FR | FR-PND-051 |
| React | `/pandit/reports/result-details` |
| API key | `result-details` |
| SP | `usp_Pandit_Rpt_ResultDetails` |
| Columns | Per-paper marks 1–8, oral, concession, und, both-khand flags |
| Status | Spec ready |

---

## RPT-PND-04 — Mark Sheet (variants)

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_MarkSheetPandit_new` / `_onlynew` / `_20162_new` / classic |
| UI | `Frm_MarkSheet` → Pandit |
| FR | FR-PND-052 |
| React | `/pandit/reports/mark-sheet` |
| API key | `mark-sheet` |
| Request | `{ sessionNo, rollFrom, rollTo, variant, portion }` |
| SP | `usp_Pandit_Rpt_MarkSheet` (variant switches column set / labels) |
| React UI | Variant picker component |
| Open question | Collapse to one template long-term? |
| Status | Spec ready |

---

## RPT-PND-05 — Name List

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_NameListPandit.Dsr` |
| UI | Name List → Pandit |
| FR | FR-PND-053 |
| React | `/pandit/reports/name-list` |
| API key | `name-list` |
| SP | `usp_Pandit_Rpt_NameList` |
| Columns | Roll, Name, Centres, Khand_Appearing, Portion, Address optional |
| Priority | Build early in R4 |
| Status | Spec ready |

---

## RPT-PND-06 — Register (RG)

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_RGPandit_New.Dsr` / `Rpt_RGPandit.Dsr` |
| UI | `Frm_PanditRegister` |
| FR | FR-PND-054 |
| React | `/pandit/reports/register` |
| API key | `register` |
| SP | `usp_Pandit_Rpt_Register` |
| Notes | DummyCentreCode grouping in legacy `ProcSetDummyCentreCode` — replicate in SQL |
| Status | Spec ready |

---

## RPT-PND-07 — Ranks

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_Pandit_Ranks.Dsr` |
| FR | FR-PND-055 |
| React | `/pandit/reports/ranks` |
| API key | `ranks` |
| SP | `usp_Pandit_Rpt_Ranks` |
| Filter | Prefer `RESULT = 'Pandit Exam Pass'` for FIRST/SECOND |
| Status | Spec ready |

---

## RPT-PND-08 — Students Passing Pandit

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_StudentsPassingPandit` / `1` / `2` + `Frm_StudentsPassingPandit` |
| FR | FR-PND-056 |
| React | `/pandit/reports/students-passing` |
| API key | `students-passing` |
| Request | `{ sessionNo, passingMode: full\|khand1\|khand2 }` |
| SP | `usp_Pandit_Rpt_StudentsPassing` |
| Modes | Full exam pass / Khand1 pass / Khand2 pass |
| Status | Spec ready |

---

## RPT-PND-09 — Lost by 2 Marks

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_LostTwoMarksPandit.Dsr` |
| UI | Query → Lost two marks → Pandit |
| FR | FR-PND-057 |
| React | `/pandit/reports/lost-two-marks` |
| API key | `lost-two-marks` |
| SP | `usp_Pandit_Rpt_LostTwoMarks` |
| Logic | `Cmd_LosingTwoMarksPandit` exam 7 — extract; do not invent |
| Status | Spec pending SQL extract |

---

## Suggested build sequence (Pandit)

After Prabodh/Praveen platform:

1. Name list  
2. Attendance  
3. Result + Result details  
4. Mark sheet (start with `variant=new` only)  
5. Students passing  
6. Register  
7. Ranks  
8. Other mark-sheet variants  
9. Lost by 2 marks  

## Dependencies / risks

- Result strings and Khand totals must match result engine  
- CrossRef fields affect who appears as Exam Pass  
- Portion N/O dual paths  
- Do not migrate `lblpandit.mdb` unless BA confirms still needed (no code refs found)  
