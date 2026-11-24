# Business Rules and Workflow Document — Praveen

Document ID: BRW-PRAVEEN-001

## Workflow
Select Session → Form Entry (roll unique per region) → Marks (5 papers + oral + reg_lang) → Generate Result (sets RESGEN_PRAVEEN) → Reports → optional SUPER reset.

## Rules
| Rule ID | Rule | Source |
|---------|------|--------|
| RULE-PRV-01 | Active session only | Form_Activate |
| RULE-PRV-02 | Mandatory name, form centre, exam centre | check_data |
| RULE-PRV-03 | Form centre not closed | Validate |
| RULE-PRV-04 | Unique roll per session+region | Cmd_save |
| RULE-PRV-05 | Lock CRUD when RESGEN_PRAVEEN=Y | Form_Activate |
| RULE-PRV-06 | Marks 0–100 or A | AfterColEdit |
| RULE-PRV-07 | tot = m1+m2+m3+m4+m5 | AfterColEdit |
| RULE-PRV-08 | Block generate if already generated | cmd_gen_result |
| RULE-PRV-09 | Clear special_rank/grade/result then recompute for session | Update + loop |
| RULE-PRV-10 | All 5 papers A → Fail/A | Gen |
| RULE-PRV-11 | Any paper A → Fail/X | Gen |
| RULE-PRV-12 | tot < min_total_khand1 (175) → Fail/X | Gen |
| RULE-PRV-13 | Null any mark → '-' | Gen |
| RULE-PRV-14 | paper < min_marks OR (oral+reg_lang)<35 → Fail/X | Gen |
| RULE-PRV-15 | Pass grades: ≥375 Vi.Yo.; ≥300 1; ≥250 2; else 3 | Gen |
| RULE-PRV-16 | FIRST rank on max tot among PASS | rsrank |
| RULE-PRV-17 | Set RESGEN_PRAVEEN='Y' after success | cmd Update session |

## Assumptions
- ASSUM-PRV-01: UND_* columns unused in current UI — retain in DB, hide in UI unless confirmed.
- ASSUM-PRV-02: Val(reg_lang) treats non-numeric as 0.

## Ambiguities
- Generate not region-scoped (processes whole session) while marks UI is region-scoped.
- SECOND rank only in Command1 helper, not main path.
