# Requirements Traceability Matrix — Pandit

| Req | Legacy | React | API | SQL/Service | Test |
|-----|--------|-------|-----|-------------|------|
| FR-PND-001-010 | Frm_FormPandit | PG-PND-01/02 | /pandit/forms* | FormPandit | TC-PND-01..20 |
| FR-PND-020-023 | Frm_PanditMarks | PG-PND-03 | /pandit/marks* | Marks update | TC-PND-30..35 |
| FR-PND-030 | Frm_Pandit_CrossRef | PG-PND-04 | /pandit/cross-reference* | CrossRef svc | TC-PND-40 |
| FR-PND-040-047 | Frm_GenResultPandit | PG-PND-05 | /pandit/results* | Orchestrator | TC-PND-50..80 |
| FR-PND-050-057 | Rpt_*Pandit* | PG-PND-06..13 | /pandit/reports* | PDF | TC-PND-90..97 |
| RULE-PND-06 | Proc_CheckConcession | ConcessionAlert | check-concession | Service | TC-PND-15 |
| RULE-PND-11..14 | Gen loops | — | Processors | — | TC-PND-50..70 |
