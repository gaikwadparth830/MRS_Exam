# Proposed React Page & Component Inventory — Pandit

Document ID: UI-PANDIT-001

| Page ID | Route | Legacy |
|---------|-------|--------|
| PG-PND-01 | /pandit/forms | Frm_FormPandit |
| PG-PND-02 | /pandit/forms/:roll | Form detail editor |
| PG-PND-03 | /pandit/marks | Frm_PanditMarks |
| PG-PND-04 | /pandit/cross-reference | Frm_Pandit_CrossRef |
| PG-PND-05 | /pandit/results/generate | Frm_GenResultPandit |
| PG-PND-06 | /pandit/reports/attendance | |
| PG-PND-07 | /pandit/reports/result | |
| PG-PND-08 | /pandit/reports/mark-sheet | |
| PG-PND-09 | /pandit/reports/name-list | |
| PG-PND-10 | /pandit/reports/register | |
| PG-PND-11 | /pandit/reports/ranks | |
| PG-PND-12 | /pandit/reports/students-passing | |
| PG-PND-13 | /pandit/reports/lost-two-marks | |

## Components
| Component | Responsibility |
|-----------|----------------|
| PanditFormWizard / PanditFormEditor | Large form with sections |
| KhandSelector | I / II |
| PortionToggle | NEW / OLD |
| UndertakingFields | Flag + class |
| PaperAttemptRow | Roll + Session + Marks per paper (x8) |
| OralAttemptRow | Oral roll/session/marks |
| ConcessionAlert | Shows when flag Y |
| AddressBlock | ADD1–3 |
| PanditMarksGrid | Session marks entry |
| CrossRefPanel | Cross reference UI |
| PanditResultGeneratePanel | Progress by branch counts |
| MarkSheetVariantPicker | Choose new/onlynew/20162 report |

UX note: Do not card-overwhelm; use one scrollable composition with clear section headings (Candidate, Khand I papers, Khand II papers, Oral, Flags).
