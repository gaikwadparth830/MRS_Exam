# Test Scenarios & Acceptance Criteria — Pandit

## Form / validation
| TC | Scenario | Expected |
|----|----------|----------|
| TC-PND-01 | Create Khand I NEW with papers 1–4 slots | Saved |
| TC-PND-02 | Missing UND | Reject |
| TC-PND-03 | UND=Y without class | Reject |
| TC-PND-04 | Khand I missing paper3 session | Reject |
| TC-PND-05 | Prior session without marks | Reject |
| TC-PND-06 | Marks 101 | Reject |
| TC-PND-07 | Marks A | Accept |
| TC-PND-08 | Multi-session papers | Concession Y + message |
| TC-PND-09 | RESGEN lock | CRUD disabled |

## Result — NEW Khand I (min_total 140, min_marks 25)
| TC | Case | Expected |
|----|------|----------|
| TC-PND-50 | m1–4 all A | Absent / A |
| TC-PND-51 | one A | Fail / X |
| TC-PND-52 | sum 130 | Fail / X |
| TC-PND-53 | all ≥25 sum≥140, no khand2 | Pandit Khand1 Pass / - |
| TC-PND-54 | +khand2 present, concession Y, each ≥exemption | Pandit Exam Pass / 3 |
| TC-PND-55 | +khand2 present, no concession, khand2 pass + tot high | Pandit Exam Pass + grade band |

## Result — NEW Khand II
| TC | Case | Expected |
|----|------|----------|
| TC-PND-60 | all A on 5–8 | Absent / A |
| TC-PND-61 | sum m5+m6+m7 < min_khand2 | Fail / X |
| TC-PND-62 | minima ok | Pandit Khand2 Pass / - |
| TC-PND-63 | with khand1 complete → Exam Pass + grade | Pandit Exam Pass |

## OLD portion (≥20162)
| TC | Case | Expected |
|----|------|----------|
| TC-PND-70 | Khand I old 3 papers pass | Khand1 Pass path |
| TC-PND-71 | Khand II old m4+m5 <70 | Fail (matches current code) — **confirm with business** |

## CrossRef / Reports / UAT
| TC | AC |
|----|----|
| TC-PND-40 | CrossRef produces same updates as VB on sample set |
| TC-PND-90..97 | Each report PDF contains expected rolls/results |
| UAT | Operations staff sign-off on 20 mixed real cases vs Access |

## Go-live gate
All Critical result TCs pass; open questions 1–4 in BRD resolved in writing.
