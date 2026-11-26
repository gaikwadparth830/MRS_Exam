# Implementation Plan — Prabodh Module

Document ID: PLAN-PRABODH-001

## Milestones

| Milestone | Deliverables | Depends on | Est. |
|-----------|--------------|------------|------|
| M0 | BRD/FRS sign-off; open questions answered | Business review | Week 0 |
| M1 | SQL Server schema + data migration FORM_PRABODH + masters | M0 | Week 1–2 |
| M2 | Auth, session, shared centre lookup APIs | M1 | Week 2–3 |
| M3 | Form entry API + React page | M2 | Week 3–5 |
| M4 | Marks API + React grid | M3 | Week 5–6 |
| M5 | Result engine + ranks + unit tests | M4 | Week 6–8 |
| M6 | Roll number tools | M3 | Week 7–8 |
| M7 | Reports (see `12_Report_Migration_Catalog.md` + parent `00_Report_Migration_Guide_React_ASPNET.md`) | M5 | Week 8–11 |
| M8 | UAT + parallel run vs Access | M7 | Week 11–13 |
| M9 | Cutover | M8 | Week 14 |

## Module dependency order

1. Shared masters & session  
2. Form entry  
3. Roll numbers  
4. Marks  
5. Result generation  
6. Reports  
7. Supervisor regen  

## Risks

| Risk | Mitigation |
|------|------------|
| SrNo +3 semantics | Confirm in M0; keep legacy allocator initially |
| RESGEN flag set location unclear | Trace all writers before lock UX |
| Hindi fonts in PDF | Early spike on report Unicode |
| Rule drift | Golden-file tests from Access extract |

## Parallel with other exams

Prabodh is the **simplest** of the three (no UND, no Khand). Recommended build **first**, then Praveen, then Pandit.
