# Functional Requirements Specification (FRS) — Praveen

Document ID: FRS-PRAVEEN-001

## FR-PRV-M01 Form Entry
| ID | Requirement | Source |
|----|-------------|--------|
| FR-PRV-010 | List forms for active session order region_no, roll_no | Form_Activate RsSource |
| FR-PRV-011 | Create with dup roll check (session+region) | Cmd_save_Click |
| FR-PRV-012 | Update / Delete by roll+session | Cmd_* |
| FR-PRV-013 | Search / Nav First-Prev-Next-Last / Undo | ClassMaster |
| FR-PRV-014 | Centre/region validation & display | Validate/Displ_* |
| FR-PRV-015 | Disable mutations when RESGEN_PRAVEEN=Y | Form_Activate |

## FR-PRV-M02 Marks
| ID | Requirement | Source |
|----|-------------|--------|
| FR-PRV-020 | Filter by region + rollFrom | CmdShow_Click |
| FR-PRV-021 | Edit marks1–5, oral, reg_lang; tot=sum(m1..m5) | AfterColEdit |
| FR-PRV-022 | Validate 0–100 or A | AfterColEdit |

## FR-PRV-M03 Result
| ID | Requirement | Source |
|----|-------------|--------|
| FR-PRV-030 | Block generate if already resgen_praveen=Y | cmd_gen_result start |
| FR-PRV-031 | Process rows with all marks non-null | Open SQL |
| FR-PRV-032 | Apply BR-PRV-040..045 | Loop |
| FR-PRV-033 | FIRST rank by tot_marks desc among PASS | rsrank loop |
| FR-PRV-034 | Set SESSION.RESGEN_PRAVEEN='Y' | ADO Command |
| FR-PRV-035 | SUPER reset flag | Frm_regen_res |

## FR-PRV-M04 Reports
| ID | Report | Object |
|----|--------|--------|
| FR-PRV-040 | Attendance | Rpt_AttSheetPraveenCentreWise_New |
| FR-PRV-041 | Result brief | Rpt_ResultPraveenBrf |
| FR-PRV-042 | Mark sheet | Rpt_MarkSheetPraveen_new |
| FR-PRV-043 | Certificate | Rpt_Certificate_Praveen |
| FR-PRV-044 | Name list | Rpt_NameListPraveen |
| FR-PRV-045 | Register | Rpt_RGPraveen_new |
| FR-PRV-046 | Lost two marks | Rpt_LostTwoMarksPraveen_new |
| FR-PRV-047 | Ranks | Rpt_Praveen_Ranks |

## Auth
Same as shared: Normal vs SUPER.
