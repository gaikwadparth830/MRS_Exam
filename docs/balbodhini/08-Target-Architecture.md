# Target Architecture and Technical Design — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | ARCH-BAL-001 |
| Status | Draft |
| Constraint | Behavior follows the signed-off FRS. This document does not add examination rules. |

## 1. System shape

```text
Browser
  React + TypeScript + Material UI
        |
        | HTTPS JSON and PDF
        v
ASP.NET Core Web API
  Auth, candidate, marks, result, reports
        |
        | parameterized SQL
        v
SQL Server
  exam, balbodhini, security schemas
```

One Balbodhini deployment. Other exams stay in the legacy program until a separate project is approved.

The desktop application’s Access file, ODBC driver, Data Environment, and ActiveX grids are not part of the new runtime.

## 2. Projects

| Project | Contents |
| --- | --- |
| `Balbodhini.Web` | React application |
| `Balbodhini.Api` | HTTP endpoints and authorization |
| `Balbodhini.Application` | Use cases and rule services |
| `Balbodhini.Domain` | Candidate, result, and roll-number rules that do not touch the database |
| `Balbodhini.Infrastructure` | EF Core or ADO.NET, PDF, password hasher |
| `Balbodhini.Database` | SQL project: tables, indexes, the four procedures in the API specification |

## 3. Request path

1. The React route renders a page from `06-React-Page-and-Component-Inventory.md`.
2. The page calls one endpoint from `07-ASPNET-Core-API-Specification.md`.
3. The API policy checks the token, supervisor flag, and session lock.
4. The application service runs the RULE entries cited by that endpoint.
5. SQL Server commits the transaction or rolls it back.
6. Reports return a PDF built from the same query the screen would show.

## 4. Authentication design

Legacy passwords are a substitution cipher stored in `users.PASSWORD`, with a key character in `users.KEY`. The algorithm is in `frmLogin.frm`. It is reversible and is not suitable for a web API.

Proposed approach, pending Q-012:

1. Import users with a `must_set_password` flag.
2. Do not copy the cipher text into SQL Server as the live password.
3. SUPER sets a new password on first web login, or each user sets one through a supervised reset.
4. Store a modern password hash.
5. Keep `IsSupervisor` true only for the imported SUPER user.

## 5. Session and locking

`exam.Session.IsDefault` replaces `defa = 'Y'`. At most one row is default.

`ResultGenerated` replaces `resgen_balbodhini`. The API rejects candidate and marks writes when it is true. Reset is a supervisor command.

Opening a backup session sets the token’s session mode to read-only and does not open a second database file. Report routes that the legacy backup login did not hide need a business decision (FR-007). Until that decision, backup mode allows read-only reports and blocks writes.

## 6. Result transaction

`GenerateResult` does the following in one database transaction:

1. Confirm the Balbodhini exam row and paper 1 exist. If not, return 400 and write nothing. This avoids DEF-09.
2. Select eligible candidates.
3. Compute grade and result in the domain service using RULE-063 to RULE-067.
4. Update those rows, then apply region rank RULE-069.
5. Commit.

Thresholds are read from the database at run time. They are not constants in C#.

The region id is a request integer. The API does not parse the first character of a label (DEF-03). The React region control submits `regionNo`.

Run number: store the value described by RULE-062 until Q-006 says to start at 1. The procedure should be easy to switch, and the chosen formula should be covered by TC-060.

## 7. Roll-number transaction

Preview and commit are separate calls so the browser can show the last name before commit. Commit re-reads the rows and re-checks the count inside the transaction. If another user has added a form since preview, commit fails rather than numbering the wrong person.

Aur and clear use the same preview-then-confirm pattern.

## 8. Reporting

PDF generation runs on the server. The React app only displays or downloads it.

Report headings that are currently drawn in `DV-TTAakash` must be supplied as Unicode strings by the business (Q-011) and stored in a report-label table or resource file. They must not be guessed from the garbled designer captions.

Dummy centre codes remain a stored column because the register command groups by them. Rebuild runs at the start of register print, as the legacy program does.

Attendance data is computed for one centre and is not written to a global temp table.

## 9. Data access rules

- Parameters for every value that comes from the user.
- No dynamic table name. The candidate table is fixed.
- Transactions for roll assignment, result generation, mark correction of a ranked region, and register dummy-code rebuild.
- Optimistic concurrency with a `rowversion` column on `Candidate`. The legacy program has no concurrency token. This is a technical protection for BR-091 and does not change the business result.

## 10. Migration program

A one-off console project:

1. Read a repaired Access file through the Jet or ACE provider.
2. Load masters, then `form_balbodhini`.
3. Write a reconciliation report: row counts, min and max serial, null roll counts, grade counts.
4. Stop if a Balbodhini row points at a missing centre, region, or session.

Unicode conversion of names is a separate step with a before-and-after sample approved by the office.

## 11. Environments

| Environment | Database | Notes |
| --- | --- | --- |
| Development | SQL Server local | Synthetic data plus a small anonymized extract |
| Test | SQL Server | Copy of one historical session after business approval |
| Production | SQL Server | Access file kept read-only until parallel run ends |

Secrets: SQL connection string and JWT signing key. Not the Access password.

## 12. What this architecture will not do

- It will not host the other examinations.
- It will not print from the VB6 Data Report runtime.
- It will not keep the Access file as the live store.
- It will not set the result lock to `Y` automatically until Q-001 is answered. The column and the reset command exist so the rule can be turned on without a redesign.
