# Business Rules and Workflow Document — Pandit

Document ID: BRW-PANDIT-001

## 1. Workflow
```
Select Session
 → Form Entry (Khand I/II, Portion NEW/OLD, UND, prior paper slots)
 → Concession auto-flag if multi-session papers
 → Cross Reference (Processing)
 → Marks Entry (current session papers)
 → Generate Result (multi-branch)
 → Reports (mark sheet variants, students passing, etc.)
 → SUPER reset RESGEN_PANDIT if reprocess needed
```

## 2. Paper / Khand model (Confirmed from GenResult NEW path)

### NEW portion (flgportion = 'N') — primary modern path
| Khand | Written papers | Oral |
|-------|----------------|------|
| I | Marks1–4 | — |
| II | Marks5–7 (+ Marks8 in some checks) | Oral_marks (paper 9 minima) |
| Both | All with RES_DECL & BOTH_KHAND flags | Combined grading |

Khand1 total = Val(m1)+Val(m2)+Val(m3)+Val(m4)  
Khand2 total (NEW) = Val(m5)+Val(m6)+Val(m7) (marks8 often excluded from khand2_totmarks sum in code)

### OLD portion (flgportion = 'O'), session ≥ 20162
| Khand | Papers |
|-------|--------|
| I | Marks1–3 |
| II | Marks4–6 + oral |

## 3. Rule catalogue

| Rule ID | Rule | Source |
|---------|------|--------|
| RULE-PND-01 | RESGEN_PANDIT=Y locks form CRUD | Proc_CheckResultGen |
| RULE-PND-02 | UND flag mandatory Y/N; class if Y | check_data |
| RULE-PND-03 | Khand-specific required roll/session slots | check_data |
| RULE-PND-04 | Prior session marks required & numeric | check_data |
| RULE-PND-05 | Marks domain A or 0–100 | CheckMarks |
| RULE-PND-06 | Concession: sessions differ across papers beyond thresholds | Proc_CheckConcession |
| RULE-PND-07 | Generate blocked if already generated | Cmdgenresult |
| RULE-PND-08 | Khand1 all A → Absent/A | Gen |
| RULE-PND-09 | Khand1 any A → Fail/X | Gen |
| RULE-PND-10 | Khand1 sum < MIN_TOTAL_KHAND1 → Fail/X | Gen |
| RULE-PND-11 | Khand1 each paper ≥ min_marks → "Pandit Khand1 Pass" grade '-' | Gen |
| RULE-PND-12 | If other khand marks present + concession: Exam Pass grade 3 if each ≥ exemption | Gen |
| RULE-PND-13 | If other khand present + no concession: require khand2 min total & per-paper/oral minima then grade by tot | Gen |
| RULE-PND-14 | Khand2 analogous Absent/Fail/Khand2 Pass/Exam Pass paths | Gen |
| RULE-PND-15 | OLD portion uses alternate paper sets & some hardcoded thresholds (70, 375/300/250) | Gen ≥20162 O |
| RULE-PND-16 | When failing, khand tot may store only current-session paper contributions (IIf session_n = session) | Gen |

## 4. Concession logic (NEW) — summary
- If only Khand I sessions filled and any of sess1≠sess2/3/4 → Concession Y  
- If only Khand II filled and sessions differ among 5–8/oral → Y  
- If both khands filled and differences count ≥2 → Y  
- Message: "This student has taken concession."

## 5. Assumptions & ambiguities
See BRD §5. Especially: authoritative grade bands for NEW both-khand (EXAM 525/420/350 vs hardcoded 375/300/250 in OLD branches); TOT_MARKS formula; CrossRef rules; MEW typo.
