# Implementation Plan — Praveshika Modernization

| Document ID | DOC-11 |
| Version | 1.0 |
| Date | 2026-03-23 |

---

## 1. Prerequisites (before coding)

| # | Item | Owner |
|---|------|-------|
| 1 | Business review & sign-off of BRD (`01_BRD_Praveshika.md`) | Business |
| 2 | Close OQ-002, OQ-004, OQ-005, OQ-006 (critical path) | Business + BA |
| 3 | Confirm security approach OQ-003 | Security/IT |
| 4 | Provision SQL Server + environments | IT |
| 5 | Freeze Access schema snapshot for ETL | DBA |

**Do not generate the full application until BRD approval.**

---

## 2. Modules & dependencies

```
M0 Foundations (auth, SQL schema, CI)
   ↓
M1 Masters
   ↓
M2 Form Entry ──────────────┐
   ↓                        │
M3 Roll Assignment          │
   ↓                        │
M4 Marks Entry              │
   ↓                        │
M5 Result Engine ←──────────┘ (needs masters + marks)
   ↓
M6 Reports / PDF
   ↓
M7 Utilities + Supervisor tools
   ↓
M8 Data migration & UAT parity
   ↓
M9 Production cutover
```

| Module | Delivers | Depends on | FR coverage |
|--------|----------|------------|-------------|
| M0 | Solution skeleton, JWT auth, EF model, logging | — | FR-001–003 |
| M1 | Region/District/Centre/Session/Exam/Paper/Grade/Users | M0 | FR-004, FR-010–017 |
| M2 | Form CRUD, search, insert-between, lock banner | M1 | FR-020–029 |
| M3 | Roll assign / Aur / blank | M2 | FR-040–044 |
| M4 | Marks grid API + UI | M2 | FR-050–054 |
| M5 | ResultEngine, ranks, unlock, regen | M1, M4 | FR-060–072 |
| M6 | All Praveshika PDF reports | M5 (data ready) | FR-080–087 |
| M7 | Batch insert, centre export | M2 | FR-090–091 |
| M8 | ETL Access→SQL, checksums, UAT | M0–M7 | All Must BRs |
| M9 | Cutover, training, hypercare | M8 | — |

---

## 3. Milestones

| Milestone | Target outcome | Exit criteria |
|-----------|----------------|---------------|
| **MS0** Discovery complete | This document set reviewed | BRD signed; critical OQs closed |
| **MS1** Platform ready | API + React shell + SQL schema | Login works; masters CRUD |
| **MS2** Registration ready | Forms + rolls + marks | TC-FORM/ROLL/MARK Must pass |
| **MS3** Evaluation ready | Result engine + unlock | TC-RES-01 matrix 100% |
| **MS4** Publishing ready | All 8 report types PDF | TC-RPT Must pass |
| **MS5** Data ready | Historical sessions migrated | Count/checksum sign-off |
| **MS6** UAT complete | Parity vs Access sample | UAT gate in DOC-10 |
| **MS7** Go-live | Production cutover | Hypercare plan active |

*Calendar dates: assign after resource planning (not invented here).*

---

## 4. Suggested sprint slicing (example)

| Sprint | Focus |
|--------|-------|
| 1 | M0 + M1 + close OQs in config |
| 2 | M2 Form entry |
| 3 | M3 Rolls + M4 Marks |
| 4 | M5 ResultEngine + unit tests for BRL matrix |
| 5 | M6 Reports (attendance, name list, hall ticket) |
| 6 | M6 Reports (result, certificate, register, lost-two) |
| 7 | M7 + M8 ETL pilot session |
| 8 | Full migration + UAT fixes |
| 9 | Cutover rehearsal + go-live |

---

## 5. Risk register (delivery)

| Risk | Impact | Mitigation |
|------|--------|------------|
| OQ-002 unresolved | Wrong grades | Block M5 coding until decided |
| Hindi encoding issues | Data corruption | NVARCHAR + early UI tests |
| Large table volume | Slow grids | Pagination, indexes, server filter |
| Rank persistence bug ported | Wrong ranks | Explicit fix via OQ-005 |
| Report layout disputes | UAT delay | Agree “same data, new layout” |

---

## 6. Team skills needed

- React/TS/MUI  
- ASP.NET Core / C#  
- SQL Server DBA / ETL  
- BA for UAT with operations staff  
- Report/PDF developer  

---

## 7. Immediate next steps (after this review)

1. Review **BRD** + **Business Rules** with operations.  
2. Answer open questions (especially OQ-002/004/005/006).  
3. Approve or amend FR priorities.  
4. Authorize MS1 scaffolding (still no full app generation until approved).  

---

## 8. Document index

| File | Content |
|------|---------|
| `00_Source_Inventory_and_Overview.md` | Inventory & overview |
| `01_BRD_Praveshika.md` | Business requirements |
| `02_FRS_Praveshika.md` | Functional requirements |
| `03_Screen_Inventory.md` | Legacy screens |
| `04_Business_Rules_and_Workflows.md` | Rules & workflows |
| `05_Access_to_SQLServer_Data_Mapping.md` | Schema mapping |
| `06_React_Page_Component_Inventory.md` | UI inventory |
| `07_ASPNET_API_Specification.md` | API endpoints |
| `08_Target_Architecture.md` | Architecture |
| `09_Requirements_Traceability_Matrix.md` | RTM |
| `10_Test_Scenarios_and_Acceptance_Criteria.md` | Tests |
| `11_Implementation_Plan.md` | This plan |
