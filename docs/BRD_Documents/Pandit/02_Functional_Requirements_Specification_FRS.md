# Functional Requirements Specification (FRS) — Pandit

Document ID: FRS-PANDIT-001

## FR-PND-M01 Form Entry
| ID | Requirement | Source |
|----|-------------|--------|
| FR-PND-001 | CRUD/nav/search Pandit forms for active session | Cmd_*, Form_Activate |
| FR-PND-002 | Capture khand appearing I/II; portion NEW/OLD | Cmb_Khand_Appearing, cmdportion |
| FR-PND-003 | Capture undertaking flag/class | Txt_Und_*, Cmb_Und_Class |
| FR-PND-004 | Capture per-paper roll/session/marks 1–8 + oral roll/session/marks | Txt_Roll_No_n, Session_n, Marks_n |
| FR-PND-005 | Capture address ADD1–3 | form fields |
| FR-PND-006 | Enable prior marks only when session_n ≠ current | Class_Marks_Enable |
| FR-PND-007 | Validate per check_data (khand-specific required papers) | check_data |
| FR-PND-008 | Run concession check; set CONCESSION_FLAG; alert user | Proc_CheckConcession |
| FR-PND-009 | Lock CRUD when RESGEN_PANDIT=Y | Proc_CheckResultGen |
| FR-PND-010 | Centre validation + display names | Displ_Centre / Validate |

## FR-PND-M02 Marks Entry
| ID | Requirement | Source |
|----|-------------|--------|
| FR-PND-020 | Load forms for session; if session≥20162 filter flgportion='N' by default | Form_Load |
| FR-PND-021 | OLD portion marks mode via cmdOLD | cmdOLD_Click |
| FR-PND-022 | Edit enabled papers based on khand; validate A or 0–100 | Validate helpers |
| FR-PND-023 | Save marks1–8, oral, tot via UPDATE | CmdSave_Click |

## FR-PND-M03 Cross Reference
| ID | Requirement | Source |
|----|-------------|--------|
| FR-PND-030 | Provide Cross Reference processing screen | Frm_Pandit_CrossRef / MDI Processing |
| FR-PND-031 | Link two rolls of different Khands in same session: set reciprocal `OTH_KHAND_ROLLNO`, `BOTH_KHAND_FLAG='Y'` | CrossRef update SQL |
| FR-PND-032 | Set `RES_DECL_FLAG='Y'` on declared roll | CrossRef |
| FR-PND-033 | On generate, if both linked forms are Khand1 Pass + Khand2 Pass → both become `Pandit Exam Pass` with grade `3` | `rspanditboth` path |

*Centre rule:* Exam centre must have `CENTRE.PANDIT_FLAG='Y'` (confirmed on form validate).

## FR-PND-M04 Result Generation
| ID | Requirement | Source |
|----|-------------|--------|
| FR-PND-040 | Guard if already generated | Cmdgenresult |
| FR-PND-041 | Load paper minima 1–9 and exam grade thresholds exam_no=7 | rspaper*/rsgrade |
| FR-PND-042 | Process Khand I NEW (flgportion N) | rspandit1 loop |
| FR-PND-043 | Process Khand II NEW | rspandit2 loop |
| FR-PND-044 | Process Both (res_decl_flag=Y & both_khand_flag=Y) | rspanditboth |
| FR-PND-045 | Process OLD portion Khand I/II when session≥20162 | rspandit3/4 |
| FR-PND-046 | Persist khand1_totmarks / khand2_totmarks / result / grade | Updates |
| FR-PND-047 | SUPER reset RESGEN_PANDIT | Regen form |

## FR-PND-M05 Reports
| ID | Report | Objects |
|----|--------|---------|
| FR-PND-050 | Attendance | Rpt_AttSheetPandit_new |
| FR-PND-051 | Result / Details | Rpt_ResultPandit, Rpt_ResultPanditDetails |
| FR-PND-052 | Mark sheet variants | Rpt_MarkSheetPandit_new / onlynew / 20162_new |
| FR-PND-053 | Name list | Rpt_NameListPandit |
| FR-PND-054 | Register | Rpt_RGPandit_New / Frm_PanditRegister |
| FR-PND-055 | Ranks | Rpt_Pandit_Ranks |
| FR-PND-056 | Students passing | Frm_StudentsPassingPandit + Rpt_StudentsPassingPandit* |
| FR-PND-057 | Lost two marks | Rpt_LostTwoMarksPandit |
