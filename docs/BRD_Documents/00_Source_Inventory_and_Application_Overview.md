# Source Inventory and Application Overview

**Application:** Pre-Exam & Result System (MrsExam / Project1)  
**Organization:** Maharashtra Rashtrabhasha Sabha, Pune  
**Legacy stack:** VB6 Windows desktop + Microsoft Access (`MRSEXAM.mdb`)  
**Target stack:** React + TypeScript + MUI | ASP.NET Core Web API (C#) | SQL Server  
**Scope of this BRD set:** **Prabodh, Praveen, and Pandit exams only**  
**Analysis date:** 2026-11-24  
**Status:** Confirmed from source unless marked *Assumption* or *Open Question*

---

## 1. Application overview

The legacy application manages examination form entry, marks entry, result generation, ranking, and printing of attendance sheets, result sheets, mark sheets, certificates, hall tickets, name lists, and registers for multiple Hindi examinations conducted by Maharashtra Rashtrabhasha Sabha.

| Exam | EXAM_NO | Papers (master) | Primary table | Approx. rows |
|------|---------|-----------------|---------------|--------------|
| Balbodhini | 1 | 1 | FORM_BALBODHINI | (out of scope) |
| Prathamik | 2 | 1 | FORM_PRATHAMIK | (out of scope) |
| Praveshika | 3 | 2 | FORM_PRAVESHIKA | (out of scope) |
| Subodh | 4 | 2 | FORM_SUBODH | (out of scope) |
| **Prabodh** | **5** | **3 + Oral** | **FORM_PRABODH** | **~79,635** |
| **Praveen** | **6** | **5 + Oral (+ Reg Lang)** | **FORM_PRAVEEN** | **~15,465** |
| **Pandit** | **7** | **Khand I/II (up to 8 papers + Oral)** | **FORM_PANDIT** | **~13,052** |

Startup form: `frm_Splash` → Login → `MDIForm1` (“Pre-Exam & Result System”).  
Database path configured in `Module1.Db_Conn`; Access password used in connection string: `mrs2002` (confirmed in `Module1.bas`).

---

## 2. Source inventory (in-scope)

### 2.1 Project and shared modules

| File | Role |
|------|------|
| `MrsExam\Project1.vbp` | VB6 project definition, references, form/report list |
| `MrsExam\ClassModules\Module1.bas` | Global connection, messages, encryption keys, report globals |
| `MrsExam\ClassModules\ClassCommon.cls` | Shared validation helpers (Non_Blank, Check_Number, etc.) |
| `MrsExam\ClassModules\ClassMaster.cls` | Shared CRUD navigation (New/Save/Update/Delete/First/Next/Search) |
| `MrsExam\Forms\MDIForm1.frm` | Menu shell for all exam operations |
| `MrsExam\Forms\frmLogin.frm` | Login + SUPER user supervisor menu |
| `MrsExam\Forms\frm_Splash.frm` | Splash / DB connect |
| `MrsExam\Forms\Frm_SelectSession.frm` | Active session (`SESSION.DEFA='Y'`) |
| `MrsExam\Forms\Frm_Search.frm` | Generic search dialog |
| `MrsExam\Forms\Frm_regen_res.frm` | Reset result-generated flag (`RESGEN_*='N'`) — supervisor |
| `MrsExam\Forms\Frm_RegenResult.frm` | Update Marks (single-student correction; Prabodh in combo, not Praveen) |
| `MrsExam\Database\MRSEXAM.mdb` | Primary database |
| `MrsExam\Database\lblpandit.mdb` | Label/print support DB for Pandit (external dependency) |

### 2.2 Prabodh-specific sources

| Category | Files |
|----------|-------|
| Form entry | `Frm_FormPrabodh.frm` |
| Marks | `Frm_PrabodhMarks.frm` (+ `.frx`) |
| Result | `Frm_GenResultPrabodh.frm` (+ `.frx`) |
| Roll no | `Frm_SetRollNo_FromToCentre.frm`, `Frm_SetRollNoAur.frm` (Prabodh menu paths) |
| Shared print param | `Frm_AttSheet.frm`, `Frm_ResultSheet.frm`, `Frm_MarkSheet.frm`, `Frm_Certificate_Printing.frm`, `Frm_NameList.frm`, `Frm_PrintHallTicket.frm`, `Frm_RGOtherThanPandit.frm` |
| Reports | `Rpt_AttSheetPrabodh`, `Rpt_ResultSheetPrabodh`, `Rpt_MarkSheetPrabodh`, `Rpt_Certificate_Prabodh`, `Rpt_HallTicket_Prabodh`, `Rpt_NameListPrabodh`, `Rpt_RGPrabodh`, `Rpt_LostTwoMarksPrabodh` |

### 2.3 Praveen-specific sources

| Category | Files |
|----------|-------|
| Form entry | `Frm_FormPraveen.frm` (+ `.frx`) |
| Marks | `Frm_PraveenMarks.frm` (+ `.frx`) |
| Result | `Frm_GenResultPraveen.frm` (+ `.frx`); legacy `Frm_GenResultPraveen_org.frm` |
| Other | `Frm_SelectRegionPraveen.frm`, `Frm_MarkSheetPraveen.frm` |
| Reports | `Rpt_AttSheetPraveenCentreWise(_New)`, `Rpt_ResultPraveenBrf`, `Rpt_MarkSheetPraveen(_new)`, `Rpt_Certificate_Praveen`, `Rpt_NameListPraveen`, `Rpt_RGPraveen(_new)`, `Rpt_LostTwoMarksPraveen(_new)`, `Rpt_Praveen_Ranks` |
| Historic table | `FORM_PRAVEEN20162` (no MARKS5) |

### 2.4 Pandit-specific sources

| Category | Files |
|----------|-------|
| Form entry | `Frm_FormPandit.frm` (+ `.frx`); legacy `Frm_FormPandit_org.frm` |
| Marks | `Frm_PanditMarks.frm`; legacy `Frm_PanditMarks_org.frm` |
| Result | `Frm_GenResultPandit.frm` (+ `.frx`); legacy `Frm_GenResultPandit_org.frm` |
| Processing | `Frm_Pandit_CrossRef.frm` |
| Reports/forms | `Frm_PanditRegister.frm`, `Frm_StudentsPassingPandit.frm` |
| Reports | `Rpt_AttSheetPandit(_new)`, `Rpt_ResultPandit`, `Rpt_ResultPanditDetails`, `Rpt_MarkSheetPandit(_new/_onlynew/_20162_new)`, `Rpt_NameListPandit`, `Rpt_RGPandit(_New)`, `Rpt_LostTwoMarksPandit`, `Rpt_Pandit_Ranks`, `Rpt_StudentsPassingPandit(1/2)` |
| Historic table | `FORM_PANDIT20162` (no papers 7–8 / flgportion) |

### 2.5 Shared master data used by all three exams

| Table | Purpose |
|-------|---------|
| REGION | 7 regions (Goa, Nasik, Kolhapur, Pune, Mumbai, Aurangabad, Nagpur) |
| DISTRICT | District → Region |
| CENTRE | Centres; includes `PANDIT_FLAG`, `CLOSE_FLAG` |
| EXAM / PAPER | Exam & paper thresholds |
| SESSION | Active session + per-exam `RESGEN_*` flags |
| GRADE / RESULT | Grade and result code masters |
| USERS | Login users; SUPER enables Supervisor menu |
| PARAMETER / INSTITUTION | Report headings / org name |
| TOT_FORMS | User-wise form counts |

---

## 3. High-level business workflow (all three exams)

```
Select Session (DEFA='Y')
    → Examination Form Entry (candidate master for session)
        → Set Roll Numbers (Prabodh; Praveen/Pandit typically enter roll at form)
            → Attendance / Hall Ticket / Name List printing (pre-exam)
                → Marks Entry
                    → Generate Result (+ Rank)
                        → Result Sheet / Mark Sheet / Certificate / Register
                            → (Supervisor) Reset Result Flag to allow re-generation
```

Pandit adds: **Cross Reference** processing and **Khand I / Khand II / Both** appearance rules, plus **OLD vs NEW portion** (`flgportion`).

---

## 4. User roles (confirmed from login)

| Role | How identified | Capabilities |
|------|----------------|--------------|
| Normal user | Any `USERS.USERID` except SUPER | Form entry, marks, reports (menu as designed) |
| Supervisor (SUPER) | `frmLogin.frm` when userid = SUPER | User Master, Reset Result Generated Flag, Update Marks, Insert blank-name records |

*Assumption:* No fine-grained per-exam permissions exist beyond SUPER vs non-SUPER and session `RESGEN_*` locks.

---

## 5. External dependencies

- Microsoft Access Driver / Jet-OLEDB
- ADO 2.0, DAO 3.51
- MS Data Report Designer reports (`.Dsr`)
- Devnagari UI fonts (e.g. `DV-TTAakash`) for Hindi captions
- Optional FoxPro export (`Frm_ExportData`) — shared utility; confirm if still required for these exams
- `lblpandit.mdb` for Pandit labels

---

## 6. Document package layout

| Folder | Contents |
|--------|----------|
| `BRD_Documents\Prabodh\` | Docs 01–11 for Prabodh |
| `BRD_Documents\Praveen\` | Docs 01–11 for Praveen |
| `BRD_Documents\Pandit\` | Docs 01–11 for Pandit |

Each folder contains: BRD, FRS, Screen Inventory, Business Rules & Workflows, Access→SQL mapping, React inventory, API spec, Architecture, Traceability Matrix, Test Scenarios, Implementation Plan.

---

## 7. Analysis conventions

- **Confirmed:** Observed in VB form/module/SQL against Access schema.
- **Assumption:** Reasonable inference; needs business confirmation before build.
- **Open Question:** Ambiguity, conflicting code paths, or missing rule — do not implement without BA/user approval.
- Requirement IDs: `BR-PRB-*` / `FR-PRB-*` (Prabodh), `BR-PRV-*` / `FR-PRV-*` (Praveen), `BR-PND-*` / `FR-PND-*` (Pandit), plus shared `BR-SHR-*` / `FR-SHR-*`.
