# Access → SQL Server Data Mapping — Praveshika

| Document ID | DOC-05 |
| Version | 1.0 |
| Date | 2026-03-23 |
| Source DB | `MRSEXAM.mdb` |
| Target | Microsoft SQL Server |

---

## 1. Mapping principles

1. Use `NVARCHAR` for all text (Hindi support).  
2. Preserve semantic nullability of legacy fields.  
3. Prefer surrogate/int keys where Access used text codes only if FK integrity requires — **default: keep centre codes as NVARCHAR**.  
4. Add audit columns (`CreatedAt`, `UpdatedAt`, `CreatedBy`) as **approved enhancements** (not in Access).  
5. Do not invent constraints that Access did not enforce unless approved.

ADO type legend from extract: 2=SmallInt, 3=Integer, 7=Date, 202=VarWChar.

---

## 2. Table mappings

### 2.1 `FORM_PRAVESHIKA` → `dbo.FormPraveshika`

| Access column | Access type | SQL Server column | SQL type | Notes |
|---------------|-------------|-------------------|----------|-------|
| SRNO | Integer PK | SrNo | INT NOT NULL | PK (legacy); consider IDENTITY only if OQ-006 allows |
| ROLL_NO | SmallInt | RollNo | SMALLINT NULL | Assigned later |
| REGION_NO | Integer | RegionNo | INT NOT NULL | FK → Region |
| NAME | VarWChar(60) | Name | NVARCHAR(60) NOT NULL | |
| SESSION_NO | SmallInt | SessionNo | INT NOT NULL | Align with Session.SessionNo |
| GENDER | VarWChar(1) | Gender | CHAR(1) NULL | M/F |
| FORM_CENTRE | VarWChar(50) | FormCentre | NVARCHAR(50) NOT NULL | FK → Centre |
| EXAM_CENTRE | VarWChar(50) | ExamCentre | NVARCHAR(50) NOT NULL | FK → Centre |
| MARKS1 | VarWChar(50) | Marks1 | NVARCHAR(10) NULL | Numeric or 'A' |
| MARKS2 | VarWChar(50) | Marks2 | NVARCHAR(10) NULL | |
| TOT_MARKS | SmallInt | TotMarks | SMALLINT NULL | |
| GRADE | VarWChar(10) | Grade | NVARCHAR(10) NULL | |
| UND_FLAG | VarWChar(1) | UndFlag | NVARCHAR(1) NULL | Unused in Praveshika UI — OQ-007 |
| UND_CLASS | VarWChar(6) | UndClass | NVARCHAR(6) NULL | OQ-007 |
| SPECIAL_RANK | VarWChar(20) | SpecialRank | NVARCHAR(50) NULL | Widen slightly for "FIRST IN …" |
| RESULT | VarWChar(20) | Result | NVARCHAR(20) NULL | |
| DummyCentreCode | Integer | DummyCentreCode | INT NULL | Register layout |
| resgen_run | SmallInt | ResgenRun | SMALLINT NULL | |
| userid | VarWChar(15) | UserId | NVARCHAR(15) NULL | |

**Suggested indexes:** `(SessionNo, RegionNo, RollNo)`, `(SessionNo, FormCentre)`, `(SessionNo, ExamCentre)`, `(SessionNo, Result)`.

### 2.2 `SESSION` → `dbo.ExamSession`

| Access | SQL | Notes |
|--------|-----|-------|
| SESSION_NO | SessionNo INT PK | |
| RESULT_DATE | ResultDate DATETIME NULL | |
| RESULT_PRINTED | ResultPrinted CHAR(1) | |
| CLOSE_FLAG | CloseFlag CHAR(1) | |
| MONTH | MonthName NVARCHAR(20) | |
| DEFA | IsDefault CHAR(1) | Prefer BIT later |
| RESGEN_PRAVESHIKA | ResgenPraveshika CHAR(1) | |
| RESGEN_* (other exams) | Optional columns or ignore in phase 1 | Out of scope exams |
| BACKUP | BackupFlag CHAR(1) | |

### 2.3 `EXAM` → `dbo.Exam`

| Access | SQL |
|--------|-----|
| EXAM_NO | ExamNo INT PK |
| EXAM_NAME | ExamName NVARCHAR(50) |
| SESSION_NO | SessionNo INT NULL |
| NO_OF_PAPERS | NoOfPapers INT |
| FEES | Fees INT |
| ATT_SHEET_PRINTED | AttSheetPrinted CHAR(1) |
| RESULT_GEN_FLAG | ResultGenFlag CHAR(1) |
| MIN_TOTAL_KHAND1 | MinTotalKhand1 INT |
| MIN_TOTAL_KHAND2 | MinTotalKhand2 INT NULL |
| CLASS1_MARKS | Class1Marks INT |
| CLASS2_MARKS | Class2Marks INT |
| CLASS3_MARKS | Class3Marks INT |
| DIST_MARKS | DistMarks INT |

Seed: ExamNo=3 = Praveshika.

### 2.4 `PAPER` → `dbo.Paper`

| Access | SQL |
|--------|-----|
| PAPER_NO | PaperNo INT |
| PAPER_NAME | PaperName NVARCHAR(40) |
| EXAM_NO | ExamNo INT |
| PASSING_MARKS | PassingMarks INT |
| EXEMPTION_MARKS | ExemptionMarks INT NULL |
| MIN_MARKS | MinMarks INT |

PK: `(ExamNo, PaperNo)`. **Migration action:** create Paper rows for ExamNo=3 after OQ-002.

### 2.5 Geography

| Access | SQL Server |
|--------|------------|
| `REGION` | `dbo.Region` (RegionNo, RegionName, SeatRegionNo, RegionNameEng) |
| `DISTRICT` | `dbo.District` (DistrictName PK legacy, RegionNo, DistrictCity, ShortName, SeatDistrictNo) |
| `CENTRE` | `dbo.Centre` (CentreNo PK NVARCHAR(10), AddressTo, CentreName, DistrictName, Add1, Add2, City, Pincode, Phone, PanditFlag, CloseFlag) |

FK: Region → District → Centre (Access relations confirmed).

### 2.6 Lookups & security

| Access | SQL |
|--------|-----|
| `GRADE` | `dbo.Grade` (GradeNo, GradeName, GradeNameCert) |
| `RESULT` | `dbo.ResultLookup` (ResultCode, Description, Exam) |
| `USERS` | `dbo.Users` (UserId, PasswordHash, RoleKey) — **hash passwords (OQ-003)** |
| `AttSheet` | `dbo.AttSheetTemp` or compute in-memory for reports |
| `PARAMETER` / `INSTITUTION` | `dbo.ReportParameter` / `dbo.Institution` |
| `Tempcentre` | Staging table or skip (export pipeline) |
| `TOT_FORMS` | `dbo.TotForms` optional |

---

## 3. Type / behaviour notes

| Topic | Recommendation |
|-------|----------------|
| Marks as text | Keep NVARCHAR to support `'A'`; validate in app |
| Session reserved word | Avoid table name `Session`; use `ExamSession` |
| Soft FKs | Access often lacked FK on forms; add FK in SQL with caution on dirty data |
| Identity SrNo | Confirm OQ-006 before IDENTITY |

---

## 4. ETL checklist

1. Extract masters: Region, District, Centre, Exam, Paper, Grade, Result, Users, Institution.  
2. Extract Sessions.  
3. Extract `FORM_PRAVESHIKA` in session batches with row counts.  
4. Validate: counts, checksum of RollNo+TotMarks+Result per session.  
5. Fix ExamNo=3 Paper seed.  
6. Rehash user passwords after cutover communication.

---

## 5. Sample seed (from current MDB)

**Exam 3 Praveshika:** MinTotal=70, Class1=120, Class2=100, Class3=70, Dist=150, Papers=2, Fees=14.

**Paper (currently only under Exam 4):** MinMarks=25, Passing=35, Exemption=40 — confirm before copying to Exam 3.
