# Business Requirements Document (BRD) — Pandit Exam

| Field | Value |
|-------|-------|
| Document ID | BRD-PANDIT-001 |
| Exam | Pandit (EXAM_NO = 7) |
| Legacy sources | Frm_FormPandit.frm, Frm_PanditMarks.frm, Frm_GenResultPandit.frm, Frm_Pandit_CrossRef.frm, Frm_PanditRegister.frm, Frm_StudentsPassingPandit.frm, FORM_PANDIT / FORM_PANDIT20162, lblpandit.mdb |
| Version | 1.0 Draft |

## 1. Purpose
Modernize the Pandit (राष्ट्रभाषा पंडित) exam — the most complex exam in MrsExam — covering Khand I / Khand II appearance, prior-session exemptions, concession, OLD/NEW portion, cross-reference, result generation, and specialized reports.

## 2. Business objectives
| ID | Objective |
|----|-----------|
| BR-PND-001 | Capture Pandit forms with khand appearing, undertaking, address, per-paper prior roll/session/marks, oral, portion flag. |
| BR-PND-002 | Auto-detect concession when papers span multiple sessions (Proc_CheckConcession). |
| BR-PND-003 | Enter current-session marks by khand/portion; maintain khand totals. |
| BR-PND-004 | Cross-reference processing prior to/with results. |
| BR-PND-005 | Generate results for Khand I, Khand II, Both (res_decl_flag), OLD vs NEW portion paths. |
| BR-PND-006 | Produce att sheet, result details, mark sheets (multiple variants), name list, RG, ranks, students passing, lost-by-2-marks. |
| BR-PND-007 | Lock mutations when RESGEN_PANDIT='Y'; SUPER can reset. |
| BR-PND-008 | Respect CENTRE.PANDIT_FLAG where used for centre eligibility (*confirm usage*). |

## 3. Current-state summary (Confirmed)

### Structure
- FORM_PANDIT (~13,052). FORM_PANDIT20162 historic (no marks7/8, no flgportion).
- Key: ROLL_NO + SESSION_NO.
- KHAND_APPEARING: 'I' or 'II' (combo).
- NEW portion (flgportion='N'): Khand I uses papers 1–4; Khand II uses papers 5–8 + oral (paper 9 in master).
- OLD portion (flgportion='O'): fewer papers (Khand I: 1–3; Khand II: 4–6 + oral) — separate generate branches for session ≥ 20162.
- Each paper slot stores ROLL_NO_n, SESSION_NO_n, MARKSn for exemption/carry from prior attempts.
- Marks editable on form only when paper's session ≠ current session (Class_Marks_Enable) — prior marks entry.
- UND_FLAG Y/N required; if Y, UND_CLASS required.
- CONCESSION_FLAG set by Proc_CheckConcession when sessions differ across papers.
- BOTH_KHAND_FLAG / OTH_KHAND_ROLLNO / RES_DECL_FLAG for combined declaration.
- Address ADD1–3 captured.
- EXAM master still shows NO_OF_PAPERS=3 historically, but PAPER has 9 papers for exam 7 and form supports 8+oral — **masters out of sync with UI** (Open Question).

### Result outcomes (Confirmed strings)
- Absent / Fail / Pandit Khand1 Pass / Pandit Khand2 Pass / Pandit Exam Pass
- Grades: A, X, '-', 1, 2, 3, Vi. Yo.

### Thresholds (EXAM_NO=7 DB + code)
| Item | DB / Code |
|------|-----------|
| Min Khand1 | 140 (NEW uses 4 papers sum) |
| Min Khand2 | 105 (NEW: marks5+6+7); OLD code often uses hardcoded 70 for m4+m5 |
| Class1/2/3 | 420 / 350 / 245 |
| Dist | 525 |
| OLD both-khand grade bands | Hardcoded 375/300/250 in some branches (not always rsgrade fields) |
| Exemption marks | PAPER.exemption_marks (typically 40) when concession |

## 4. Detailed requirements
| ID | Requirement | Source | Conf |
|----|-------------|--------|------|
| BR-PND-010 | Active session; lock if RESGEN_PANDIT=Y | Proc_CheckResultGen | Y |
| BR-PND-020 | Mandatory roll, name, centres, und flag, khand appearing | check_data | Y |
| BR-PND-021 | If UND=Y require und class; und only Y/N | check_data | Y |
| BR-PND-022 | Khand I requires roll+session for papers 1–3 (and 4 if NEW) | check_data | Y |
| BR-PND-023 | Khand II requires roll+session for papers 5–6 (and 7–8 if NEW) | check_data | Y |
| BR-PND-024 | Prior-session papers require marks numeric ≥0 | check_data | Y |
| BR-PND-025 | Marks validate 0–100 or A (CheckMarks) | CheckMarks | Y |
| BR-PND-026 | Auto concession messaging when multi-session papers | Proc_CheckConcession | Y |
| BR-PND-027 | Centre validation (exist; form centre open) | Validate | Y |
| BR-PND-030 | Marks entry grid for NEW portion flgportion=N (session≥20162) | Frm_PanditMarks | Y |
| BR-PND-031 | Tot on marks form sums P1..P7 (verify oral/P8 handling — Open Q) | TxtTot calc | Partial |
| BR-PND-040 | Generate blocked if RESGEN_PANDIT=Y | Cmdgenresult | Y |
| BR-PND-041 | Process Khand I (flgportion N), Khand II (N), Both (res_decl+both flags), plus OLD (O) branches if session≥20162 | GenResult | Y |
| BR-PND-042 | Khand1 all A → Absent/A; any A → Fail/X; sum&lt;min → Fail; else Khand1 Pass or escalate to Exam Pass with grade | GenResult | Y |
| BR-PND-043 | Concession path: pass if each relevant paper ≥ exemption_marks; grade 3 for Exam Pass | GenResult | Y |
| BR-PND-044 | Non-concession both-khand: require khand2 minima + oral pass then grade by tot vs thresholds | GenResult | Y |
| BR-PND-045 | Set RESGEN_PANDIT='Y' after generate (*confirm exact location in form end*) | Pattern w/ Praveen | Assumption |
| BR-PND-050 | Cross reference function available from Processing menu | Frm_Pandit_CrossRef | Y |
| BR-PND-060 | Specialized reports including Students Passing Pandit | Reports | Y |

## 5. Open questions (critical)
1. Exact NEW paper layout mapping: Khand I = marks1–4; Khand II = marks5–7 (+ marks8 regional); oral = paper 9 — **confirm with syllabus owner**.
2. Why EXAM.NO_OF_PAPERS=3 while 8–9 paper slots exist? (**Working assumption:** 3 subjects per Khand; slots store multi-session history.)
3. Hardcoded grade bands 375/300/250 in OLD paths vs EXAM 525/420/350 — which is authoritative for ≥20162 NEW?
4. Hardcoded Khand2 min 70 in OLD vs MIN_TOTAL_KHAND2=105 — confirm.
5. Typo `cmdportion.Text = "MEW"` and `li_passing9` using paper 8 — **preserve defects or fix via CR?**
6. TOT_MARKS: marks entry sums P1–P7 only (excludes marks8) — intentional?
7. CrossRef: confirmed field updates + Exam Pass/grade 3 merge — when is CrossRef **mandatory** vs optional?
8. `lblpandit.mdb` — **no code references**; retire?
9. flgportion default for new entries (N vs O).
10. BOTH_KHAND_FLAG / RES_DECL_FLAG — system-set via CrossRef (confirmed); any manual override needed?
11. Prior-session window `session_no - 20` (~2 years) — keep?
12. Ranking FIRST+SECOND among `PANDIT EXAM PASS` only — confirm.

See also: `BRD_Documents/00_DeepDive_Analysis_Addendum.md`.

## 6. Success criteria
- Side-by-side result match on mixed Khand I/II/Both, concession Y/N, OLD/NEW samples.
- UAT by Pandit operations staff on form complexity.
- No silent rule change without CR.
