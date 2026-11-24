# Proposed ASP.NET Core API Specification — Pandit

Document ID: API-PANDIT-001 | Base `/api/v1`

## Forms
| Method | Endpoint | FR |
|--------|----------|-----|
| GET | /pandit/forms | FR-PND-001 |
| GET | /pandit/forms/{sessionId}/{rollNo} | |
| POST | /pandit/forms | FR-PND-001..008 |
| PUT | /pandit/forms/{sessionId}/{rollNo} | |
| DELETE | /pandit/forms/{sessionId}/{rollNo} | |
| POST | /pandit/forms/{sessionId}/{rollNo}/check-concession | FR-PND-008 |

## Marks
| Method | Endpoint |
|--------|----------|
| GET | /pandit/marks?sessionId&portion=N|O&rollFrom= |
| PUT | /pandit/marks/{sessionId}/{rollNo} |

## Cross reference
| Method | Endpoint |
|--------|----------|
| POST | /pandit/cross-reference/run | FR-PND-030 |
| GET | /pandit/cross-reference/status | |

## Results
| Method | Endpoint |
|--------|----------|
| POST | /pandit/results/generate | `{ sessionId }` runs all applicable branches |
| GET | /pandit/results?sessionId&khand= | |
| GET | /pandit/results/summary | counts by result string |

## Reports
POST /pandit/reports/{attendance|result|result-details|mark-sheet|name-list|register|ranks|students-passing|lost-two-marks}  
mark-sheet body includes `variant`: new | onlynew | 20162

## Admin
PUT /admin/sessions/{id}/resgen-pandit

## Domain services
IPanditFormService, IPanditConcessionService, IPanditMarksService, IPanditCrossRefService, IPanditResultOrchestrator + strategy classes
