# Praveshika — Source Inventory & Application Overview

| Field | Value |
|-------|-------|
| Document ID | DOC-00 |
| Version | 1.0 |
| Date | 2026-03-23 |
| Scope | **Praveshika exam only** (logic extracted from multi-exam MrsExam codebase) |
| Status | Draft for review |
| Source root | `MrsExam\` |
| Database | `MrsExam\Database\MRSEXAM.mdb` (password-protected Access) |

---

## 1. Application overview

**MrsExam** is a VB6 MDI Windows desktop application for Maharashtra Rashtrabhasha Sabha–style exam processing. The build artifact is named `Praveshika06032019.exe`, but the project hosts **multiple exams** (Balbodhini, Prathamik, Praveshika, Subodh, Prabodh, Praveen, Pandit).

This modernization effort scopes **only Praveshika**:

| Attribute | Confirmed value | Source |
|-----------|-----------------|--------|
| Exam name | Praveshika | Menu / forms |
| `EXAM.EXAM_NO` | **3** | `EXAM` table (`EXAM_NAME` maps to Praveshika) |
| Number of papers | **2** | `EXAM.NO_OF_PAPERS=2`; marks `MARKS1`, `MARKS2` |
| Student table | `FORM_PRAVESHIKA` | Schema + all Praveshika forms |
| Session lock flag | `SESSION.RESGEN_PRAVESHIKA` | Marks/form lock, regen reset |
| Result lock semantics | When flag = `'Y'`, form entry & marks disabled | `Frm_FormPraveshika`, `Frm_PraveshikaMarks` |
| Default session (current DB) | `20241`, `DEFA='Y'`, `RESGEN_PRAVESHIKA='N'` | Live DB sample |
| Approx. historical rows | ~469,720 in `FORM_PRAVESHIKA` | Live DB count |

**Target stack (approved direction):** React + TypeScript + MUI · ASP.NET Core Web API (C#) · SQL Server.

---

## 2. Source inventory (Praveshika-relevant)

### 2.1 Project & runtime

| File | Role |
|------|------|
| `MrsExam\Project1.vbp` | VB6 project; lists forms, reports, refs; `ExeName32=Praveshika06032019.exe` |
| `MrsExam\Praveshika06032019.exe` | Built executable |
| `MrsExam\Database\MRSEXAM.mdb` | Primary Access database |
| ODBC DSN | Named `Praveshika` / `praveshika` (Data Environment / Adodc) |
| DB password | `mrs2002` (`Module1.bas` / connection strings) |

### 2.2 Core Praveshika forms

| File | Module | Purpose |
|------|--------|---------|
| `Forms\Frm_FormPraveshika.frm` | Form entry | Student application CRUD |
| `Forms\Frm_PraveshikaMarks.frm` | Marks | Paper 1/2 marks grid |
| `Forms\Frm_GenResultPraveshika.frm` | Processing | Pass/fail, grade, region ranks |

### 2.3 Shared forms used by Praveshika (branches)

| File | Praveshika use |
|------|----------------|
| `Forms\MDIForm1.frm` | Menus / toolbar launching all Praveshika workflows |
| `Forms\frmLogin.frm` / `frm_Splash.frm` | Auth & startup |
| `Forms\Frm_SetRollNo_FromToCentre.frm` | Primary roll assignment |
| `Forms\Frm_SetRollNoAur.frm` | Aurangabad / late roll assignment |
| `Forms\Frm_BlankRollNo.frm` | Clear roll numbers |
| `Forms\Frm_InsertRecordBetween.frm` | Insert form between existing SrNo |
| `Forms\Frm_Search.frm` | Name search for form entry |
| `Forms\Frm_AttSheet.frm` | Attendance sheet |
| `Forms\Frm_NameList.frm` | Candidate name list |
| `Forms\Frm_ResultSheet.frm` | Result sheet (with / without name) |
| `Forms\Frm_PrintHallTicket.frm` | Hall tickets |
| `Forms\Frm_Certificate_Printing.frm` | Certificates |
| `Forms\Frm_RGOtherThanPandit.frm` | Result register |
| `Forms\Frm_RegionwiseRegister.frm` | Region-wise register |
| `Forms\Frm_RegenResult.frm` | Manual result correction / clear |
| `Forms\Frm_regen_res.frm` | Reset `RESGEN_PRAVESHIKA` flag |
| `Forms\frm_insertbatch.frm` | Batch insert into `form_praveshika` |
| `Forms\Frm_ExportData.frm` | Centre export (partial Praveshika) |
| `Forms\Frm_Usermast.frm` | User maintenance |
| Masters: `Frm_Region`, `Frm_District`, `Frm_Centre`, `Frm_Exam`, `Frm_Session`, `Frm_Paper` | Shared masters |

### 2.4 Modules / classes

| File | Role |
|------|------|
| `ClassModules\Module1.bas` | Globals, DB connection, shared strings |
| `ClassModules\ClassCommon.cls` | Validation helpers, status messages |
| `ClassModules\ClassMaster.cls` | Generic form CRUD for exam form screens |

### 2.5 Praveshika reports (Data Report designers)

| Report | Purpose |
|--------|---------|
| `Rpt_NameListPraveshika.Dsr` | Name list |
| `Rpt_AttSheetPraveshika_Subodh.Dsr` | Attendance (shared with Subodh layout) |
| `Rpt_ResultSheetPraveshika.Dsr` | Result sheet with name |
| `Rpt_ResultSheetPraveshikanoname.Dsr` | Result sheet without name |
| `Rpt_HallTicket_Praveshika.Dsr` | Hall ticket |
| `Rpt_Certificate_Praveshika.Dsr` | Certificate |
| `Rpt_RGPraveshika.Dsr` | Result register |
| `Rpt_LostTwoMarksPraveshika.Dsr` | Near grade-boundary query |

Supporting: `Reports\DataEnvironment1.Dsr` (ADO commands for above).

### 2.6 External dependencies (from `.vbp`)

- ADO 2.0, DAO 3.51, RDO 2.0  
- MS Data Report / Data Environment  
- MSCOMCTL, MSADODC, MSDATGRD, MSFLXGRD, COMDLG32, TABCTL32  
- Access Jet/ACE ODBC driver  
- Optional: `expcentre.exe` (centre export companion)

### 2.7 Explicitly out of scope (other exams)

Forms/tables for Pandit, Praveen, Prabodh, Subodh, Prathamik, Balbodhini — **referenced only where shared masters or shared screens branch to Praveshika**.

---

## 3. End-to-end Praveshika business flow (confirmed)

```
Login → Select default Session (DEFA='Y')
  → Master data (Region / District / Centre / Exam / Paper / Session)
  → Form Entry (FORM_PRAVESHIKA) — name, centres, gender; roll blank
  → Set Roll Numbers (by centre range / Aur)
  → Marks Entry (MARKS1, MARKS2 → TOT_MARKS) where RESULT IS NULL
  → Generate Result (per region) → RESULT, GRADE, SPECIAL_RANK
  → Optional: Find statewide FIRST/SECOND ranks
  → Print: Attendance, Name List, Hall Ticket, Result Sheet, Register, Certificate
  → Supervisor: Reset result flag / regenerate individual results
```

---

## 4. Database tables used by Praveshika

| Table | Usage |
|-------|--------|
| `FORM_PRAVESHIKA` | Core candidate / marks / result |
| `SESSION` | Active session + `RESGEN_PRAVESHIKA` |
| `EXAM` | Thresholds (`MIN_TOTAL_KHAND1`, class/dist marks); Praveshika = exam_no **3** |
| `PAPER` | Per-paper min marks (**note:** no rows for exam_no 3 in current DB; gen-result code reads exam_no **4**) |
| `REGION` / `DISTRICT` / `CENTRE` | Geography & centres |
| `GRADE` | Grade display / certificate names |
| `RESULT` | Rank/result description lookup (reports) |
| `USERS` | Login |
| `AttSheet` | Temp packing for attendance print |
| `PARAMETER` / `INSTITUTION` | Report headers |
| `Tempcentre` | Export staging |
| `TOT_FORMS` | User-wise form counts (shared reporting) |

**Access relationships (DAO):** `REGION` → `DISTRICT` → `CENTRE`.  
**`FORM_PRAVESHIKA` PK:** `SRNO` (unique). Indexes also on `NAME`, `userid`, `DummyCentreCode`.

---

## 5. Critical findings requiring confirmation

| ID | Finding | Impact |
|----|---------|--------|
| AMB-001 | `Frm_GenResultPraveshika` hardcodes `exam_no = 4` (Subodh in master), while Praveshika is `exam_no = 3`. Lost-two-marks uses **3**. | Wrong master or intentional workaround because `PAPER` has no exam 3 rows |
| AMB-002 | No VB6 code found that sets `RESGEN_PRAVESHIKA = 'Y'` (only reset to `'N'` in `Frm_regen_res`) | Lock after result may be unused / set outside app |
| AMB-003 | `Cmd_ranks` (statewide FIRST/SECOND) may not persist (`.Update` missing) | Ranks may not save |
| AMB-004 | `PAPER` has **no** rows for `exam_no=3` | Paper master incomplete for Praveshika if corrected to exam 3 |
| AMB-005 | Gender field often shows `F` in sample historical data for male-coded Hindi names | Data quality / UI bind issue possible |

---

## 6. Document set

| # | Document | File |
|---|----------|------|
| 1 | Business Requirements Document (BRD) | `01_BRD_Praveshika.md` |
| 2 | Functional Requirements Specification | `02_FRS_Praveshika.md` |
| 3 | Screen Inventory | `03_Screen_Inventory.md` |
| 4 | Business Rules & Workflows | `04_Business_Rules_and_Workflows.md` |
| 5 | Access → SQL Server Mapping | `05_Access_to_SQLServer_Data_Mapping.md` |
| 6 | React Page/Component Inventory | `06_React_Page_Component_Inventory.md` |
| 7 | ASP.NET Core API Spec | `07_ASPNET_API_Specification.md` |
| 8 | Target Architecture | `08_Target_Architecture.md` |
| 9 | Requirements Traceability Matrix | `09_Requirements_Traceability_Matrix.md` |
| 10 | Test Scenarios & Acceptance Criteria | `10_Test_Scenarios_and_Acceptance_Criteria.md` |
| 11 | Implementation Plan | `11_Implementation_Plan.md` |

---

*No legacy source files were modified during this analysis.*
