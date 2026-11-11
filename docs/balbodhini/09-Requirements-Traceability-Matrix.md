# Requirements Traceability Matrix — Balbodhini

| Item | Value |
| --- | --- |
| Document ID | RTM-BAL-001 |
| Status | Draft |
| Direction | Legacy behavior to new implementation |

Pages are in `06-React-Page-and-Component-Inventory.md`. Endpoints are in `07-ASPNET-Core-API-Specification.md`. Tests are in `10-Test-Scenarios-and-Acceptance-Criteria.md`.

| Legacy feature | BR | FR | Page | API | Data | Test |
| --- | --- | --- | --- | --- | --- | --- |
| Login | BR-001 | FR-001 | PG-001 | POST `/auth/login` | `security.AppUser` | TC-001 |
| SUPER menu | BR-002 | FR-002 | Shell supervisor routes | Supervisor policy | `IsSupervisor` | TC-002 |
| Default session | BR-003 | FR-003, FR-004 | `SessionBanner` | GET `/sessions/current` | `exam.Session` | TC-003 |
| Session master rules | BR-004 | FR-005 | PG-002 | POST/PUT `/sessions` | `Session`, `SessionMonthRule` | TC-004 |
| Select default session | BR-003 | FR-006 | PG-002 | PUT `/sessions/current` | `IsDefault` | TC-005 |
| Backup session hides entry | BR-005 | FR-007 | PG-001 read-only mode | POST `/sessions/{id}/open-backup` | `IsBackup` | TC-006 |
| Region master | BR-010 | FR-010, FR-011 | PG-003 | `/regions` | `exam.Region` | TC-010 |
| District master | BR-011 | FR-012 | PG-004 | `/districts` | `exam.District` | TC-011 |
| Centre master and closed flag | BR-012 | FR-013 | PG-005 | `/centres` | `exam.Centre` | TC-012 |
| Exam and paper thresholds | BR-013 | FR-014 to FR-016 | PG-006, PG-007 | `/exam/balbodhini` | `Exam`, `Paper` | TC-013 |
| English region name | BR-014 | FR-011 | PG-003 | PUT `/regions/{id}` | `RegionNameEng` | TC-014 |
| Candidate navigation and save | BR-020, BR-021 | FR-020 to FR-024, FR-028 | PG-010 | GET/POST/PUT `/candidates` | `balbodhini.Candidate` | TC-020 |
| Roll number not typed | BR-022 | FR-027 | PG-010 read-only roll | PUT ignores roll | `RollNo` | TC-021 |
| Form centre, region, exam centre copy | BR-023, BR-024 | FR-029 to FR-031 | PG-010 `CentreLookup` | GET `/centres/{id}` | Centre, District, Region | TC-022 |
| Form count | BR-025 | FR-032 | `CentreFormCount` | GET `/candidates/count` | count query | TC-023 |
| Insert between names | BR-026 | FR-026 | PG-011 | POST `/candidates/insert-between` | `SrNo` | TC-024 |
| Serial step of 3 | BR-026 | FR-025 | PG-010 | POST `/candidates` | `SrNo` | TC-025 |
| Batch placeholder names | BR-027 | FR-036 | PG-013 | POST `/candidates/batch` | `Candidate` | TC-026 |
| Lock when flag is Y | BR-028 | FR-035, FR-055 | Disabled buttons | 409 on writes | `ResultGenerated` | TC-027 |
| Delete | BR-029 | FR-033 | PG-010 | DELETE `/candidates/{srno}` | `Candidate` | TC-028 |
| Search name or roll | BR-020 | FR-034 | PG-012 | GET `/candidates/search` | `Candidate` | TC-029 |
| Set roll numbers and Bitti confirm | BR-030 to BR-033 | FR-040 to FR-044 | PG-040 | `/roll-numbers/preview`, `/commit`, `/next-centre` | `RollNo` | TC-040 |
| Aur null roll numbers | BR-034 | FR-045 | PG-041 | `/roll-numbers/aur/*` | `RollNo` null | TC-041 |
| Clear roll numbers | BR-035 | FR-046 | PG-042 | POST `/roll-numbers/clear` | `RollNo` | TC-042 |
| Marks grid and filters | BR-040, BR-041 | FR-050, FR-051 | PG-020 | GET `/marks` | `Marks1`, `TotalMarks` | TC-050 |
| Mark validation | BR-042 | FR-052 | `MarksGrid` | PUT `/marks/{srno}` | `Marks1` | TC-051 |
| Grace prompt | BR-043 | FR-053 | `GraceDialog` | PUT body `acceptGrace` | `Exam` thresholds | TC-052 |
| Total equals Paper 1 | BR-041 | FR-054 | Read-only total | Server calculates | `TotalMarks` | TC-053 |
| Generate result | BR-050 to BR-054, BR-058 | FR-060 to FR-063 | PG-030 | POST `/results/generate` | `GenerateResult` | TC-060 |
| Region first rank | BR-055 | FR-063 | Result grid | same procedure | `SpecialRank` | TC-061 |
| Overall first and second | BR-056 | FR-065 | Find Ranks button | POST `/results/ranks` | `SpecialRank` | TC-062 |
| Read-only result grid | BR-057 | FR-064 | PG-030 | GET `/results` | `Candidate` | TC-063 |
| Reset lock | BR-060 | FR-070 | PG-032 | POST `/results/lock/reset` | `ResultGenerated` | TC-070 |
| Correct marks after result | BR-061, BR-062 | FR-071 to FR-074 | PG-031 | `/results/correction` | result columns cleared | TC-071 |
| Attendance | BR-070 | FR-080 | PG-050 | GET `/reports/attendance` | computed pairs | TC-080 |
| Name list | BR-071 | FR-081 | PG-051 | GET `/reports/name-list` | report query | TC-081 |
| Result sheet named and no name | BR-072 | FR-082 | PG-052 | GET `/reports/result-sheet` | report query | TC-082 |
| Certificate and roll range | BR-073 | FR-083 | PG-053 | GET `/reports/certificates` | report query | TC-083 |
| Register counts and dummy centres | BR-074 | FR-084, FR-085 | PG-054 | POST `/reports/register` | `DummyCentreCode` | TC-084 |
| Region-wise register | BR-075 | FR-086 | PG-055 | POST `/reports/register/region` | same | TC-085 |
| Centre roll ranges | BR-076 | FR-087 | PG-056 | GET `/reports/centre-ranges` | computed | TC-086 |
| User form count | BR-077 | FR-088 | PG-057 | GET `/reports/form-counts` | count query | TC-087 |
| Centre label file | BR-078 | FR-089 | PG-058 | GET `/reports/centre-labels` | `Centre` | TC-088 |

## Known gaps with no target feature

| Item | Decision |
| --- | --- |
| `cmd_print` duplicate-rank button | No page and no endpoint. FR-066. |
| Hall ticket and mark sheet | No row. FR-101. |
| Losing-grade query menu | No row. FR-102. Covered only by the grace prompt. |
| `Frm_setdist` | No row unless Q-010 approves it. |
| Other exams | No row. FR-100. |
| Setting the lock flag to `Y` | No endpoint until Q-001. Column and reset exist. |
| DEF-09 pre-clear before master check | API rolls back. Recorded as an approved technical correction in ARCH-BAL-001 section 6, not a business-rule change. If the business wants the legacy partial clear preserved, remove the rollback. |

## Authorization trace

| Action | Legacy control | New control |
| --- | --- | --- |
| Any work | Valid password | Authenticated policy |
| User master, batch, reset, mark correction | Menu visible only for SUPER | Supervisor policy |
| Edit forms or marks after lock | Buttons and grid disabled | API 409 and disabled controls |
| Backup database | Menus hidden, other file opened | Read-only token mode |
