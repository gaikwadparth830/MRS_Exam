# Functional Requirements Specification (FRS) — Prabodh

Document ID: FRS-PRABODH-001 | Maps to BRD-PRABODH-001

---

## Module FR-PRB-M01 — Authentication & Session (shared)

| ID | Functional requirement | BR ref | UI | API |
|----|------------------------|--------|----|-----|
| FR-PRB-001 | User logs in with userid/password; password verified via legacy encryption keys or modern hash after migration. | BR-PRB-011 | LoginPage | POST /api/auth/login |
| FR-PRB-002 | User selects/activates session; only one DEFA='Y'. | BR-PRB-010 | SessionSelectPage | PUT /api/sessions/{id}/activate |
| FR-PRB-003 | SUPER sees supervisor menu items. | BR-PRB-012 | AppShell | claims/roles |

## Module FR-PRB-M02 — Examination Form Entry

| ID | Functional requirement | Source procedure | BR |
|----|------------------------|------------------|-----|
| FR-PRB-010 | List/navigate Prabodh forms for active session ordered by Form_centre, SrNo. | `Form_Activate` RsSource | BR-PRB-020 |
| FR-PRB-011 | Create form: validate mandatory fields; set userid; allocate SrNo. | `check_data`, `Cmd_save_Click` | BR-PRB-021,025 |
| FR-PRB-012 | Update form; lock roll field on update mode. | `Update_record("Update")` | BR-PRB-025 |
| FR-PRB-013 | Delete form by SrNo+Session. | `Cmd_delete_Click` GS_Delete | BR-PRB-025 |
| FR-PRB-014 | Search candidate (shared search dialog). | `Cmd_search_Click` | BR-PRB-025 |
| FR-PRB-015 | Insert record between two names (modal). | `Cmd_Insert_Click` | BR-PRB-025 |
| FR-PRB-016 | Resolve region from centre→district→region; show names. | `Txt_Form_Centre_Validate` | BR-PRB-022 |
| FR-PRB-017 | Reject closed centres. | close_flag='Y' | BR-PRB-022 |
| FR-PRB-018 | Gender only M/F via radio or text. | OptMale/OptFemale, `Txt_Gender_Change` | BR-PRB-021 |
| FR-PRB-019 | Disable mutations when RESGEN_PRABODH='Y'. | `Form_Activate` | BR-PRB-026 |
| FR-PRB-020 | Show centre-wise form count badge. | `CountFormsForCentre` | BR-PRB-027 |

## Module FR-PRB-M03 — Roll Number Setting

| ID | Functional requirement | Source |
|----|------------------------|--------|
| FR-PRB-030 | Set roll numbers for Prabodh candidates (centre/from-to patterns). | `Sub_SetRollNos_Prabodh` → `Frm_SetRollNo_FromToCentre` |
| FR-PRB-031 | Aur forms: set roll numbers for Prabodh. | `Sub_AurRollNoPrabodh` → `ProcAurSetRollno("Prabodh")` / `Frm_SetRollNoAur` |
| FR-PRB-032 | Single-student mark correction after result (clears result fields; region-wide if ranked). | `Sub_UpdateMarks` → `Frm_RegenResult` |

*Open Question:* Exact roll algorithm in `Frm_SetRollNo_FromToCentre` / Aur — confirm during detailed design review.

## Module FR-PRB-M04 — Marks Entry

| ID | Functional requirement | Source | BR |
|----|------------------------|--------|-----|
| FR-PRB-040 | Filter grid by session, region, roll_no ≥ filter. | `CmdShow_Click` | BR-PRB-030 |
| FR-PRB-041 | Edit marks1–3, oral; recalc total = m1+m2+m3. | `AfterColEdit` | BR-PRB-033 |
| FR-PRB-042 | Validate numeric or A; range 0–100 (oral ≤100). | Same | BR-PRB-031/032 |
| FR-PRB-043 | Read-only when result generated. | `Form_Load` | BR-PRB-034 |

## Module FR-PRB-M05 — Result Generation & Ranking

| ID | Functional requirement | Source | BR |
|----|------------------------|--------|-----|
| FR-PRB-050 | User selects region; clicks Generate Result. | `cmd_gen_result_Click` | BR-PRB-040 |
| FR-PRB-051 | Process eligible rows with rules in BR-PRB-042..047. | Same | BR-PRB-042..047 |
| FR-PRB-052 | Persist grade, result, resgen_run. | Same | BR-PRB-049 |
| FR-PRB-053 | Assign FIRST special_rank to top tot_marks PASS set. | Rank loop | BR-PRB-048 |
| FR-PRB-054 | Show processed grid; option to show duplicate ranks. | `cmd_print`, DataGrid | — |
| FR-PRB-055 | Supervisor can clear RESGEN_PRABODH to allow re-entry/regen. | `Frm_regen_res` / menu | BR-PRB-007 |

*Note:* Unlike Praveen/Pandit, Prabodh generate path reviewed does **not** set `SESSION.RESGEN_PRABODH='Y'` inside `cmd_gen_result_Click`. Lock appears driven by flag set elsewhere (regen/other). **Open Question:** confirm when RESGEN_PRABODH is set to Y.

## Module FR-PRB-M06 — Reports

| ID | Report | Trigger | Report object |
|----|--------|---------|---------------|
| FR-PRB-060 | Attendance sheet | Reports → Attendance → Prabodh | Rpt_AttSheetPrabodh |
| FR-PRB-061 | Result sheet | Reports → Result Sheet → Prabodh | Rpt_ResultSheetPrabodh |
| FR-PRB-062 | Mark sheet | Reports → Mark Sheet → Prabodh | Rpt_MarkSheetPrabodh |
| FR-PRB-063 | Certificate | Reports → Certificate → Prabodh | Rpt_Certificate_Prabodh |
| FR-PRB-064 | Hall ticket | Reports → Hall Ticket → Prabodh | Rpt_HallTicket_Prabodh |
| FR-PRB-065 | Name list | Reports → Name List → Prabodh | Rpt_NameListPrabodh |
| FR-PRB-066 | Register (RG) | Reports → Register → Prabodh | Rpt_RGPrabodh / Frm_RGOtherThanPandit |
| FR-PRB-067 | Lost by 2 marks | Query menu | Rpt_LostTwoMarksPrabodh |

Each report FR includes: select session/region/centre/roll range as per legacy parameter form, then preview/print/export PDF.

## Module FR-PRB-M07 — Shared masters (consumed)

| ID | Requirement |
|----|-------------|
| FR-PRB-070 | Maintain/read Region, District, Centre, Exam(5), Paper(exam 5), Grade, Result codes. |
| FR-PRB-071 | Exam master thresholds for Prabodh: NO_OF_PAPERS=3, MIN_TOTAL=105, CLASS1=180, CLASS2=150, CLASS3=105, DIST=225, FEES=18 (current DB values — configurable). |

## Validation summary

| Field | Rule |
|-------|------|
| Name | Required |
| Form Centre | Required, exists, not closed |
| Exam Centre | Required, exists |
| Gender | M or F required |
| Marks | Number 0–100 or A |
| Oral | Number 0–100 or A; pass needs ≥35 |
| Region | Auto from centre |

## Authorization matrix

| Function | Normal | SUPER |
|----------|--------|-------|
| Form CRUD (if not resgen) | Yes | Yes |
| Marks entry (if not resgen) | Yes | Yes |
| Generate result | Yes | Yes |
| Reset RESGEN_PRABODH | No | Yes |
| User master | No | Yes |
