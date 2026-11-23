# Functional Requirements Specification (FRS) — Praveshika

| Field | Value |
|-------|-------|
| Document ID | FRS-PRAVESHIKA-001 |
| Version | 1.0 Draft |
| Date | 2026-03-23 |
| Maps to | BRD `01_BRD_Praveshika.md` |

---

## 1. AUTH

| ID | Functional requirement | BR | UI | API |
|----|------------------------|----|----|-----|
| FR-001 | Login with userid/password; reject invalid credentials | BR-001 | `/login` | `POST /api/auth/login` |
| FR-002 | Persist authenticated session (JWT/cookie) | BR-001 | App shell | Auth middleware |
| FR-003 | Hide/deny Supervisor routes for non-SUPER users | BR-002 | Nav guard | `[Authorize(Roles=SUPER)]` |
| FR-004 | CRUD users (userid, password, key/role) | BR-092 | Users page | `/api/users` |

---

## 2. MASTER

| ID | Functional requirement | BR |
|----|------------------------|----|
| FR-010 | CRUD Regions including seat region order | BR-011 |
| FR-011 | CRUD Districts with region FK and seat district no | BR-012 |
| FR-012 | CRUD Centres with district, address, city, close/pandit flags | BR-013 |
| FR-013 | CRUD Sessions; set/clear default (`DEFA`); manage `ResgenPraveshika` | BR-010, BR-017 |
| FR-014 | Maintain Exam record for Praveshika (`ExamNo=3`) thresholds | BR-014 |
| FR-015 | Maintain Paper 1 & 2 for Praveshika (`MinMarks`, etc.) | BR-015 |
| FR-016 | Maintain Grade lookup | BR-016 |
| FR-017 | List centres excluding closed when selecting Form Centre | BR-025 |

---

## 3. FORM ENTRY

| ID | Functional requirement | BR | Notes |
|----|------------------------|----|-------|
| FR-020 | List/paginate forms for selected session | BR-020 | Filter region/centre optional |
| FR-021 | Create form: Name, Gender, FormCentre, ExamCentre; Session=default; Region derived; UserId=current | BR-020–027 | Roll null |
| FR-022 | Update editable fields when result not locked | BR-022, BR-028 |
| FR-023 | Delete form by SrNo+Session when not locked | BR-022 |
| FR-024 | Insert-between: create SrNo = PrevSrNo+1 | BR-023 |
| FR-025 | Validate centres & gender M/F | BR-024–026 |
| FR-026 | Search by name (prefix) within session | BR-031 |
| FR-027 | Show forms-count for form centre | BR-029 |
| FR-028 | Block mutations when session `ResgenPraveshika=Y` | BR-028 |
| FR-029 | SrNo generation: document legacy `max(srno)+3` vs insert-between; implement per OQ-006 | BR-023 | Open |

---

## 4. ROLL ASSIGNMENT

| ID | Functional requirement | BR |
|----|------------------------|----|
| FR-040 | Assign rolls for null-roll forms in centre range; order FormCentre, SrNo | BR-040 |
| FR-041 | Preview first/last candidate names per centre; commit or rollback | BR-041 |
| FR-042 | Aur path: assign null rolls for one form centre | BR-042 |
| FR-043 | Blank rolls from min roll at centre within region | BR-043 |
| FR-044 | Warn if rolls already exist for region/session | BR-040 |

---

## 5. MARKS

| ID | Functional requirement | BR |
|----|------------------------|----|
| FR-050 | Grid edit Marks1/Marks2 for Result IS NULL | BR-050 |
| FR-051 | Filter Session + Region + RollFrom | BR-051 |
| FR-052 | Validate 0–100 or `A`; recompute TotMarks | BR-052, BR-053 |
| FR-053 | Autosave cell/row | BR-055 |
| FR-054 | Read-only when ResgenPraveshika=Y | BR-054 |

---

## 6. RESULT ENGINE

| ID | Functional requirement | BR |
|----|------------------------|----|
| FR-060 | Generate results for Region + Session for eligible rows | BR-060 |
| FR-061 | Rules: both A → Fail/A; any A → Fail/X; tot &lt; MinTotal → Fail/X; empty mark → -/-; below paper min → Fail/X; else Pass + grade Vi.Yo./1/2/3 | BR-061 |
| FR-062 | Region first rank on first run | BR-062 |
| FR-063 | Statewide FIRST/SECOND ranks | BR-063 |
| FR-064 | Store ResgenRun | BR-064 |
| FR-065 | Precondition: exam + paper masters present | BR-065 |
| FR-066 | After successful generation, set ResgenPraveshika per OQ-004 | BR-028 | Open |

**Grade thresholds (data-driven from Exam master — sample values for ExamNo=3):**  
Dist ≥150 → `Vi. Yo.` · ≥120 → `1` · ≥100 → `2` · else → `3` (when Pass).

---

## 7. REGEN / SUPERVISOR

| ID | Functional requirement | BR |
|----|------------------------|----|
| FR-070 | Reset ResgenPraveshika to N | BR-070 |
| FR-071 | Clear result fields for a roll; allow remarks | BR-071 |
| FR-072 | If special rank present, clear region ranks | BR-072 |

---

## 8. REPORTS

| ID | Functional requirement | BR | Output |
|----|------------------------|----|--------|
| FR-080 | Attendance sheet | BR-080 | PDF |
| FR-081 | Name list | BR-081 | PDF |
| FR-082 | Hall ticket | BR-082 | PDF |
| FR-083 | Result sheet (named) | BR-083 | PDF |
| FR-084 | Result sheet (no name) | BR-083 | PDF |
| FR-085 | Certificate | BR-084 | PDF |
| FR-086 | Result register | BR-085 | PDF |
| FR-087 | Losing two marks | BR-086 | PDF/grid |

Filters must match legacy (session, region, centre, roll range as applicable).

---

## 9. UTILITIES

| ID | Functional requirement | BR |
|----|------------------------|----|
| FR-090 | Batch insert forms | BR-090 |
| FR-091 | Export centres used by Praveshika | BR-091 |

---

## 10. Cross-cutting

| ID | Requirement |
|----|-------------|
| FR-100 | All text fields supporting Hindi use Unicode |
| FR-101 | Soft-delete not in legacy — hard delete for forms unless business changes |
| FR-102 | Concurrent edit: optimistic concurrency on form/marks rows recommended (enhancement; label as change) |
