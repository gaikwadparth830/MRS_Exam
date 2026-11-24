# Access → SQL Server Data Mapping — Praveen

Document ID: MAP-PRAVEEN-001

## FORM_PRAVEEN → dbo.FormPraveen

| Access | SQL proposed | Notes |
|--------|--------------|-------|
| ROLL_NO | SMALLINT NOT NULL | PK part |
| REGION_NO | INT NOT NULL | PK part |
| NAME | NVARCHAR(60) NOT NULL | |
| SESSION_NO | INT NOT NULL | PK part |
| FORM_CENTRE | NVARCHAR(10) NOT NULL | |
| EXAM_CENTRE | NVARCHAR(10) NOT NULL | |
| MARKS1..MARKS5 | NVARCHAR(3) NULL | MARKS5 size was 255 in Access — normalize to 3 |
| ORAL_MARKS | NVARCHAR(3) NULL | |
| REG_LANG | NVARCHAR(50) NULL | Used in pass rule |
| TOT_MARKS | SMALLINT NULL | Sum of 5 papers |
| GRADE | NVARCHAR(8) NULL | |
| UND_FLAG | CHAR(1) NULL | Schema only in UI |
| UND_CLASS | NVARCHAR(6) NULL | Schema only |
| SPECIAL_RANK | NVARCHAR(10) NULL | |
| RESULT | NVARCHAR(20) NULL | |
| DUMMYCENTRECODE | INT NULL | |
| userid | NVARCHAR(15) NULL | |

**PK:** (SessionNo, RegionNo, RollNo)

## Historic
FORM_PRAVEEN20162 → dbo.FormPraveen20162 (archive) or merge with nullable Marks5.

## SPs
usp_Praveen_Form_Upsert/Delete, usp_Praveen_Marks_Update, usp_Praveen_GenerateResult, usp_Praveen_AssignRanks
