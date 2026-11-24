# Access → SQL Server Data Mapping — Pandit

Document ID: MAP-PANDIT-001

## FORM_PANDIT → dbo.FormPandit

| Access | SQL | Notes |
|--------|-----|-------|
| ROLL_NO | SMALLINT NOT NULL | PK w/ session |
| NAME | NVARCHAR(60) NOT NULL | |
| SESSION_NO | INT NOT NULL | PK |
| FORM_CENTRE / EXAM_CENTRE | NVARCHAR(10) NOT NULL | |
| ROLL_NO_1..8 | INT/SMALLINT NULL | Prior/current attempt rolls |
| SESSION_NO_1..8 | INT NULL | |
| MARKS1..8 | NVARCHAR(3)/NVARCHAR(255)→NVARCHAR(3) | Normalize sizes |
| ORAL_ROLL_NO / ORAL_SESSION_NO / ORAL_MARKS | matching types | |
| OPT_MARKS | NVARCHAR(3) NULL | |
| KHAND1_TOTMARKS / KHAND2_TOTMARKS | INT NULL | |
| TOT_MARKS | SMALLINT NULL | |
| GRADE / RESULT / SPECIAL_RANK | NVARCHAR | |
| UND_FLAG | CHAR(1) | Y/N |
| UND_CLASS | NVARCHAR(4) | |
| KHAND_APPEARING | NVARCHAR(2) | I / II |
| BOTH_KHAND_FLAG | CHAR(1) | |
| OTH_KHAND_ROLLNO | SMALLINT NULL | |
| CONCESSION_FLAG | CHAR(1) | |
| RES_DECL_FLAG | CHAR(1) | |
| ADD1..3 | NVARCHAR(80) | |
| DUMMYCENTRECODE | INT NULL | |
| userid | NVARCHAR(15) | |
| flgportion | NVARCHAR(1) | N/O |

**PK:** (SessionNo, RollNo)

## Related
- CENTRE.PANDIT_FLAG → Centre.PanditFlag  
- EXAM/PAPER exam_no=7 (papers 1–9)  
- FORM_PANDIT20162 archive table  
- lblpandit.mdb → evaluate migrate vs retire  

## Proposed SPs
usp_Pandit_Form_Upsert, usp_Pandit_Marks_Update, usp_Pandit_CheckConcession, usp_Pandit_CrossRef, usp_Pandit_GenerateResult (orchestrates Khand I/II/Both/OLD), usp_Pandit_AssignRanks

## Design note
Prefer **explicit result strategy classes** in C# (Khand1NewStrategy, Khand2NewStrategy, BothStrategy, Khand1OldStrategy, Khand2OldStrategy) rather than one monolithic SP mirroring VB Goto spaghetti — but outcomes must match golden tests.
