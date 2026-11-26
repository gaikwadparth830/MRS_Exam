# Report Migration Catalog — Prabodh

Document ID: RPT-CAT-PRABODH-001  
Parent: `../00_Report_Migration_Guide_React_ASPNET.md`  
Exam: Prabodh (`EXAM_NO = 5`) | Table: `FORM_PRABODH` → `dbo.FormPrabodh`  
**No application code in this document — specification only.**

---

## Common Prabodh report context

| Item | Value |
|------|-------|
| Papers | MARKS1, MARKS2, MARKS3 + ORAL_MARKS |
| Total for display | Usually MARKS1+2+3 (oral separate) |
| Result values | Pass, Fail, `-` |
| Grades | Vi. Yo., 1, 2, 3, X, A, `-` |
| Default session | `SESSION.DEFA = 'Y'` |
| Suggested API base | `POST /api/v1/prabodh/reports/{reportKey}` |
| Suggested SP prefix | `usp_Prabodh_Rpt_*` |

### Standard filters (use where applicable)

| Filter | Required? | Notes |
|--------|-----------|-------|
| sessionNo | Yes (default active) | |
| regionNo | Often | Region name combo in legacy |
| examCentre | Optional | Attendance / some lists |
| rollFrom / rollTo | Optional | Mark sheet, certificate, hall ticket |
| format | pdf | |

---

## RPT-PRB-01 — Attendance Sheet

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_AttSheetPrabodh.Dsr` |
| Legacy UI | `Frm_AttSheet` + menu Attendance → Prabodh |
| FR / BR | FR-PRB-060 / BR-PRB-050 |
| React route | `/prabodh/reports/attendance` |
| API key | `attendance` |
| Dataset SP (proposed name) | `usp_Prabodh_Rpt_Attendance` |
| Key columns | Roll_No, Name, Exam_Centre, (signature blanks), paper date columns from PARAMETER |
| Grouping | Exam centre |
| Gate | Session selected |
| PDF layout notes | Centre head, instructions from PARAMETER.HEADING_ATTSHEET, paper labels |
| Golden sample | Attach legacy print for one centre |
| Status | Spec ready |

---

## RPT-PRB-02 — Result Sheet

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_ResultSheetPrabodh.Dsr` |
| Legacy UI | `Frm_ResultSheet` + Result Sheet → Prabodh |
| FR / BR | FR-PRB-061 |
| React route | `/prabodh/reports/result-sheet` |
| API key | `result-sheet` |
| Dataset SP | `usp_Prabodh_Rpt_ResultSheet` |
| Key columns | Roll_No, Name, Marks1–3, Oral, Tot_Marks, Grade, Result, Special_Rank, Centre |
| Grouping | Region / centre (match legacy) |
| Gate | Prefer `RESGEN_PRABODH='Y'` — **confirm** |
| PDF layout notes | Pass/Fail visibility; Hindi headings |
| Status | Spec ready |

---

## RPT-PRB-03 — Mark Sheet

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_MarkSheetPrabodh.Dsr` |
| Legacy UI | `Frm_MarkSheet` + Mark Sheet → Prabodh |
| FR / BR | FR-PRB-062 |
| React route | `/prabodh/reports/mark-sheet` |
| API key | `mark-sheet` |
| Dataset SP | `usp_Prabodh_Rpt_MarkSheet` |
| Filters | session, region, rollFrom, rollTo |
| Key columns | Student identity, per-paper marks, oral, total, grade, result, rank |
| Gate | Result generated recommended |
| PDF layout notes | One student per page or continuous — match golden sample |
| Status | Spec ready |

---

## RPT-PRB-04 — Certificate

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_Certificate_Prabodh.Dsr` |
| Legacy UI | `Frm_Certificate_Printing` + Certificate → Prabodh |
| FR / BR | FR-PRB-063 |
| React route | `/prabodh/reports/certificate` |
| API key | `certificate` |
| Dataset SP | `usp_Prabodh_Rpt_Certificate` |
| Filters | session, region, roll range; typically Pass only — **confirm** |
| Key columns | Name, Roll, Session/Month, Grade, Result, Institution |
| Gate | Pass students; RESGEN — **confirm** |
| PDF layout notes | Formal certificate; stationery/margins critical; Unicode Hindi |
| Auth | Restrict print role if required |
| Status | Spec ready — needs BA layout sign-off |

---

## RPT-PRB-05 — Hall Ticket

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_HallTicket_Prabodh.Dsr` |
| Legacy UI | `Frm_PrintHallTicket` + Hall Ticket → Prabodh |
| FR / BR | FR-PRB-064 |
| React route | `/prabodh/reports/hall-ticket` |
| API key | `hall-ticket` |
| Dataset SP | `usp_Prabodh_Rpt_HallTicket` |
| Filters | session, centre and/or roll range |
| Key columns | Roll, Name, Centre, Exam/session, paper schedule blanks |
| Gate | Forms entered; rolls assigned |
| Timing | Pre-exam (before marks) |
| Status | Spec ready |

---

## RPT-PRB-06 — Name List

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_NameListPrabodh.Dsr` |
| Legacy UI | `Frm_NameList` + Name List → Prabodh |
| FR / BR | FR-PRB-065 |
| React route | `/prabodh/reports/name-list` |
| API key | `name-list` |
| Dataset SP | `usp_Prabodh_Rpt_NameList` |
| Key columns | Roll_No, Name, Form_Centre, Exam_Centre, Gender, Region |
| Grouping | Centre optional |
| Priority | **First Prabodh report to build** (simplest) |
| Status | Spec ready |

---

## RPT-PRB-07 — Register (RG)

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_RGPrabodh.Dsr` |
| Legacy UI | `Frm_RGOtherThanPandit` + Register → Prabodh |
| FR / BR | FR-PRB-066 |
| React route | `/prabodh/reports/register` |
| API key | `register` |
| Dataset SP | `usp_Prabodh_Rpt_Register` |
| Prep logic | Legacy sets `DummyCentreCode` for grouping — replicate in SQL |
| Summary stats | Pass %, Fail (X), Absent (A), pending — match `ProcPrintRegister` |
| Status | Spec ready — extract exact stats SQL during build |

---

## RPT-PRB-08 — Lost by 2 Marks

| Attribute | Specification |
|-----------|---------------|
| Legacy report | `Rpt_LostTwoMarksPrabodh.Dsr` |
| Legacy UI | Query → Lost two marks → Prabodh |
| FR / BR | FR-PRB-067 |
| React route | `/prabodh/reports/lost-two-marks` |
| API key | `lost-two-marks` |
| Dataset SP | `usp_Prabodh_Rpt_LostTwoMarks` |
| Logic | DE command `Cmd_LosingTwoMarksPrabodh` with exam code 5 — **extract SQL; do not invent threshold** |
| Open question | Exact “2 marks” definition vs grade bands |
| Status | Spec pending SQL extract |

---

## Suggested build sequence (Prabodh)

1. RPT-PRB-06 Name list  
2. RPT-PRB-01 Attendance  
3. RPT-PRB-02 Result sheet  
4. RPT-PRB-03 Mark sheet  
5. RPT-PRB-05 Hall ticket  
6. RPT-PRB-04 Certificate  
7. RPT-PRB-07 Register  
8. RPT-PRB-08 Lost by 2 marks  

## Ticket template (copy)

```text
Title: Report – Prabodh – {Report Name} ({Report ID})
Links: FR-…, RPT-PRB-…
Tasks:
 - Extract legacy SQL/filters
 - Create SQL Server dataset
 - API endpoint contract
 - PDF layout from golden sample
 - React filter + preview page
 - Parity test vs legacy print
Deliverable: Working PDF report (no VB dependency)
```
