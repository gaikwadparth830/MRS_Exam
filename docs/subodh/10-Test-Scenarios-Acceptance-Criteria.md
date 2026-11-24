# Test Scenarios and Acceptance Criteria — Subodh

| Field | Value |
|-------|-------|
| Document ID | SUB-TEST-001 |
| Scope | Subodh exam |

Acceptance: each Must FR must pass listed scenarios. Prefer golden comparisons against Access outputs for result/report logic.

---

## 1. Auth & session

| ID | Scenario | Steps | Acceptance |
|----|----------|-------|------------|
| TC-AUTH-01 | Valid login | Enter valid user/password | Token issued; user identity available for stamping |
| TC-AUTH-02 | Invalid login | Wrong password | Rejected; no access |
| TC-SES-01 | Set default session | Select session as default | `/sessions/default` returns it; candidate query uses it |
| TC-SES-02 | No default session | Clear default; open candidates | User blocked with clear message (legacy unload/msg) |

---

## 2. Candidate entry

| ID | Scenario | Acceptance |
|----|----------|------------|
| TC-CAN-01 | List/navigate candidates for default session | Ordered by form centre, srNo; fields match DB |
| TC-CAN-02 | Create valid candidate | Saved; userid stamped; appears in list |
| TC-CAN-03 | Form centre closed | Reject with message equivalent to legacy |
| TC-CAN-04 | Missing name/gender/centres | Save blocked with field errors |
| TC-CAN-05 | Invalid centre code | Reject “does not exist” |
| TC-CAN-06 | Region auto-fill | Region matches district→region of form centre |
| TC-CAN-07 | Exam centre default | Equals form centre on new |
| TC-CAN-08 | User stamp | UserId = logged-in user |
| TC-CAN-09 | SrNo allocation | Normal new = max+3; insert-between = prev+1 (**until OQ-002 changes**) |
| TC-CAN-10 | Centre count | Count increments after save for that centre/session |
| TC-CAN-11 | Search by name prefix | Finds rows; navigates to record |
| TC-CAN-12 | Update / delete | Update persists; delete removes after confirm |
| TC-LOCK-01 | Resgen lock | Mutate actions disabled/rejected when ResgenSubodh=Y |

---

## 3. Marks

| ID | Scenario | Acceptance |
|----|----------|------------|
| TC-MRK-01 | Filter by region + from roll | Only matching rows |
| TC-MRK-02 | Enter 45 / 50 | TotMarks=95 |
| TC-MRK-03 | Enter 101 / -1 / “B” | Rejected |
| TC-MRK-04 | Enter A / 40 | TotMarks=40 (Val(A)=0) |
| TC-MRK-05 | Enter A / A | TotMarks=0; allowed at entry (fail later at result) |
| TC-LOCK-02 | Resgen lock | Grid not editable / API rejects |

---

## 4. Result engine (parity critical)

Use fixtures with known EXAM/PAPER thresholds (70/120/100/150; min 25).

| ID | Inputs (m1,m2,tot) | Expected result | Expected grade |
|----|--------------------|-----------------|----------------|
| TC-RES-03 | A, A, — | Fail | A |
| TC-RES-04 | A, 40, 40 | Fail | X |
| TC-RES-05 | 40, 20, 60 | Fail | X (&lt;70) |
| TC-RES-06 | 40, 40, 80 &amp; paper ok | Pass | 3 (80&lt;100) |
| TC-RES-07 | 55, 50, 105 | Pass | 2 |
| TC-RES-08 | 65, 60, 125 | Pass | 1 |
| TC-RES-09 | 80, 75, 155 | Pass | Vi. Yo. |
| TC-RES-10 | 20, 50, 70 | Fail | X (paper1 &lt; min) |
| TC-RES-11 | Two Pass same top tot | Both `FIRST IN {EngRegion}` | — |
| TC-RES-12 | Special ranks | Top band FIRST; next SECOND | — |
| TC-RES-13 | ResgenRun | Increments per run | — |
| TC-RES-14 | Already resulted rows | Not reprocessed (result not null) | — |
| TC-RES-01 | Missing paper master | Abort with message | — |
| TC-RES-02 | Empty candidate set | Message; no crash | — |

**Golden test:** For a sample Access session+region, new engine outputs match legacy `RESULT`/`GRADE`/`SPECIAL_RANK` for ≥99.5% of rows; investigate diffs.

---

## 5. Roll numbers

| ID | Scenario | Acceptance |
|----|----------|------------|
| TC-ROL-01 | Assign rolls to centre with N forms | N consecutive rolls from First; ordered by SrNo |
| TC-ROL-02 | Skip empty centres | Next centre with forms receives next numbers |
| TC-ROL-03 | Aur path | Matches legacy Aurangabad behaviour for sample |
| TC-ROL-04 | Utilities | Deferred until BR-043 clarified |

---

## 6. Reports

| ID | Scenario | Acceptance |
|----|----------|------------|
| TC-RPT-01 | Attendance PDF | Centres with Subodh candidates; rolls present; title Subodh |
| TC-RPT-02 | Hall tickets | Region filter; roll range respected |
| TC-RPT-03 | Name list | Names/rolls/centres for session |
| TC-RPT-04 | Register | Region/centre grouping |
| TC-RPT-05 | Result sheet | Includes names, marks, grade, result |
| TC-RPT-06 | Result sheet no-name | Names omitted |
| TC-RPT-07 | Certificates | Pass candidates only (confirm with legacy query) |
| TC-RPT-08 | Lost-by-two | Same population as legacy command for exam 4 |

UAT sign-off: visual parity checklist per report.

---

## 7. Utilities / NFR

| ID | Scenario | Acceptance |
|----|----------|------------|
| TC-UTL-01 | Regen path | Available for Subodh; documented effect |
| TC-UTL-03 | Backup/export | Includes FormSubodh |
| TC-NFR-01 | Unicode Hindi name round-trip | Display/store correct after migration |
| TC-NFR-02 | Concurrent two users editing different centres | No Access-style lock failure |

---

## 8. Entry criteria / exit criteria

**Entry:** BR draft approved for M3–M6; OQ-002/004 answered or deferred explicitly.  
**Exit:** All Must TC-* pass; golden result parity accepted; report UAT signed.
