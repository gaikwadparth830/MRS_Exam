# Test Scenarios & Acceptance Criteria — Praveen

## Forms
| TC | Scenario | Expected |
|----|----------|----------|
| TC-PRV-01 | Create valid | Saved with userid |
| TC-PRV-02 | Dup roll same region/session | Reject |
| TC-PRV-03 | Same roll different region | Allowed |
| TC-PRV-04 | Closed centre | Reject |
| TC-PRV-05 | RESGEN lock | CRUD disabled |

## Marks
| TC | Scenario | Expected |
|----|----------|----------|
| TC-PRV-20 | 40x5 | tot=200 |
| TC-PRV-21 | A accepted | OK |
| TC-PRV-22 | 101 rejected | Error |

## Result (min 25, oral+reg>=35, bands 375/300/250/175)
| TC | Case | Expected |
|----|------|----------|
| TC-PRV-30 | All A | Fail/A |
| TC-PRV-31 | One A | Fail/X |
| TC-PRV-32 | tot 170 | Fail/X |
| TC-PRV-33 | papers ok, oral 20 reg 10 (=30) | Fail/X |
| TC-PRV-34 | oral 20 reg 15 (=35) | Pass path if papers ok |
| TC-PRV-35 | tot 380 | Vi. Yo. |
| TC-PRV-36 | tot 310 | Grade 1 |
| TC-PRV-37 | tot 260 | Grade 2 |
| TC-PRV-38 | tot 180 | Grade 3 |
| TC-PRV-39 | FIRST ties | All top get FIRST |
| TC-PRV-40 | After generate | RESGEN_PRAVEEN=Y; second generate blocked |
| TC-PRV-41 | SUPER reset | Generate allowed again |

## UAT AC
Golden session compare ≥99% result/grade match; reports contain correct rolls/names/totals.
