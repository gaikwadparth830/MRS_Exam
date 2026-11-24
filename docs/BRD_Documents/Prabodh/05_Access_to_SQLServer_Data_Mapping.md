# Access → SQL Server Data Mapping — Prabodh

Document ID: MAP-PRABODH-001

## 1. Primary entity

### Access: FORM_PRABODH → SQL: dbo.FormPrabodh

| Access column | Access type (ADO) | SQL Server proposed | Notes |
|---------------|-------------------|---------------------|-------|
| SRNO | Integer | INT NOT NULL | Part of key; allocation +3 legacy |
| ROLL_NO | SmallInt | SMALLINT NULL | Set later |
| REGION_NO | Integer | INT NOT NULL | FK → Region |
| NAME | nvarchar(60) | NVARCHAR(60) NOT NULL | Hindi text |
| SESSION_NO | SmallInt | INT NOT NULL | FK → Session |
| GENDER | nvarchar(1) | CHAR(1) NOT NULL CHECK IN ('M','F') | |
| FORM_CENTRE | nvarchar(50) | NVARCHAR(10) NOT NULL | Align to Centre.CentreNo |
| EXAM_CENTRE | nvarchar(50) | NVARCHAR(10) NOT NULL | |
| MARKS1 | nvarchar(50) | NVARCHAR(3) NULL | Numeric or 'A' |
| MARKS2 | nvarchar(50) | NVARCHAR(3) NULL | |
| MARKS3 | nvarchar(50) | NVARCHAR(3) NULL | |
| ORAL_MARKS | nvarchar(50) | NVARCHAR(3) NULL | |
| REG_LANG | nvarchar(50) | NVARCHAR(50) NULL | Unused on UI — retain |
| TOT_MARKS | SmallInt | SMALLINT NULL | Sum of 3 papers |
| GRADE | nvarchar(15) | NVARCHAR(15) NULL | |
| SPECIAL_RANK | nvarchar(50) | NVARCHAR(50) NULL | |
| RESULT | nvarchar(20) | NVARCHAR(20) NULL | |
| DummyCentreCode | Integer | INT NULL | |
| Resgen_run | SmallInt | INT NULL | Batch id |
| userid | nvarchar(15) | NVARCHAR(15) NULL | |

**Proposed PK:** `(SessionNo, SrNo)`  
**Alternate unique (Assumption):** `(SessionNo, RegionNo, RollNo)` where RollNo not null  

## 2. Related masters (shared)

| Access | SQL | Prabodh use |
|--------|-----|-------------|
| SESSION | dbo.ExamSession | DEFA, RESGEN_PRABODH |
| REGION | dbo.Region | Filter / rank |
| DISTRICT | dbo.District | Region resolve |
| CENTRE | dbo.Centre | Form/Exam centres |
| EXAM | dbo.Exam | exam_no=5 thresholds |
| PAPER | dbo.Paper | exam_no=5 papers 1–3 |
| GRADE | dbo.Grade | Display |
| RESULT | dbo.ResultCode | Display |
| USERS | dbo.AppUser | Auth |
| TOT_FORMS | dbo.TotForms | Optional analytics |
| PARAMETER | dbo.ReportParameter | Report labels |
| INSTITUTION | dbo.Institution | Header |

## 3. Normalization option (optional redesign)

*Assumption — requires approval:*  
Split `FormPrabodh` (candidate) + `FormPrabodhMarks` + `FormPrabodhResult` while preserving same API contract. Default recommendation for Phase 1: **1:1 table migration** to reduce risk.

## 4. Stored procedures (proposed)

| SP | Purpose | Replaces |
|----|---------|----------|
| usp_Prabodh_Form_Upsert | Insert/Update form | ClassMaster save |
| usp_Prabodh_Form_Delete | Delete by session+srno | GS_Delete |
| usp_Prabodh_Marks_Update | Update marks + tot | Grid edit |
| usp_Prabodh_GenerateResult | Region batch result | cmd_gen_result |
| usp_Prabodh_AssignRanks | FIRST rank | rank loop |
| usp_Prabodh_SetRollNumbers | Roll assignment | SetRoll forms |

## 5. Migration notes

- ~79k rows — use SSMA or bulk copy; preserve SrNo values.
- Convert text marks carefully; keep 'A' as string.
- Hindi data: NVARCHAR + collation suitable for Devanagari.
- Do not migrate `FORM_*` for other exams in Prabodh-only cutover if phased.
