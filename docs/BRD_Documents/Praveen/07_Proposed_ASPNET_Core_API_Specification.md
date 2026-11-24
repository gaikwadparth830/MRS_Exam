# Proposed ASP.NET Core API Specification — Praveen

Document ID: API-PRAVEEN-001 | Base `/api/v1`

## Forms
| Method | Endpoint | FR |
|--------|----------|-----|
| GET | /praveen/forms | FR-PRV-010 |
| GET | /praveen/forms/{sessionId}/{regionNo}/{rollNo} | |
| POST | /praveen/forms | FR-PRV-011 |
| PUT | /praveen/forms/{sessionId}/{regionNo}/{rollNo} | FR-PRV-012 |
| DELETE | /praveen/forms/{sessionId}/{regionNo}/{rollNo} | FR-PRV-012 |
| GET | /praveen/forms/search | FR-PRV-013 |

## Marks
| Method | Endpoint |
|--------|----------|
| GET | /praveen/marks?sessionId&regionNo&rollFrom |
| PUT | /praveen/marks/{sessionId}/{regionNo}/{rollNo} |

Body includes marks1–5, oralMarks, regLang; server sets totMarks=sum(papers).

## Results
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | /praveen/results/generate | Rejects if ResgenPraveen=Y; sets flag after |
| POST | /praveen/results/assign-ranks | FIRST |
| GET | /praveen/results | Preview |

## Reports
POST /praveen/reports/{attendance|result-sheet|mark-sheet|certificate|name-list|register|lost-two-marks|ranks}

## Admin
PUT /admin/sessions/{id}/resgen-praveen (SUPER)

## Services
IPraveenFormService, IPraveenMarksService, IPraveenResultService (port oral+reg_lang rule exactly)
