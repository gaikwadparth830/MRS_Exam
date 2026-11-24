# Subodh Exam — Source Inventory & Application Overview

| Field | Value |
|-------|-------|
| Document ID | SUB-INV-001 |
| Scope | **Subodh exam only** (EXAM_NO = 4) |
| Legacy stack | VB6 desktop + Microsoft Access (`.mdb`) |
| Target stack | React + TypeScript + MUI / ASP.NET Core Web API (C#) / SQL Server |
| Analysis date | 24 Nov 2026 |
| Source root | `MrsExam/` |
| DB analysed | `MrsExam/Database/MRSEXAM.mdb` (read-only) |
| Status | Confirmed from source unless marked **Assumption** |

---

## 1. Application overview

**MrsExam** (“Pre-Exam and Result System”, company `PCHOUSE`) is a multi-exam VB6 MDI application. This workspace build packages as `Subodh22122017.exe` and the supplied Access database is **Subodh-heavy**: `FORM_SUBODH` has ~401,590 rows while other `FORM_*` tables are empty (0 rows) in this copy.

Subodh is a **two-paper** Rashtrabhasha exam:

| Attribute | Confirmed value | Source |
|-----------|-----------------|--------|
| Exam number | `4` | `EXAM` table; `Frm_GenResultSubodh.frm` (`exam_no = 4`) |
| Papers | 2 (`MARKS1`, `MARKS2`) | `PAPER` where `EXAM_NO=4`; marks form |
| Fee | 15 | `EXAM.FEES` for exam 4 |
| Candidate table | `FORM_SUBODH` | Forms, reports, queries |
| Result lock flag | `SESSION.RESGEN_SUBODH` (`Y`/`N`) | Form entry / marks screens |

**Out of scope for this BRD:** Pandit, Praveen, Prabodh, Praveshika, Prathamik, Balbodhini exam-specific features (except shared masters reused by Subodh).

---

## 2. Source inventory (Subodh-relevant)

### 2.1 Project & modules

| File | Role |
|------|------|
| `MrsExam/Project1.vbp` | VB6 project; startup `frm_Splash`; EXE name `Subodh22122017.exe` |
| `MrsExam/ClassModules/Module1.bas` | Global connection, messages, login globals, encryption helpers |
| `MrsExam/ClassModules/ClassCommon.cls` | Validation helpers, status bar |
| `MrsExam/ClassModules/ClassMaster.cls` | CRUD navigation framework used by form entry |

### 2.2 Dedicated Subodh forms

| Form | File | Purpose |
|------|------|---------|
| Candidate form entry | `Forms/Frm_FormSubodh.frm` | Add/Edit/Delete/Search candidates |
| Marks entry | `Forms/Frm_SubodhMarks.frm` | Enter Paper 1 / Paper 2 / total |
| Generate result | `Forms/Frm_GenResultSubodh.frm` | Pass/Fail, grade, region rank |

### 2.3 Shared forms used for Subodh (parameterised by exam name / menu check)

| Form | File | Subodh usage |
|------|------|--------------|
| MDI shell | `Forms/MDIForm1.frm` | All Subodh menu launches |
| Login / splash / session | `frmLogin.frm`, `frm_Splash.frm`, `Frm_SelectSession.frm`, `Frm_Session.frm` | Auth + default session |
| Masters | `Frm_Region.frm`, `Frm_District.frm`, `Frm_Centre.frm`, `Frm_Exam.frm`, `Frm_Paper.frm` | Shared reference data |
| Users | `Frm_Usermast.frm` | User accounts |
| Search | `Frm_Search.frm` | Name search against `form_subodh` |
| Insert between | `Frm_InsertRecordBetween.frm` | Insert candidate between two records |
| Set roll numbers | `Frm_SetRollNo1.frm`, `Frm_SetRollNoAur.frm`, `Frm_SetRollNo_FromToCentre.frm`, `Frm_BlankRollNo.frm` | Allocate roll nos for Subodh |
| Attendance sheet | `Frm_AttSheet.frm` | Build/print Subodh attendance |
| Hall ticket | `Frm_PrintHallTicket.frm` | Print Subodh hall tickets |
| Certificate | `Frm_Certificate_Printing.frm` | Print Subodh certificates |
| Result sheet | `Frm_ResultSheet.frm` | Result sheet / “no name” variant |
| Name list | `Frm_NameList.frm` | Candidate name list |
| Register | `Frm_RGOtherThanPandit.frm`, `Frm_RegionwiseRegister.frm` | Subodh register reports |
| Regen result | `Frm_regen_res.frm`, `Frm_RegenResult.frm` | Result regeneration UI |
| Export / backup / utilities | `Frm_ExportData.frm`, `FrmBackup.frm`, `Frm_CentreWiseNoOfStudent.frm`, `Frm_Userwiselist_Totforms.frm`, `frm_insertbatch.frm` | Ops utilities with Subodh branches |

### 2.4 Subodh reports (Data Report designers)

| Report | File |
|--------|------|
| Result sheet | `Reports/Rpt_ResultSheetSubodh.Dsr` |
| Result sheet (no name) | `Reports/Rpt_ResultSheetSubodhnoname.Dsr` |
| Register | `Reports/Rpt_RGSubodh.Dsr` |
| Name list | `Reports/Rpt_NameListSubodh.Dsr` |
| Hall ticket | `Reports/Rpt_HallTicket_Subodh.Dsr` |
| Certificate | `Reports/Rpt_Certificate_Subodh.Dsr` |
| Lost-by-two-marks | `Reports/Rpt_LostTwoMarksSubodh.Dsr` |
| Attendance (shared with Praveshika layout) | `Reports/Rpt_AttSheetPraveshika_Subodh.Dsr` |
| Data environment commands | `Reports/DataEnvironment1.Dsr` (`Cmd_*Subodh`) |

### 2.5 Database

| Asset | Path | Notes |
|-------|------|-------|
| Working DB | `Database/MRSEXAM.mdb` | Password-protected Access; Jet/ACE |
| Backups | `Database/BackUp*.mdb`, `backup/*.mdb` | Historical copies |
| Schema dump (analysis) | `_mdb_analysis/schemas.txt` | Generated during analysis (read-only) |

**Connection (confirmed):** `DRIVER={Microsoft Access Driver (*.mdb)};DBQ=...;UID=admin;PWD=mrs2002` — `Module1.Db_Conn`.

### 2.6 External dependencies (VB6)

- ADO 2.0, DAO 3.51, MS Data Report, Data Environment, MSCOMCTL, MSADODC, MSDATGRD, MSFLXGRD, COMDLG32, TABCTL32
- Legacy Hindi display fonts (e.g. `DV-TTAakash`) — Devanagari stored as font-encoded bytes, not Unicode (**confirmed limitation**)

---

## 3. Subodh functional modules (logical)

```
1. Authentication & Session
2. Master Data (Region / District / Centre / Exam / Paper / User / Institution)
3. Candidate Form Entry (FORM_SUBODH)
4. Roll Number Allocation
5. Marks Entry (2 papers)
6. Result Generation & Ranking
7. Pre-exam printing (Attendance, Hall Ticket, Name List, Register)
8. Post-exam printing (Result Sheet, Certificate, Lost-by-2-marks)
9. Utilities (Search, Insert-between, Export, Backup, Centre-wise counts)
```

---

## 4. Confirmed vs assumptions

| Item | Classification |
|------|----------------|
| Subodh = exam_no 4, 2 papers | **Confirmed** |
| Result thresholds from `EXAM` / `PAPER` (min total 70, dist 150, class1 120, class2 100; paper min 25) | **Confirmed** from DB + `Frm_GenResultSubodh` |
| Grade codes: `Vi. Yo.`, `1`, `2`, `3`, `X`, `A`, `-` | **Confirmed** in result logic / GRADE master |
| Lock CRUD when `RESGEN_SUBODH='Y'` | **Confirmed** on form entry & marks |
| Maharashtra-wide FIRST/SECOND special rank button | **Confirmed** in code; print path largely commented |
| SrNo allocation: `max(srno)+3` on new save | **Confirmed**; business reason for +3 is **Ambiguous** |
| Role-based permissions beyond login | **Unconfirmed** — `USERS` has userid/password/key only |
| Exact Unicode mapping of Hindi labels | **Ambiguous** — needs font/encoding confirmation |

---

## 5. Deliverable index

| # | Document | File |
|---|----------|------|
| 1 | Business Requirements Document | `01-BRD-Subodh-Exam.md` |
| 2 | Functional Requirements Specification | `02-FRS-Subodh-Exam.md` |
| 3 | Screen Inventory | `03-Screen-Inventory.md` |
| 4 | Business Rules & Workflows | `04-Business-Rules-and-Workflows.md` |
| 5 | Access → SQL Server Data Mapping | `05-Access-to-SQLServer-Data-Mapping.md` |
| 6 | React Page / Component Inventory | `06-React-Page-Component-Inventory.md` |
| 7 | ASP.NET Core API Specification | `07-ASPNET-Core-API-Specification.md` |
| 8 | Target Architecture & TDD | `08-Target-Architecture-TDD.md` |
| 9 | Requirements Traceability Matrix | `09-Requirements-Traceability-Matrix.md` |
| 10 | Test Scenarios & Acceptance Criteria | `10-Test-Scenarios-Acceptance-Criteria.md` |
| — | Implementation Plan | `11-Implementation-Plan.md` |

**Next step for review:** `01-BRD-Subodh-Exam.md`
