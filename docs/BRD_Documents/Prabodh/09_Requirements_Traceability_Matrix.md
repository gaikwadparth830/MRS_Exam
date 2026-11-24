# Requirements Traceability Matrix — Prabodh

Document ID: RTM-PRABODH-001

| Req ID | Description | Legacy artifact | React | API | SQL | Test |
|--------|-------------|-----------------|-------|-----|-----|------|
| BR-PRB-001 / FR-PRB-010-020 | Form entry | Frm_FormPrabodh | PG-PRB-01 | /prabodh/forms* | FormPrabodh | TC-PRB-01..10 |
| BR-PRB-002 / FR-PRB-030-031 | Roll numbers | SetRollNo* | PG-PRB-04/05 | /prabodh/roll-numbers* | FormPrabodh.RollNo | TC-PRB-20 |
| BR-PRB-003 / FR-PRB-040-043 | Marks | Frm_PrabodhMarks | PG-PRB-02 | /prabodh/marks* | Marks cols | TC-PRB-30..35 |
| BR-PRB-004 / FR-PRB-050-054 | Result+rank | Frm_GenResultPrabodh | PG-PRB-03 | /prabodh/results* | usp_Prabodh_GenerateResult | TC-PRB-40..55 |
| BR-PRB-005 / FR-PRB-060-067 | Reports | Rpt_*Prabodh | PG-PRB-06..13 | /prabodh/reports/* | queries | TC-PRB-60..67 |
| BR-PRB-006 / FR-PRB-019 | Lock after resgen | Form_Activate | ResgenLockBanner | 403 on mutate | ExamSession.ResgenPrabodh | TC-PRB-11 |
| BR-PRB-007 / FR-PRB-055 | Reset flag | Frm_RegenResult | PG-PRB-14 | /admin/sessions/... | ExamSession | TC-PRB-12 |
| RULE-PRB-12 | All A → Fail/A | cmd_gen_result | — | ResultService | SP | TC-PRB-41 |
| RULE-PRB-13 | Any A → Fail/X | same | — | ResultService | SP | TC-PRB-42 |
| RULE-PRB-14 | tot&lt;105 Fail | same | — | ResultService | SP | TC-PRB-43 |
| RULE-PRB-16 | min/oral&lt;35 | same | — | ResultService | SP | TC-PRB-44 |
| RULE-PRB-17 | Grade bands | same | — | ResultService | SP | TC-PRB-45..48 |
| RULE-PRB-19 | FIRST rank | rank loop | — | assign-ranks | SP | TC-PRB-50 |
