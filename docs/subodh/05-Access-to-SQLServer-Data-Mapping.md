# Access → SQL Server Data Mapping — Subodh Exam

| Field | Value |
|-------|-------|
| Document ID | SUB-DM-001 |
| Source DB | `MRSEXAM.mdb` |
| Target | Microsoft SQL Server |
| Scope | Subodh + shared masters |

---

## 1. Scope tables

| Access table | Target table (proposed) | In scope |
|--------------|-------------------------|----------|
| FORM_SUBODH | dbo.FormSubodh | Yes — primary |
| SESSION | dbo.ExamSession | Yes |
| REGION | dbo.Region | Yes |
| DISTRICT | dbo.District | Yes |
| CENTRE | dbo.Centre | Yes |
| EXAM | dbo.Exam | Yes (filter/use exam 4) |
| PAPER | dbo.Paper | Yes |
| GRADE | dbo.Grade | Yes |
| RESULT | dbo.ResultCode | Yes |
| USERS | dbo.AppUser | Yes (modernize security) |
| INSTITUTION | dbo.Institution | Yes |
| PARAMETER | dbo.ReportParameter | Yes |
| AttSheet | dbo.AttSheetTemp (or ephemeral) | Yes |
| CENTRE_COUNT | dbo.CentreCount | Yes if used by Subodh rolls/reports |
| TOT_FORMS | dbo.TotForms | Yes |
| TEMP | — | Exclude / replace |
| FORM_* (other exams) | — | **Out of scope** for Subodh product |
| Paste Errors | — | Exclude |

---

## 2. FORM_SUBODH mapping

| Access column | Access type | SQL Server column | SQL type | Notes |
|---------------|-------------|-------------------|----------|-------|
| SRNO | Integer PK | SrNo | INT NOT NULL | PK; consider IDENTITY only if +3 rule dropped (OQ-002) |
| ROLL_NO | SmallInt | RollNo | SMALLINT NULL | |
| REGION_NO | Integer | RegionNo | INT NULL | FK → Region |
| NAME | WChar(60) | Name | NVARCHAR(60) | Unicode migration |
| SESSION_NO | SmallInt | SessionNo | SMALLINT NOT NULL | FK → ExamSession |
| GENDER | WChar(1) | Gender | CHAR(1) NULL | M/F check |
| FORM_CENTRE | WChar(50) | FormCentre | NVARCHAR(50) NULL | FK logical → Centre |
| EXAM_CENTRE | WChar(50) | ExamCentre | NVARCHAR(50) NULL | FK logical → Centre |
| MARKS1 | WChar(50) | Marks1 | NVARCHAR(10) NULL | numeric or A |
| MARKS2 | WChar(50) | Marks2 | NVARCHAR(10) NULL | |
| TOT_MARKS | SmallInt | TotMarks | SMALLINT NULL | |
| GRADE | WChar(10) | Grade | NVARCHAR(10) NULL | |
| UND_FLAG | WChar(1) | UndFlag | CHAR(1) NULL | Ambiguous use |
| UND_CLASS | WChar(6) | UndClass | NVARCHAR(6) NULL | Ambiguous use |
| SPECIAL_RANK | WChar(20) | SpecialRank | NVARCHAR(40) NULL | widen for “FIRST IN …” |
| RESULT | WChar(20) | Result | NVARCHAR(20) NULL | Pass/Fail/- |
| DummyCentreCode | Integer | DummyCentreCode | INT NULL | |
| Resgen_run | SmallInt | ResgenRun | SMALLINT NULL | |
| userid | WChar(15) | UserId | NVARCHAR(15) NULL | |

**Proposed indexes:** PK(SrNo); IX(SessionNo, RegionNo, RollNo); IX(SessionNo, FormCentre); IX(SessionNo, ExamCentre); IX(Name); IX(UserId).

**Recommended FKs (new; not in Access):** RegionNo, SessionNo, FormCentre, ExamCentre — enable carefully after data cleanse.

---

## 3. Master mappings (summary)

### SESSION → ExamSession
| Access | SQL | Notes |
|--------|-----|-------|
| SESSION_NO | SessionNo PK | Quote reserved name historically |
| RESULT_DATE | ResultDate | DATE/DATETIME2 |
| RESULT_PRINTED | ResultPrinted | CHAR(1) |
| CLOSE_FLAG | CloseFlag | CHAR(1) |
| MONTH | MonthName | NVARCHAR(20) |
| DEFA | IsDefault | CHAR(1) or BIT |
| RESGEN_SUBODH | ResgenSubodh | CHAR(1) / BIT — **required** |
| RESGEN_* (other) | optional columns | Keep if shared DB; else omit |
| BACKUP | BackupFlag | |

### REGION / DISTRICT / CENTRE
Preserve PKs and Access relationships:
- Region.RegionNo → District.RegionNo
- District.DistrictName → Centre.DistrictName  
Also map `REGION_NAME_ENG`, `SEAT_REGION_NO`, `SEAT_DISTRICT_NO`, `CLOSE_FLAG`, address fields.

### EXAM / PAPER
Keep `ExamNo=4` row and papers 1–2. Columns for thresholds as in Access schema.

### USERS → AppUser
| Access | SQL | Modernization |
|--------|-----|---------------|
| USERID | UserId | PK |
| PASSWORD | PasswordHash | **Do not store plaintext** |
| KEY | LegacyKey | Retain if encryption depends on it |

---

## 4. Type / encoding notes

| Topic | Guidance |
|-------|----------|
| Hindi text | Convert legacy font encoding → Unicode NVARCHAR (**OQ-005**) |
| Marks as text | Keep NVARCHAR to allow `A` |
| Y/N flags | Prefer CHAR(1) for parity or BIT with adapter |
| Centre numbers | Stored as string codes — keep NVARCHAR |

---

## 5. Relationship model (target)

```
ExamSession 1───* FormSubodh
Region 1───* District 1───* Centre
Region 1───* FormSubodh
Centre 1───* FormSubodh (FormCentre)
Centre 1───* FormSubodh (ExamCentre)
Exam 1───* Paper
AppUser 1───* FormSubodh (UserId)
```

Access enforced only Region→District→Centre. Application enforced the rest — **Confirmed**.

---

## 6. Migration approach (recommended)

1. Extract masters; validate PK uniqueness.
2. Convert Hindi encoding offline; sample QA.
3. Bulk load `FormSubodh` (~402k rows in this DB) with identity/off for SrNo.
4. Rebuild indexes; add FKs after orphan cleanse.
5. Parallel run: compare result engine outputs for sample sessions/regions.

---

## 7. Stored procedures / services (proposed)

| Name | Purpose | Replaces |
|------|---------|----------|
| usp_Subodh_GenerateResult | Result engine | `Frm_GenResultSubodh` |
| usp_Subodh_AssignSpecialRanks | FIRST/SECOND | `Cmd_ranks_Click` |
| usp_Subodh_SetRollNumbers | Roll allocation | `Frm_SetRollNo1` |
| usp_Subodh_BuildAttSheet | Attendance temp | `InsertRecord` |

Business logic may alternatively live in C# domain services — see Architecture doc. Parity tests required either way.
