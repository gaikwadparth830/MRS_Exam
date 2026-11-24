# Proposed ASP.NET Core API Specification — Prabodh

Document ID: API-PRABODH-001 | Base path: `/api/v1`

## Auth

All endpoints require Bearer JWT except login. SUPER role for admin flags.

## Prabodh Forms

| Method | Endpoint | Description | FR |
|--------|----------|-------------|-----|
| GET | `/prabodh/forms?sessionId=&centre=&page=` | List/navigate | FR-PRB-010 |
| GET | `/prabodh/forms/{sessionId}/{srNo}` | Get one | FR-PRB-010 |
| POST | `/prabodh/forms` | Create | FR-PRB-011 |
| PUT | `/prabodh/forms/{sessionId}/{srNo}` | Update | FR-PRB-012 |
| DELETE | `/prabodh/forms/{sessionId}/{srNo}` | Delete | FR-PRB-013 |
| GET | `/prabodh/forms/search?q=` | Search | FR-PRB-014 |
| POST | `/prabodh/forms/insert-between` | Insert between | FR-PRB-015 |
| GET | `/prabodh/forms/centre-count?centre=&sessionId=` | Count | FR-PRB-020 |

### Create body (example)

```json
{
  "name": "string",
  "formCentre": "string",
  "examCentre": "string",
  "gender": "M",
  "rollNo": null,
  "regionNo": 4
}
```

Validations: mirror RULE-PRB-02..05; reject if `resgen_prabodh=Y`.

## Marks

| Method | Endpoint | Description | FR |
|--------|----------|-------------|-----|
| GET | `/prabodh/marks?sessionId=&regionNo=&rollFrom=` | Grid data | FR-PRB-040 |
| PUT | `/prabodh/marks/{sessionId}/{srNo}` | Update marks | FR-PRB-041 |
| PUT | `/prabodh/marks/batch` | Optional batch save | FR-PRB-041 |

Body marks: `{ "marks1":"45","marks2":"A","marks3":"50","oralMarks":"40" }`  
Server computes `totMarks` = sum of numeric papers (A→0 for sum, same as Val()).

## Result

| Method | Endpoint | Description | FR |
|--------|----------|-------------|-----|
| POST | `/prabodh/results/generate` | `{ sessionId, regionNo }` | FR-PRB-050..052 |
| POST | `/prabodh/results/assign-ranks` | `{ sessionId }` | FR-PRB-053 |
| GET | `/prabodh/results?sessionId=&regionNo=` | Preview | FR-PRB-054 |
| GET | `/prabodh/results/duplicate-ranks?sessionId=` | Dup rank helper | FR-PRB-054 |

Generate response: counts processed/pass/fail/absent-like + run number.

## Roll numbers

| Method | Endpoint | FR |
|--------|----------|-----|
| POST | `/prabodh/roll-numbers/assign` | FR-PRB-030 |
| POST | `/prabodh/roll-numbers/assign-aur` | FR-PRB-031 |

## Reports

| Method | Endpoint | FR |
|--------|----------|-----|
| POST | `/prabodh/reports/attendance` | FR-PRB-060 |
| POST | `/prabodh/reports/result-sheet` | FR-PRB-061 |
| POST | `/prabodh/reports/mark-sheet` | FR-PRB-062 |
| POST | `/prabodh/reports/certificate` | FR-PRB-063 |
| POST | `/prabodh/reports/hall-ticket` | FR-PRB-064 |
| POST | `/prabodh/reports/name-list` | FR-PRB-065 |
| POST | `/prabodh/reports/register` | FR-PRB-066 |
| POST | `/prabodh/reports/lost-two-marks` | FR-PRB-067 |

Each returns `application/pdf` or job id for async generation.

## Admin

| Method | Endpoint | Role | FR |
|--------|----------|------|-----|
| PUT | `/admin/sessions/{id}/resgen-prabodh` | SUPER | FR-PRB-055 |

## Services (C#)

- `IPrabodhFormService`
- `IPrabodhMarksService`
- `IPrabodhResultService` (port exact RULE-PRB-12..19)
- `IPrabodhReportService`
- `ICentreLookupService` (shared)

## Error model

```json
{ "code": "CENTRE_CLOSED", "message": "This centre has been closed..." }
```
