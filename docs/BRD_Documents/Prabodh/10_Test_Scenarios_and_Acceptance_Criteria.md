# Test Scenarios & Acceptance Criteria — Prabodh

Document ID: TEST-PRABODH-001

## Form entry

| TC | Scenario | Steps | Expected | AC |
|----|----------|-------|----------|-----|
| TC-PRB-01 | Create valid form | Enter name, centres, gender M; save | Row created; userid set; srno allocated | Form visible in list |
| TC-PRB-02 | Missing name | Save without name | Error; no save | Matches GS_msgblank behavior |
| TC-PRB-03 | Closed centre | Form centre with close_flag=Y | Reject | Message about closed centre |
| TC-PRB-04 | Invalid exam centre | Non-existent code | Reject | Does not exist message |
| TC-PRB-05 | Gender invalid | Enter X | Cleared / error | Only M/F |
| TC-PRB-06 | Region auto | Valid centre | Region filled | Matches district→region |
| TC-PRB-07 | Delete | Delete current | Removed | Cannot GET |
| TC-PRB-08 | Update lock roll | Update mode | Roll locked | Name editable |
| TC-PRB-09 | Resgen lock | RESGEN_PRABODH=Y | CRUD disabled | API 403 |
| TC-PRB-10 | Insert between | Insert between two names | New srno Prev+1 | Order preserved intent |
| TC-PRB-11 | Nav | First/Next/Last | Correct record | — |
| TC-PRB-12 | SUPER reset | Clear flag | CRUD re-enabled | Flag=N |

## Marks

| TC | Scenario | Expected |
|----|----------|----------|
| TC-PRB-30 | Enter 40,50,60 oral 40 | tot=150 |
| TC-PRB-31 | Enter A | Accepted |
| TC-PRB-32 | Enter -1 | Reject |
| TC-PRB-33 | Enter 101 | Reject |
| TC-PRB-34 | Oral 101 | Reject |
| TC-PRB-35 | Filter region+roll | Only matching rows |

## Result generation (use fixed masters: min 25, oral 35, bands 225/180/150/105)

| TC | Input (m1,m2,m3,oral,tot) | Expected result/grade |
|----|---------------------------|------------------------|
| TC-PRB-41 | A,A,A,40,null | Fail / A |
| TC-PRB-42 | A,40,40,40,80 | Fail / X |
| TC-PRB-43 | 40,40,20,40,100 | Fail / X (tot&lt;105) |
| TC-PRB-44 | 40,40,40,30,120 | Fail / X (oral&lt;35) |
| TC-PRB-45 | 24,40,40,40,104 | Fail / X (min paper) if tot≥105 still fail on min |
| TC-PRB-46 | 80,80,80,40,240 | Pass / Vi. Yo. |
| TC-PRB-47 | 70,60,55,40,185 | Pass / 1 |
| TC-PRB-48 | 55,50,50,40,155 | Pass / 2 |
| TC-PRB-49 | 40,40,40,40,120 | Pass / 3 |
| TC-PRB-50 | Two PASS same max tot | Both SPECIAL_RANK FIRST |
| TC-PRB-51 | Region filter | Only selected region processed |
| TC-PRB-52 | Already resulted row | Skipped (result not null) |

## Reports

| TC | Report | AC |
|----|--------|----|
| TC-PRB-60..67 | Each report type | PDF generated for sample session; key fields present (roll, name, marks/result as applicable) |

## Acceptance for go-live (Prabodh)

1. 100% of TC-PRB-41..52 pass against golden dataset extracted from Access.  
2. Form CRUD parity verified by operations user UAT sign-off.  
3. Sample mark sheets/certificates match legacy values (layout may differ).  
4. No open Critical defects on RULE-PRB-*.
