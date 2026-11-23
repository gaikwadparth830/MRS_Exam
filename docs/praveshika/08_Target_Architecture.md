# Target Architecture & Technical Design — Praveshika

| Document ID | DOC-08 |
| Version | 1.0 |
| Date | 2026-03-23 |

---

## 1. Goals

- Behavioural parity with legacy Praveshika workflows  
- Multi-user web access  
- SQL Server as system of record  
- Clear separation: UI · API · Domain · Data  
- Unicode (Hindi) first-class  

---

## 2. Logical architecture

```
┌─────────────────────────────┐
│  React + TS + MUI (SPA)     │
│  Auth · Forms · Marks · PDF │
└──────────────┬──────────────┘
               │ HTTPS / JSON
┌──────────────▼──────────────┐
│  ASP.NET Core Web API       │
│  Controllers · AuthZ        │
│  Application Services       │
│  ResultEngine (domain)      │
└──────────────┬──────────────┘
               │ EF Core / Dapper
┌──────────────▼──────────────┐
│  SQL Server                 │
│  FormPraveshika + Masters   │
└─────────────────────────────┘
               │
┌──────────────▼──────────────┐
│  Report engine (QuestPDF /  │
│  SSRS / similar) → PDF      │
└─────────────────────────────┘
```

---

## 3. Technology choices (proposed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React 18+ · TypeScript · MUI · React Router · React Query | Target stack |
| Backend | ASP.NET Core 8 Web API · C# | Target stack |
| ORM | EF Core (+ Dapper for heavy reports optional) | Productivity |
| Auth | JWT Bearer + role claims (`SUPER`, `OPERATOR`) | Maps legacy KEY |
| DB | SQL Server | Target |
| Reports | QuestPDF or similar server-side PDF | Replace VB Data Reports |
| Logging | Serilog | Ops |
| Migrations | EF migrations + one-off Access ETL scripts | |

*Alternatives acceptable if team standards differ — document deviation.*

---

## 4. Bounded modules

| Module | Responsibility |
|--------|----------------|
| Identity | Users, login, roles |
| Masters | Region, District, Centre, Session, Exam, Paper, Grade |
| Registration | Form entry, search, batch, insert-between |
| Seating | Roll assign / blank / Aur |
| Scoring | Marks entry |
| Evaluation | Result engine, ranks, unlock, regen |
| Publishing | All Praveshika reports |
| Migration | Access ETL |

---

## 5. Domain: ResultEngine

Pure C# service (unit-testable) implementing BRL-040–046:

Inputs: Marks1, Marks2, TotMarks, PaperMin1/2, Exam thresholds.  
Outputs: Result, Grade, optional TotMarks null.

Ranks as separate operations after generation.

**ExamNo resolution:** configuration flag pending OQ-002 (`UseLegacyExamNo4` vs `ExamNo=3`).

---

## 6. Security design

| Topic | Design |
|-------|--------|
| Passwords | ASP.NET Identity / PBKDF2 or Argon2 (OQ-003) |
| Roles | SUPER → unlock + user admin; OPERATOR → day-to-day |
| Lock | Session.ResgenPraveshika enforced in API |
| Audit | Log generate-result, unlock, roll-assign commits |
| Transport | HTTPS only |

---

## 7. Data & concurrency

- Optimistic concurrency token on FormPraveshika for marks/forms (enhancement).  
- Roll assignment uses serializable/transaction scope.  
- Indexes per DOC-05.  
- Archive strategy for old sessions (future).

---

## 8. Reporting design

- API builds dataset (same SQL semantics as DataEnvironment commands).  
- PDF templates mirror legacy field sets (not pixel-perfect required unless mandated).  
- Filters: session, region, centre, roll range, includeName.

---

## 9. Migration architecture

```
Access MDB → ETL (SSIS/Python/C#) → Staging → Validate → dbo.*
```

Cutover: freeze Access writes → final sync → switch DNS/users to web.

---

## 10. Deployment (proposed)

| Env | Purpose |
|-----|---------|
| Dev | Local SQL + API + Vite |
| Test | Migrated sample sessions |
| UAT | Business parity tests |
| Prod | HA SQL + API + static SPA (IIS/nginx) |

---

## 11. Explicit non-goals (phase 1)

- Full multi-exam product in one release  
- Pixel-perfect VB report clones  
- Inventing new grading schemes  

---

## 12. Open design decisions

| Decision | Depends on |
|----------|------------|
| ExamNo 3 vs 4 in engine | OQ-002 |
| When to set Resgen=Y | OQ-004 |
| Persist FIRST/SECOND | OQ-005 |
| SrNo strategy | OQ-006 |
| Password migration | OQ-003 |
