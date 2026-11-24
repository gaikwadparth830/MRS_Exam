# Business Requirements Document (BRD) — Praveen Exam

| Field | Value |
|-------|-------|
| Document ID | BRD-PRAVEEN-001 |
| Exam | Praveen (EXAM_NO = 6) |
| Legacy sources | Frm_FormPraveen.frm, Frm_PraveenMarks.frm, Frm_GenResultPraveen.frm, Frm_SelectRegionPraveen.frm, Frm_MarkSheetPraveen.frm, MDIForm1.frm, FORM_PRAVEEN / FORM_PRAVEEN20162 |
| Version | 1.0 Draft |

## 1. Purpose
Modernize Praveen examination form entry, 5-paper + oral(+reg_lang) marks, result generation, ranking, and reports with rule fidelity.

## 2. Business objectives
| ID | Objective |
|----|-----------|
| BR-PRV-001 | Capture Praveen candidate forms for active session (roll+region unique). |
| BR-PRV-002 | Enter marks for papers 1–5, oral, and regional language; compute total of 5 papers. |
| BR-PRV-003 | Generate Pass/Fail/grade and FIRST rank; set SESSION.RESGEN_PRAVEEN='Y'. |
| BR-PRV-004 | Produce attendance, result, mark sheet, certificate, name list, register, ranks, lost-by-2-marks reports. |
| BR-PRV-005 | Lock form CRUD when RESGEN_PRAVEEN='Y'. |
| BR-PRV-006 | Supervisor can reset result flag. |

## 3. Current-state summary (Confirmed)
- Table FORM_PRAVEEN (~15,465 rows). Historic FORM_PRAVEEN20162 without MARKS5.
- Natural key: ROLL_NO + SESSION_NO + REGION_NO (duplicate check on save).
- No gender field on Praveen form (unlike Prabodh).
- Columns UND_FLAG, UND_CLASS exist on table but **not used** on Frm_FormPraveen UI reviewed — Open Question if still business-relevant.
- Marks total = m1+m2+m3+m4+m5 (oral & reg_lang excluded from total).
- Pass oral rule: `(Val(oral_marks)+Val(reg_lang)) >= 35` (combined).
- Generate loads all rows with all marks non-null for session (not region-filtered in open SQL — unlike Prabodh).
- After generate: `Update session set resgen_praveen='Y'`.
- Rank: FIRST only on max tot among PASS (SECOND commented in main path; Command1 has FIRST+SECOND).

### Master thresholds (DB)
| Item | Value |
|------|-------|
| Papers | 5 |
| Fees | 100 |
| Min total | 175 |
| Class1/2/3 | 300 / 250 / 175 |
| Dist (Vi. Yo.) | 375 |
| Paper min_marks | 25 (all) |
| Oral+RegLang combined min | 35 (hardcoded sum) |

## 4. Detailed requirements
| ID | Requirement | Source | Confidence |
|----|-------------|--------|------------|
| BR-PRV-010 | Active session DEFA='Y' | Form_Activate | Confirmed |
| BR-PRV-020 | Mandatory Name, Form Centre, Exam Centre | check_data | Confirmed |
| BR-PRV-021 | Centre exists; form centre not closed; region from centre chain | Validate handlers | Confirmed |
| BR-PRV-022 | Roll unique per session+region on new | Cmd_save_Click dup check | Confirmed |
| BR-PRV-023 | CRUD + nav + search via ClassMaster | Cmd_* | Confirmed |
| BR-PRV-024 | Lock CRUD if RESGEN_PRAVEEN='Y' | Form_Activate | Confirmed |
| BR-PRV-030 | Marks 1–5, oral, reg_lang; tot=sum papers | Frm_PraveenMarks | Confirmed |
| BR-PRV-031 | Marks numeric ≥0 ≤100 or 'A' | AfterColEdit | Confirmed |
| BR-PRV-040 | All five papers 'A' → Fail / Grade A / tot null | GenResult | Confirmed |
| BR-PRV-041 | Any paper 'A' → Fail / X | GenResult | Confirmed |
| BR-PRV-042 | tot < 175 → Fail / X | GenResult | Confirmed |
| BR-PRV-043 | Null marks → '-' | GenResult | Confirmed |
| BR-PRV-044 | Any paper < min OR (oral+reg_lang)<35 → Fail / X | GenResult | Confirmed |
| BR-PRV-045 | Else Pass; grade Vi.Yo./1/2/3 by tot vs dist/class thresholds | GenResult | Confirmed |
| BR-PRV-046 | Assign FIRST rank; set resgen_praveen=Y | GenResult | Confirmed |
| BR-PRV-050 | Reports listed in screen inventory | MDI + Rpt_* | Confirmed |

## 5. Open questions
1. Are UND_FLAG / UND_CLASS required for Praveen modernization? (**Confirmed unused in VB UI/code** — recommend archive columns unless business reintroduces.)
2. Should generate be region-scoped (Prabodh style) or full session (current)?
3. Is REG_LANG (“Project”) always entered? Null → `Val`≈0 in pass rule — confirm.
4. SECOND rank — enable or keep FIRST-only?
5. FORM_PRAVEEN20162 — **no code references**; archive only?
6. **Legacy defects — preserve or fix (needs CR)?** (a) Absent checks repeat `marks2` instead of 3/4/5; (b) Delete omits `region_no` though uniqueness is roll+session+region.
7. No single-student Update Marks for Praveen today — add in modern app?

See also: `BRD_Documents/00_DeepDive_Analysis_Addendum.md`.

## 6. Success criteria
Golden comparison of result/grade/rank for a full session against Access; UAT sign-off on forms/marks/reports.
