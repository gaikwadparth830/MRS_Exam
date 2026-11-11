# Access to SQL Server Data Mapping — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | DATA-BAL-001 |
| Status | Draft, schema unconfirmed from the file |
| Source of columns | SQL and recordset field names in the VB6 code, and Data Environment field lists |
| Not confirmed | Data types, lengths, nullability, indexes, primary keys, and relationships inside `database/MRSEXAM.mdb`. ACE OLEDB returned "Unrecognized database format" for that file. |

Do not create SQL Server unique keys that the legacy application does not enforce, except the technical key proposed below. Where a legacy column is referenced, it is migrated. Where a type is proposed, it is a proposal and must be checked against a readable copy of the Access file before the first migration.

## 1. Database boundary

Migrate these objects for the Balbodhini application:

- `form_balbodhini`
- Shared masters the Balbodhini screens read: `session`, `region`, `district`, `centre`, `exam`, `paper`, `users`, `parameter`
- Temp tables replaced by query results or short-lived SQL tables: `attsheet`, `tot_forms`, `centre_count`, `tempcentre`

Do not migrate `form_pandit`, `form_praveen`, `form_prabodh`, `form_subodh`, `form_praveshika`, or `form_prathamik` in this project.

`district_name` on `form_balbodhini` is written only by the unwired `Frm_setdist.frm`. Keep the column if it exists in Access. Do not build a screen for it unless Q-010 says to.

## 2. form_balbodhini

Legacy table name is used as `form_balbodhini`, `form_Balbodhini`, and `FORM_BALBODHINI`. SQL Server name: `balbodhini.Candidate`.

| Legacy column | Evidence | Proposed SQL type | Null | Notes |
| --- | --- | --- | --- | --- |
| `srno` | Save, delete, search, insert-between | `bigint` | No | Proposed primary key. Legacy step is +3. Not a SQL identity unless batch and insert-between are rewritten to allocate keys the same way. |
| `roll_no` | Navigation query, marks, reports | `int` | Yes | Null until numbering. |
| `name` | Form and reports. Report size 60 | `nvarchar(60)` | No on new rows | Length is from the name-list field size, not from Access. |
| `session_no` | Every operational query | `int` | No | FK to session. |
| `form_centre` | Form validation. Report and SQL treat it as text | `nvarchar(50)` | No | FK to centre. |
| `exam_centre` | Same | `nvarchar(50)` | No | FK to centre. |
| `region_no` | Form, marks, result | `int` | Yes until centre validation | FK to region. |
| `gender` | `M` or `F` | `char(1)` | No | |
| `USERID` | Stored on new save. Report and count use `userid` | `nvarchar(10)` | Yes | Length 10 is from `tot_forms.userid` in the data environment, not confirmed on this table. |
| `marks1` | Marks grid. Report field size 50 | `nvarchar(10)` | Yes | Holds a number or `A`. Do not use a numeric type, or absent cannot be stored. |
| `tot_marks` | Marks grid and result. Register field is a 2-byte integer in one command and a calculated string in another | `int` | Yes | Cleared to null for absent at result time. |
| `result` | `Pass`, `Fail`, `-`, or null | `nvarchar(10)` | Yes | |
| `grade` | `Vi. Yo.`, `1`, `2`, `3`, `X`, `A`, `-` | `nvarchar(20)` | Yes | |
| `special_rank` | `FIRST IN ...`, `FIRST`, `SECOND`, empty, or null | `nvarchar(100)` | Yes | Result-sheet field size 100. |
| `resgen_run` | Result generation | `int` | Yes | |
| `dummyCentreCode` | Register grouping | `int` | Yes | Recomputed before register print. |
| `district_name` | `Frm_setdist.frm` only | `nvarchar(100)` | Yes | Unconfirmed that the column exists. The utility would fail if it did not. |

Proposed alternate key, not enforced by legacy code: (`session_no`, `region_no`, `roll_no`) where `roll_no` is not null. Do not add it as a unique constraint until duplicate roll numbers in the live data have been counted.

## 3. session

SQL Server name: `exam.Session`.

| Legacy column | Evidence | Proposed type |
| --- | --- | --- |
| `session_no` | Lookups everywhere | `int` primary key |
| `defa` | `Y` or not | `char(1)` |
| `month` | Report headers | `nvarchar(20)` |
| `resgen_balbodhini` | Lock and reset | `char(1)` |
| `backup` | Login | `char(1)` |
| `result_date` | Session master | `date` null |
| `result_printed` | Session master | `char(1)` |
| `close_flag` | Session master | `char(1)` |

Other `resgen_*` columns belong to other exams. Omit them from the Balbodhini database.

The legacy screen does not edit `defa`, `backup`, or `resgen_balbodhini`. They are still required columns.

## 4. region

SQL Server name: `exam.Region`.

| Legacy column | Evidence | Proposed type |
| --- | --- | --- |
| `region_no` | Masters and all filters | `int` primary key |
| `region_name` | Combos | `nvarchar(100)` |
| `seat_region_no` | Roll numbering. Code uses `SEAT_REGION_NO` | `int` |
| `region_name_eng` | Rank text. Not on the master screen | `nvarchar(100)` null |

## 5. district

SQL Server name: `exam.District`.

| Legacy column | Evidence | Proposed type |
| --- | --- | --- |
| `district_name` | Centre link and region lookup | `nvarchar(100)` primary key as used by the queries |
| `region_no` | FK | `int` |
| `district_city` | Master screen | `nvarchar(100)` null |
| `short_name` | Master search | `nvarchar(50)` null |
| `seat_district_no` | Centre walk order | `int` null |

The region lookup joins district name as text. A surrogate key may be added only if every centre and form still resolves the same region.

## 6. centre

SQL Server name: `exam.Centre`.

| Legacy column | Evidence | Proposed type |
| --- | --- | --- |
| `centre_no` | Validated as text | `nvarchar(50)` primary key |
| `centre_name` | Display and reports | `nvarchar(200)` |
| `city` | Display | `nvarchar(100)` null |
| `district_name` | Link to district | `nvarchar(100)` |
| `address_to` | Label export | `nvarchar(200)` null |
| `add1`, `add2` | Label export and attendance query | `nvarchar(200)` null |
| `pincode` | Label export | `nvarchar(20)` null |
| `phone` | Master | `nvarchar(50)` null |
| `pandit_flag` | Master. Unused by Balbodhini entry | `char(1)` |
| `close_flag` | Form centre validation | `char(1)` |

## 7. exam and paper

Keep one Balbodhini exam row and its paper row. Do not migrate other exams until Q-002 names the source `exam_no`.

SQL Server names: `exam.Exam`, `exam.Paper`.

| Legacy column | Evidence | Proposed type |
| --- | --- | --- |
| `exam_no` | Marks uses 1, result uses 2 | `int` |
| `exam_name` | Master | `nvarchar(50)` |
| `no_of_papers` | Master | `int` |
| `fees` | Master. No Balbodhini calculation | `decimal(10,2)` null |
| `att_sheet_printed` | Master | `char(1)` |
| `result_gen_flag` | Master | `char(1)` |
| `class1_marks`, `class2_marks`, `class3_marks`, `dist_marks` | Grace and grade | `int` |
| `min_total_khand1` | Fail rule. Not on the exam screen query | `int` |
| `paper_no` | Result filters `paper_no = 1` | `int` |
| `paper_name` | Master | `nvarchar(100)` |
| `passing_marks` | Selected, unused by result | `int` null |
| `exemption_marks` | Master | `int` null |
| `min_marks` | Fail rule | `int` |

Proposed natural key for paper: (`exam_no`, `paper_no`).

## 8. users and parameter

| Table | Columns evidenced | Proposed SQL Server |
| --- | --- | --- |
| `users` | `USERID`, `PASSWORD`, `KEY` | `security.AppUser`: `UserId nvarchar(10)`, `PasswordHash nvarchar(200)`, `IsSupervisor bit`. Legacy cipher columns are migration input only. |
| `parameter` | `session_month11`, `session_month12`, `session_month21`, `session_month22` | `exam.SessionMonthRule`, one row, four `nvarchar` months. |

`tot_forms` field sizes from the data environment: `userid` 10, `exam` 15, `tot_forms` integer. This table is a print buffer. Replace with a query. Do not require it as a permanent table.

## 9. Report shapes

These are outputs, not extra stored tables. Field names are confirmed from `reports/DataEnvironment1.Dsr`.

| Output | Fields |
| --- | --- |
| Name list | `roll_no`, `name`, `exam_centre`, `CentreName`, `DistName`. Grouped by centre name, district name, exam centre. Parameter `Session_no`. |
| Result sheet | `exam_centre`, `CentreName`, `roll_no`, `name`, `marks1`, `TotalMarks`, `GD`, `region_no`, `GradeName`, `Sp_Rank`. Grouped by exam centre, centre name, region. Parameter `session_no`. |
| Register | `RegionName`, `region_no`, `exam_centre`, `CentreName`, `roll_no`, `name`, `marks1`, `tot_marks`, `GD`, `dummyCentreCode`, `GradeName`. Parameter `Session`. |
| Certificate | `region_no`, `roll_no`, `name`, `City`, `GradeName`, `Month`. Parameters `session` and `region`. |

`GradeName` and `GD` are calculated in the unrecovered command SQL. The new report query must reproduce them after a sample of legacy certificates is compared. Do not guess the Marathi wording. Q-011.

## 10. Temp table replacement

| Legacy | Replacement |
| --- | --- |
| `attsheet` | Attendance DTO: centre, left roll, right roll. Built in the API for the requested centre only. No global delete. |
| `centre_count` | Query or table-valued result: centre, name, region, from/to group 1, from/to group 2, other rolls. |
| `tempcentre` | Direct select of centre address rows for the session’s form centres. |
| `tot_forms` | `SELECT UserId, COUNT(*) FROM Candidate WHERE SessionNo = @session GROUP BY UserId`. |

## 11. Relationship proposal

Confirmed only as join paths in queries, not as Access relationships.

```text
Session 1 --- * Candidate
Region 1 --- * District
Region 1 --- * Candidate
District 1 --- * Centre   (join is district_name, not an id)
Centre 1 --- * Candidate   as form centre
Centre 1 --- * Candidate   as exam centre
Exam 1 --- * Paper
AppUser 1 --- * Candidate   (user id stored on the candidate)
```

## 12. Migration notes

1. Repair or open `MRSEXAM.mdb` with the Access version that created it, export schema, and replace proposed lengths.
2. Load only Balbodhini rows and the masters they reference.
3. Preserve `srno`, roll numbers, marks text, grades, and rank text exactly.
4. Convert names from the `DV-TTAakash` encoding to Unicode in a reviewed mapping. The source code does not contain that mapping.
5. Do not migrate the Access password into SQL Server. Use Windows or SQL authentication and application secrets.
6. Add indexes for the filters the code actually runs: candidate by session and form centre, session and region and roll number, session and exam centre, and `result` null. Index names can be chosen at implementation. They are a performance proposal, not a legacy object.
