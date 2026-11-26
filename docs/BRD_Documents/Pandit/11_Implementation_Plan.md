# Implementation Plan — Pandit

Document ID: PLAN-PANDIT-001

## Sequencing (after Prabodh & Praveen foundations)
| Milestone | Work | Depends |
|-----------|------|---------|
| M0 | Resolve BRD open questions with business | — |
| M1 | Schema + migrate FORM_PANDIT | Shared DB |
| M2 | Form API + React complex form | M1 |
| M3 | Concession + CrossRef spike/docs/impl | M2 |
| M4 | Marks NEW/OLD | M2 |
| M5 | Result orchestrator + golden tests | M4, M0 |
| M6 | Reports (see `12_Report_Migration_Catalog.md` + `../00_Report_Migration_Guide_React_ASPNET.md`) | M5 |
| M7 | UAT parallel | M6 |
| M8 | Cutover | M7 |

## Overall program milestones (all three exams)
1. Shared platform (auth, session, masters, reporting)  
2. **Prabodh** (simplest)  
3. **Praveen**  
4. **Pandit** (most complex)  
5. Combined UAT & training  
6. Production cutover + Access read-only freeze  

## Dependencies
- Shared Centre/Region/Session/Exam/Paper  
- PDF Unicode Hindi capability proven in Prabodh  
- SUPER admin for all RESGEN_* flags  

## Effort guidance (relative)
Prabodh : Praveen : Pandit ≈ 1 : 1.2 : 2.5 for domain/result work.
