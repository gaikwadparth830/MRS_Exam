# Target Architecture & Technical Design — Pandit

Document ID: ARCH-PANDIT-001

## Approach
Pandit is a separate bounded context with the richest domain logic. Reuse shared masters/auth/reporting from Prabodh/Praveen foundations.

## Result orchestration
```
PanditResultOrchestrator
  ├─ Khand1NewProcessor
  ├─ Khand2NewProcessor
  ├─ BothKhandProcessor
  ├─ Khand1OldProcessor (≥20162 & flgportion O)
  └─ Khand2OldProcessor
```
Each processor returns ResultDecision { Result, Grade, Khand1Tot, Khand2Tot }.  
Golden tests from Access snapshots gate every processor.

## Data
1:1 FormPandit table Phase 1. Optional later split of PaperAttempts collection.

## Risks
- Rule divergence from VB spaghetti (Gotos, hardcoded thresholds)
- Portion dual-path maintenance
- Report variant sprawl

## Mitigations
- Characterization tests before refactor
- Feature flag for OLD portion if business retires it
- Single mark-sheet template with parameters instead of 4 near-duplicate reports long-term (*approved change*)
