# Test Scenarios & Acceptance Criteria — Praveshika

| Document ID | DOC-10 |
| Version | 1.0 |
| Date | 2026-03-23 |

Format: **Given / When / Then**. Priority: Must scenarios first.

---

## AUTH

### TC-AUTH-01 Login success
- **Given** valid user in Users  
- **When** login with correct password  
- **Then** access granted; user identity available  
- **AC:** Invalid password rejected with clear error  

### TC-AUTH-02 SUPER vs OPERATOR
- **Given** OPERATOR user  
- **When** accessing unlock result flag  
- **Then** denied (UI hidden + API 403)  
- **AC:** SUPER can unlock  

### TC-AUTH-03 User CRUD
- **AC:** SUPER can create/update/delete users; OPERATOR cannot  

---

## MASTERS

### TC-MAS-01 Default session
- **AC:** `/sessions/current` returns DEFA='Y' session; forms/marks use it by default  

### TC-MAS-02 Centre closed
- **Given** centre with CloseFlag=Y  
- **When** used as Form Centre on create  
- **Then** validation error  

### TC-MAS-03 Exam thresholds loaded
- **AC:** ExamNo=3 shows MinTotal=70, Class1=120, Class2=100, Dist=150 (from migrated data)  

### TC-MAS-04 Papers for engine
- **AC:** After OQ-002 resolution, generate-result finds Paper 1 & 2 MinMarks  

---

## FORM ENTRY

### TC-FORM-01 Create form
- **Given** unlocked session, valid centres  
- **When** create Name=…, Gender=M, FormCentre=ExamCentre=valid  
- **Then** row saved; RollNo null; Region derived; UserId set  
- **AC:** Required fields enforced  

### TC-FORM-02 Insert between
- **AC:** New SrNo = PrevSrNo+1; record appears in navigation order  

### TC-FORM-03 Invalid centre / gender
- **AC:** Reject unknown centre; reject gender not M/F  

### TC-FORM-04 Locked session
- **Given** ResgenPraveshika=Y  
- **When** create/update/delete  
- **Then** blocked  

### TC-FORM-05 Name search
- **AC:** Prefix search returns matching names for current session; selection navigates to record  

---

## ROLLS

### TC-ROLL-01 Assign rolls
- **Given** 10 forms null rolls at centres in range  
- **When** assign first=101 last=110 and confirm names  
- **Then** rolls 101–110 set in FormCentre,SrNo order; commit durable  
- **AC:** Cancel/rollback leaves rolls null  

### TC-ROLL-02 Insufficient forms
- **AC:** If fewer null-roll forms than roll span → error, no partial assign  

### TC-ROLL-03 Blank rolls
- **AC:** Blanking from roll R clears RollNo for that centre/region from R onward as legacy  

---

## MARKS

### TC-MARK-01 Enter marks
- **Given** Result null  
- **When** Marks1=50, Marks2=60  
- **Then** TotMarks=110 persisted  

### TC-MARK-02 Absent and bounds
- **AC:** `A` allowed; `101` rejected; `-1` rejected; non-numeric other than A rejected  
- **AC:** Marks1=A, Marks2=40 → TotMarks=40  

### TC-MARK-03 Filter
- **AC:** Show returns only Result null for region with RollNo ≥ rollFrom  

### TC-MARK-04 Locked
- **AC:** Resgen=Y → marks read-only  

---

## RESULTS

### TC-RES-01 Pass/Fail/Grade matrix
Using thresholds MinTotal=70, MinPaper=25, Dist=150, C1=120, C2=100:

| Marks1 | Marks2 | Tot | Expected Result | Expected Grade |
|--------|--------|-----|-----------------|----------------|
| A | A | — | Fail | A |
| A | 50 | 50 | Fail | X |
| 20 | 20 | 40 | Fail | X | (below min total) |
| 30 | 30 | 60 | Fail | X | (below min total) |
| 20 | 50 | 70 | Fail | X | (paper1 &lt; 25) |
| 40 | 40 | 80 | Pass | 3 |
| 50 | 50 | 100 | Pass | 2 |
| 60 | 60 | 120 | Pass | 1 |
| 75 | 75 | 150 | Pass | Vi. Yo. |

- **AC:** Engine matches table for eligible rows only (Result was null, both marks present)  

### TC-RES-02 Region first rank
- **Given** first run for region; Pass students  
- **When** generate  
- **Then** top TotMarks (ties) get `FIRST IN {RegionNameEng}` saved  

### TC-RES-03 Statewide ranks
- **AC:** After OQ-005, FIRST/SECOND persist for top totals statewide among Pass  

### TC-RES-04 Unlock
- **AC:** SUPER sets Resgen=N; forms/marks editable again  

### TC-RES-05 Regen clears ranks
- **AC:** Clearing a special-rank student clears special ranks for region  

### TC-RES-06 Missing masters
- **AC:** Generate fails with clear message if Exam/Paper missing  

---

## REPORTS

### TC-RPT-01 Attendance
- **AC:** PDF lists rolls for selected exam centre(s) for session  

### TC-RPT-02 Name list
- **AC:** Contains RollNo, Name, Centre, District; optional centre filter  

### TC-RPT-03 Hall tickets
- **AC:** Region required; optional roll range; only RollNo not null  

### TC-RPT-04 Result sheet
- **AC:** includeName true/false; filters centre or region; only Result not null  

### TC-RPT-05 Certificates
- **AC:** Excludes Grade A and X; shows GradeNameCert for Vi. Yo.  

### TC-RPT-06 Register
- **AC:** Grouped layout with dummy centre codes; marks + grade  

### TC-RPT-07 Lost two marks
- **AC:** Returns students with TotMarks in Class1±2 / Class2±2 boundary set for Praveshika exam  

---

## UTILITIES

### TC-UTIL-01 Batch insert
- **AC:** Creates FormPraveshika rows for specified range with session default  

### TC-UTIL-02 Export centres
- **AC:** Returns centres appearing as FormCentre in session  

---

## Parity acceptance (UAT gate)

1. Freeze a legacy session sample in Access.  
2. Run identical operations in new system (or migrate results and recompute on copy).  
3. Diff: Result, Grade, TotMarks, SpecialRank for all rolls.  
4. Zero unexplained diffs; documented intentional diffs only (approved changes).  
