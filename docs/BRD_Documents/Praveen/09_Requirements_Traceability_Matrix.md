# Requirements Traceability Matrix — Praveen

| Req | Legacy | React | API | SQL | Test |
|-----|--------|-------|-----|-----|------|
| FR-PRV-010-015 | Frm_FormPraveen | PG-PRV-01 | /praveen/forms* | FormPraveen | TC-PRV-01..10 |
| FR-PRV-020-022 | Frm_PraveenMarks | PG-PRV-02 | /praveen/marks* | marks cols | TC-PRV-20..25 |
| FR-PRV-030-035 | Frm_GenResultPraveen | PG-PRV-03 | /praveen/results* | Generate SP | TC-PRV-30..45 |
| FR-PRV-040-047 | Rpt_*Praveen* | PG-PRV-04..11 | /praveen/reports* | queries | TC-PRV-50..57 |
| RULE-PRV-14 oral+reg | GenResult | — | ResultService | SP | TC-PRV-40 |
| RULE-PRV-17 resgen flag | Update session | Admin | admin endpoint | ExamSession | TC-PRV-46 |
