# Test Scenarios and Acceptance Criteria — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | TEST-BAL-001 |
| Status | Draft |
| Pass condition | The scenario outcome matches the cited rule. Where a question is still open, the test is blocked rather than filled in with a guessed number. |

Threshold examples below use symbols (`MIN`, `CLASS1`, `CLASS2`, `DIST`) because Q-003 is unanswered. Replace them with the signed-off master values before execution.

## 1. Access

| ID | Scenario | Steps | Acceptance | FR |
| --- | --- | --- | --- | --- |
| TC-001 | Reject bad login | Blank user, unknown user, wrong password, then a valid user | The first three fail. The valid user reaches the shell. | FR-001 |
| TC-002 | Supervisor visibility | Sign in as SUPER and as another user | Only SUPER sees users, batch insert, reset lock, and mark correction. | FR-002 |
| TC-003 | No default session | Remove the default flag in a test database and open candidates | The candidate page does not open. Message states that no session is selected. | FR-004 |
| TC-004 | Session number rules | Save sessions ending in 0, shorter than 5 digits, and with a month outside `Parameter` | Each save is rejected. A five-digit session ending in 1 or 2 with an allowed month is saved. | FR-005 |
| TC-005 | Switch default | Mark another session as default | Candidate and marks pages show the new session and do not allow typing one. | FR-003, FR-006 |
| TC-006 | Backup session | Open a session flagged backup | Writes are rejected. The user is not asked to pick an Access file. | FR-007 |

## 2. Masters and centres

| ID | Scenario | Acceptance | FR |
| --- | --- | --- | --- |
| TC-010 | Create a region with a seat-region number | It appears in the roll-number seat-region list. | FR-010 |
| TC-011 | Create a district under that region | A centre in that district resolves to that region. | FR-012 |
| TC-012 | Close a centre | It cannot be a form centre. It can still be typed as an exam centre, matching RULE-014, until Q-008 changes the rule. | FR-013, FR-029 |
| TC-013 | Remove the Balbodhini paper row and generate | Generation returns an error and does not clear existing grades. | FR-016 |
| TC-014 | Set English region name | A new region-first rank uses that text. | FR-011 |

## 3. Candidates

| ID | Scenario | Acceptance | FR |
| --- | --- | --- | --- |
| TC-020 | Save a complete candidate | Name, gender, centres, derived region, default session, and signed-in user are stored. Roll number is null. | FR-022, FR-028 |
| TC-021 | Update the candidate | Name can change. Roll number, after it exists, does not change on this page. | FR-027 |
| TC-022 | Change form centre while editing | Exam centre becomes the form centre. Region follows the new centre’s district. | FR-030, FR-029 |
| TC-023 | Form count | After two saves for one centre, the count is 2. | FR-032 |
| TC-024 | Insert between | Given serials 10 and 13, insert succeeds with 11. Given serials 10 and 11, insert is refused. | FR-026 |
| TC-025 | Serial step | Three ordinary saves produce serials separated by 3. | FR-025 |
| TC-026 | Batch insert | Start name, middle `-` names, and end name exist for every roll from start through end. Gender may be null, as in the legacy insert. | FR-036 |
| TC-027 | Lock | With the flag `Y`, new, save, delete, and marks update are rejected. | FR-035, FR-055 |
| TC-028 | Delete | Confirm deletes that serial in the current session only. | FR-033 |
| TC-029 | Search | Name prefix finds the candidate. Roll plus region finds the candidate. | FR-034 |
| TC-020a | Missing gender | Save is rejected. | FR-022 |
| TC-020b | Gender X | The value is not stored. | FR-023 |

## 4. Roll numbers

| ID | Scenario | Acceptance | FR |
| --- | --- | --- | --- |
| TC-040 | Range longer than the form count | No roll number changes. | FR-042 |
| TC-041 | Confirm last name | Roll numbers from first through last are stored in `srno` order. | FR-043 |
| TC-041a | Reject last name | Roll numbers stay as they were. | FR-043 |
| TC-042 | Next centre | The next suggested centre is the next one in seat-district order that has forms, and the suggested start is max roll plus 1. | FR-044 |
| TC-043 | Aur | Only null roll numbers change. A centre in another seat region is rejected. | FR-045 |
| TC-044 | Clear | Roll numbers at or above the centre’s minimum, in that region and session, become null. Numbers below the minimum stay. | FR-046 |

## 5. Marks

| ID | Scenario | Acceptance | FR |
| --- | --- | --- | --- |
| TC-050 | Filter | The grid shows the current session, the region, roll numbers from the entered value up, and only rows with a null result. | FR-050, FR-051 |
| TC-051 | Invalid marks | `B`, `-1`, and `101` are rejected. `0`, `100`, and `A` are accepted. | FR-052 |
| TC-052 | Grace | A mark exactly 1 or 2 below a configured boundary asks the question. Accept stores the boundary value. Refuse stores the typed mark. A gap of 3 does not ask. | FR-053 |
| TC-053 | Total | A numeric mark stores the same total. `A` stores total 0 at entry time. | FR-054 |

TC-052 is blocked until Q-002 names the exam row whose boundaries are used.

## 6. Result

Use one region and these candidates after marks are stored.

| ID | Paper 1 | Total before generate | Expected |
| --- | --- | --- | --- |
| TC-060a | `A` | 0 | Result `Fail`, grade `A`, total null |
| TC-060b | number below `MIN` total | that number | `Fail`, grade `X` |
| TC-060c | number below paper `min_marks` but total otherwise high enough | that number | `Fail`, grade `X` |
| TC-060d | at least `DIST` | same | `Pass`, grade `Vi. Yo.` |
| TC-060e | at least `CLASS1` and below `DIST` | same | `Pass`, grade `1` |
| TC-060f | at least `CLASS2` and below `CLASS1` | same | `Pass`, grade `2` |
| TC-060g | at least the pass minimum and below `CLASS2` | same | `Pass`, grade `3` |

| ID | Scenario | Acceptance | FR |
| --- | --- | --- | --- |
| TC-060 | Rows above | Outcomes match RULE-063 to RULE-067. Rows that already have a result are unchanged. | FR-063 |
| TC-061 | Two passers tied on the highest total | Both receive `FIRST IN` plus the English region name. The next total does not. | FR-063 |
| TC-062 | Find Ranks | Those two become `FIRST`. The next distinct total becomes `SECOND`. | FR-065 |
| TC-063 | Result grid | Read-only, filtered to the region, columns as in FR-064. | FR-064 |
| TC-064 | Run number | The stored run matches the signed answer to Q-006. Until then, record the legacy formula RULE-062 as the expected value and mark the test expected-result pending. | FR-063 |
| TC-065 | Region 10 or above | The API receives region 10 as the number 10 and processes that region. | FR-060 |

TC-060 is blocked until Q-003 supplies the numeric boundaries.

## 7. Corrections

| ID | Scenario | Acceptance | FR |
| --- | --- | --- | --- |
| TC-070 | Reset flag | Confirm sets the flag to `N`. Cancel leaves it. A standard user cannot call it. | FR-070 |
| TC-071 | Correct an unranked candidate | Only that roll number loses result, grade, run, and rank. Paper 1 and total match the edit. | FR-073 |
| TC-072 | Correct a ranked candidate | Every candidate in that session and region loses result, grade, run, and rank. The message tells the user to regenerate. | FR-074 |
| TC-073 | Correct a candidate with no result yet | The display is rejected. | FR-071 |

## 8. Reports

| ID | Scenario | Acceptance | FR |
| --- | --- | --- | --- |
| TC-080 | Attendance for one centre | Roll numbers for that centre and session appear. Another centre’s rolls do not. The sheet does not depend on a global wipe of other users’ data. | FR-080 |
| TC-081 | Name list | All-centres and one-centre filters match the data. Header month and four-digit year match the session. | FR-081 |
| TC-082 | Result sheets | Named and no-name layouts use the same rows. Centre filter and region filter work. A missing or invalid result date is rejected. | FR-082 |
| TC-083 | Certificates | Session and region are required. From-only, to-only, and from-to filters match FR-083. Year is the first four digits. | FR-083 |
| TC-084 | Register totals | Pass, fail-with-X, absent-with-A, null-result, and pass percent match RULE-090 to RULE-095 for a prepared session. | FR-084 |
| TC-085 | Dummy centres | Codes increase when the exam centre changes within a region, in roll-number order. | FR-085 |
| TC-086 | Region register | Only the selected region is in the file. | FR-086 |
| TC-087 | Centre ranges | A gap in roll numbers starts the next group or the other-list, matching `ProcPrint`. | FR-087 |
| TC-088 | Form counts | The count equals Balbodhini rows for that user and default session. Other exams are not included. | FR-088 |
| TC-089 | Centre labels | The text file uses `%` separators and includes a centre that has only Balbodhini forms. | FR-089 |

## 9. Non-functional checks

| ID | Scenario | Acceptance |
| --- | --- | --- |
| TC-090 | Two users assign roll numbers for the same centre | One commit succeeds. The other fails or renumbers from a fresh read. Numbers are not interleaved across two confirmations. |
| TC-091 | Devanagari name round-trip | A name saved in Unicode is returned and printed unchanged. |
| TC-092 | Standard user calls supervisor routes | The API returns forbidden. |

## 10. Sign-off sample

Before production, run TC-060 through TC-062 and TC-080 through TC-084 on one historical session and compare the result, grade, rank, and report totals with the legacy program for the same rows. A difference stops go-live unless the difference is one of the recorded defects the business has agreed to correct.
