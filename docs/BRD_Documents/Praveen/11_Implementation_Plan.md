# Implementation Plan — Praveen

Document ID: PLAN-PRAVEEN-001

## Order
Build after Prabodh shared foundation (auth, session, masters, report pipeline).

| Milestone | Work |
|-----------|------|
| M1 | Schema+migrate FORM_PRAVEEN |
| M2 | Form API+UI |
| M3 | Marks API+UI (incl reg_lang column) |
| M4 | Result engine + flag + tests |
| M5 | Reports |
| M6 | UAT parallel run |
| M7 | Cutover |

## Dependencies
Shared modules from Prabodh M1–M2; Result patterns reused with Praveen-specific RULE-PRV-*.

## Risks
oral+reg_lang combined rule easy to mis-port; UND columns confusion; session-wide generate volume.
