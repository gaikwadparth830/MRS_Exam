# Report Migration Catalog — Praveen

Document ID: RPT-CAT-PRAVEEN-001  
Parent: `../00_Report_Migration_Guide_React_ASPNET.md`  
Exam: Praveen (`EXAM_NO = 6`) | Table: `FORM_PRAVEEN` → `dbo.FormPraveen`  
**No application code — specification only.**

---

## Common Praveen report context

| Item | Value |
|------|-------|
| Papers | MARKS1–MARKS5 + ORAL_MARKS + REG_LANG (Project) |
| Total for grading/display | Sum of papers 1–5 (oral/project not in tot) |
| Result / grade | Pass/Fail/`-`; Vi. Yo./1/2/3/X/A |
| Gate | Many prints expect `RESGEN_PRAVEEN='Y'` |
| Variant rule | Session ≥ 20162 → legacy used `*_new` reports → use `variant=new\|legacy` |
| API base | `POST /api/v1/praveen/reports/{reportKey}` |
| SP prefix | `usp_Praveen_Rpt_*` |

### Standard filters

sessionNo, regionNo, examCentre, rollFrom, rollTo, variant, format=pdf

---

## RPT-PRV-01 — Attendance Sheet (Centre-wise)

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_AttSheetPraveenCentreWise.Dsr` / `_New` |
| UI | `Frm_AttSheet` → Attendance → Praveen |
| FR | FR-PRV-040 |
| React | `/praveen/reports/attendance` |
| API key | `attendance` |
| SP | `usp_Praveen_Rpt_Attendance` |
| Notes | Centre-wise layout; choose variant by session rule or explicit param |
| Status | Spec ready |

---

## RPT-PRV-02 — Result Sheet (Brief)

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_ResultPraveenBrf.Dsr` |
| UI | `Frm_ResultSheet` → Result → Praveen |
| FR | FR-PRV-041 |
| React | `/praveen/reports/result-sheet` |
| API key | `result-sheet` |
| SP | `usp_Praveen_Rpt_ResultSheet` |
| Columns | Roll, Name, Marks1–5, Oral, Project, Tot, Grade, Result, Rank, Centre, Region |
| Gate | `RESGEN_PRAVEEN='Y'` (legacy check) |
| Status | Spec ready |

---

## RPT-PRV-03 — Mark Sheet

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_MarkSheetPraveen.Dsr` / `_new` |
| UI | `Frm_MarkSheet` → Mark Sheet → Praveen |
| FR | FR-PRV-042 |
| React | `/praveen/reports/mark-sheet` |
| API key | `mark-sheet` |
| SP | `usp_Praveen_Rpt_MarkSheet` |
| Filters | session, region, rollFrom–To, variant |
| Status | Spec ready |

---

## RPT-PRV-04 — Certificate

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_Certificate_Praveen.Dsr` |
| UI | `Frm_Certificate_Printing` → Praveen |
| FR | FR-PRV-043 |
| React | `/praveen/reports/certificate` |
| API key | `certificate` |
| SP | `usp_Praveen_Rpt_Certificate` |
| Notes | Formal layout; Pass filter — confirm; Unicode Hindi |
| Status | Spec ready — BA layout sign-off |

---

## RPT-PRV-05 — Name List

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_NameListPraveen.Dsr` |
| UI | `Frm_NameList` → Praveen |
| FR | FR-PRV-044 |
| React | `/praveen/reports/name-list` |
| API key | `name-list` |
| SP | `usp_Praveen_Rpt_NameList` |
| Columns | Roll, Name, Centres, Region (no gender on Praveen form) |
| Priority | Build early in R3 |
| Status | Spec ready |

---

## RPT-PRV-06 — Register (RG)

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_RGPraveen.Dsr` / `_new` |
| UI | `Frm_RGOtherThanPandit` / `Frm_RegionwiseRegister` |
| FR | FR-PRV-045 |
| React | `/praveen/reports/register` |
| API key | `register` |
| SP | `usp_Praveen_Rpt_Register` |
| Notes | Dummy centre grouping; region-wise option; pass % label behaviour differs for Praveen in legacy — confirm desired modern behaviour |
| Status | Spec ready |

---

## RPT-PRV-07 — Lost by 2 Marks

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_LostTwoMarksPraveen_new.Dsr` |
| UI | Query → Lost two marks → Praveen |
| FR | FR-PRV-046 |
| React | `/praveen/reports/lost-two-marks` |
| API key | `lost-two-marks` |
| SP | `usp_Praveen_Rpt_LostTwoMarks` |
| Logic | `Cmd_LosingTwoMarksPraveen` exam code 6 — extract SQL; do not invent |
| Status | Spec pending SQL extract |

---

## RPT-PRV-08 — Ranks

| Attribute | Specification |
|-----------|---------------|
| Legacy | `Rpt_Praveen_Ranks.Dsr` |
| UI | Gen Result “duplicate ranks” / ranks report |
| FR | FR-PRV-047 |
| React | `/praveen/reports/ranks` |
| API key | `ranks` |
| SP | `usp_Praveen_Rpt_Ranks` |
| Columns | Roll, Name, Tot_Marks, Special_Rank, Region |
| Notes | FIRST (and SECOND if approved) among PASS |
| Status | Spec ready |

---

## Suggested build sequence (Praveen)

Reuse Prabodh report platform, then:  
Name list → Attendance → Result → Mark sheet → Certificate → Register → Ranks → Lost-by-2  

## Dependencies

- Shared report platform (Phase R1)  
- Prabodh report patterns as templates  
- FormPraveen data migrated including REG_LANG  
