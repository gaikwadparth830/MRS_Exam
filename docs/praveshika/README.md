# Praveshika Modernization — Documentation Pack

Draft analysis of the legacy **MrsExam** VB6/Access application, scoped to the **Praveshika** exam only. Target: React + TypeScript + MUI · ASP.NET Core · SQL Server.

**Status:** Ready for BRD review. Legacy source was not modified.

## Start here

1. [00 — Source Inventory & Overview](./00_Source_Inventory_and_Overview.md)  
2. [01 — Business Requirements Document (BRD)](./01_BRD_Praveshika.md) ← **primary review document**  
3. [04 — Business Rules & Workflows](./04_Business_Rules_and_Workflows.md)  

## Full set

| # | Document |
|---|----------|
| 02 | [FRS](./02_FRS_Praveshika.md) |
| 03 | [Screen Inventory](./03_Screen_Inventory.md) |
| 05 | [Access → SQL Server Mapping](./05_Access_to_SQLServer_Data_Mapping.md) |
| 06 | [React Page/Component Inventory](./06_React_Page_Component_Inventory.md) |
| 07 | [ASP.NET Core API Spec](./07_ASPNET_API_Specification.md) |
| 08 | [Target Architecture](./08_Target_Architecture.md) |
| 09 | [Requirements Traceability Matrix](./09_Requirements_Traceability_Matrix.md) |
| 10 | [Test Scenarios & Acceptance Criteria](./10_Test_Scenarios_and_Acceptance_Criteria.md) |
| 11 | [Implementation Plan](./11_Implementation_Plan.md) |

## Critical open questions (block result-engine build)

- **OQ-002:** Gen-result uses `exam_no=4` while Praveshika master is `exam_no=3`  
- **OQ-004:** No code sets `RESGEN_PRAVESHIKA='Y'`  
- **OQ-005:** Statewide ranks may not persist (missing `.Update`)  
- **OQ-006:** SrNo `max+3` vs insert-between `+1`
