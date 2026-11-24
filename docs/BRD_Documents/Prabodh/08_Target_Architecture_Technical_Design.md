# Target Architecture & Technical Design — Prabodh Module

Document ID: ARCH-PRABODH-001

## 1. Architecture overview

```
[React+MUI SPA] --HTTPS/JSON--> [ASP.NET Core Web API]
                                      |
                              [Prabodh Application Services]
                                      |
                         [EF Core / Dapper + SQL Server]
                                      |
                         [Report engine: QuestPDF/RDLC/SSRS]
```

## 2. Bounded context

**Prabodh Exam Context** owns FormPrabodh, marks, result generation for exam_no=5.  
Depends on shared **Masters** and **Identity** contexts.

## 3. Key design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data shape Phase 1 | 1:1 with FORM_PRABODH | Fidelity & faster cutover |
| Result engine | Server-side C# service porting VB rules | Single source of truth; testable |
| Marks storage | Keep string marks ('A' supported) | Preserve absent semantics |
| Reports | API-generated PDF | Replace VB DataReports |
| Auth | JWT + role SUPER | Maps login model |
| Concurrency | Rowversion on FormPrabodh | Multi-user safety |

## 4. Result engine port notes

Port `Frm_GenResultPrabodh.cmd_gen_result_Click` order exactly:

1. Require region  
2. Compute next Resgen_run  
3. Select eligible rows  
4. Apply absent / min total / minima / grade rules  
5. Update rows  
6. Clear special_rank; assign FIRST  

Unit-test each RULE-PRB-* with fixtures.

## 5. Integration points

- Shared Centre/Region lookup  
- Session activation gate on all Prabodh commands  
- Supervisor flag reset  

## 6. Security

- Parameterized SQL only (eliminate VB string concat injection patterns)  
- Password hashing upgrade (*approved change* vs legacy encryption table)  
- Audit log for result generate and flag reset  

## 7. Performance

- Marks grid: server-side filter by region + rollFrom, paging  
- Generate result: set-based SQL where possible, or batched reader/writer in transaction  
- ~80k rows: indexes on `(SESSION_NO, REGION_NO, ROLL_NO)`, `(SESSION_NO, SRNO)`
