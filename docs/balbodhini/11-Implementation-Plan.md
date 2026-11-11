# Implementation Plan — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | PLAN-BAL-001 |
| Status | Proposal. Do not start application generation until the BRD review answers the blocking questions. |
| Out of this plan | Pandit, Praveen, Prabodh, Subodh, Praveshika, Prathamik, hall tickets, and mark sheets |

## 1. Blocking decisions

| Question | Blocks |
| --- | --- |
| Q-001 How the result lock is turned on | Session lock behavior and any “publish results” action |
| Q-002 Which exam and paper rows are Balbodhini | Grace and result services |
| Q-003 Live threshold numbers | Result acceptance test TC-060 |
| Q-012 Password migration | First login in test |
| Q-014 Readable Access schema | Frozen table lengths and keys |

Q-004, Q-005, Q-006, Q-007, Q-008, and Q-011 can proceed with the legacy behavior documented in the FRS, and change later if the answer differs. Q-007’s region parsing bug is not copied: the API takes an integer. That is already specified.

## 2. Modules and dependencies

```text
M0 Decisions and schema extract
        |
        v
M1 SQL Server schema and migration tool
        |
        +----------------------+
        v                      v
M2 Auth and session       M3 Masters
        |                      |
        +----------+-----------+
                   v
              M4 Candidates
                   |
                   v
              M5 Roll numbers
                   |
                   v
              M6 Marks
                   |
                   v
              M7 Result
                   |
                   v
              M8 Reports
                   |
                   v
              M9 Parallel run
```

| Module | Depends on | Delivers | Requirements |
| --- | --- | --- | --- |
| M0 | Business review | Signed BRD, exam row id, thresholds, Unicode name sample, opened Access schema | Q-001 to Q-014 |
| M1 | M0 | SQL project, load of one session, reconciliation counts | Data-mapping document |
| M2 | M1 | Login, supervisor flag, current session, backup read-only mode | FR-001 to FR-007 |
| M3 | M2 | Region, district, centre, exam, paper, users | FR-010 to FR-017 |
| M4 | M3 | Candidate pages and API, insert-between, batch, search, lock rejection | FR-020 to FR-036 |
| M5 | M4 | Regular, Aur, and clear roll numbers with confirmation | FR-040 to FR-046 |
| M6 | M5 | Marks grid and grace | FR-050 to FR-055 |
| M7 | M6 | Generate, ranks, correction, reset | FR-060 to FR-074 |
| M8 | M7 | All reports in FR-080 to FR-089 | BR-070 to BR-078 |
| M9 | M8 | Compare one full session with the VB6 output | Section 10 of the test document |

M4 can start as soon as centres resolve a region. M6 and M7 need the exam row from M0. M8 report wording needs Q-011, but the data queries can be built earlier.

## 3. Milestones

| Milestone | Exit criteria |
| --- | --- |
| MS-0 Review complete | BRD 0.1 comments closed. Q-001, Q-002, Q-003, Q-012, and Q-014 answered in writing. |
| MS-1 Data loaded | Candidate count in SQL Server equals `form_balbodhini` for the pilot session. Every form centre and region resolves. |
| MS-2 Entry usable | TC-001 through TC-029 pass on the pilot session. |
| MS-3 Numbers and marks | TC-040 through TC-053 pass. |
| MS-4 Results match | TC-060 through TC-074 match the legacy program on the pilot session, except defects the business has accepted. |
| MS-5 Reports match | TC-080 through TC-089 match counts and membership. Heading text matches the approved Unicode labels. |
| MS-6 Go-live | Parallel run signed. Access file set read-only. Operators trained on the nine workflows in the rules document. |

## 4. Suggested order of work after sign-off

1. Export the Access schema and replace proposed string lengths.
2. Create the SQL Server project and the migration console.
3. Build auth, session, and masters.
4. Build candidate entry, because it proves centres, regions, and the lock.
5. Build roll numbers, then marks, then result. Do not start reports that show grades before result tests pass.
6. Build reports in the order operators use them: attendance, name list, result sheet, certificate, register.
7. Run the historical comparison before any production write.

## 5. Risks

| Risk | Mitigation |
| --- | --- |
| Access file cannot be opened with the current ACE provider | Use the Access version that created the file, or a 32-bit Jet driver, on a machine that already runs the VB6 program. |
| Names are not Unicode | Approve a conversion sample before loading production names. |
| Exam 1 and exam 2 disagree | Q-002. Do not average or merge the rows. |
| Two operators numbering the same centre | Commit re-reads inside a transaction. Covered by TC-090. |
| Report headings cannot be read from the designer font | Business supplies the print text. Q-011. |
| Lock flag is never set today | Do not invent a publish button. Ship the reset command and leave the flag under office control until Q-001. |

## 6. What the next implementation request should say

After review, a build request can name one module, for example “implement M2 and M3 only”. The application should not be generated as a whole from this draft.
