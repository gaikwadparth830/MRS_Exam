# Report Migration Guide — VB6 Data Reports → React + ASP.NET Core

| Field | Value |
|-------|-------|
| Document ID | RPT-MIG-001 |
| Scope | Prabodh, Praveen, Pandit exam reports |
| Source stack | VB6 Data Report (`.Dsr`) + `DataEnvironment1` + Access |
| Target stack | React + TypeScript + MUI \| ASP.NET Core Web API \| SQL Server \| Server-side PDF |
| Purpose | Copy this document into the migration project as the **report work specification**. Use it to generate reports later. **No application code is included here.** |
| Related docs | Per-exam `12_Report_Migration_Catalog.md`, Screen Inventory, FRS, API Spec, UI Inventory |

---

## 1. Principle

Legacy reports are **not** ported by converting `.Dsr` / `.DCA` / DataEnvironment files into React.

Each report becomes three deliverables:

1. **Dataset** — SQL Server view or stored procedure (same business filters as legacy).
2. **API contract** — authenticated endpoint returning PDF (or Excel where approved).
3. **React page** — filter UI + preview/download/print of the PDF.

```text
Legacy:  Form filters → DataEnvironment command → DataReport.Show → Print
Target:  React filters → ASP.NET API → PDF engine → React preview / download
```

**Do not** run Access or ODBC from the browser.  
**Do not** rebuild official certificates as HTML-only pages; use **server-generated PDF**.

---

## 2. Target architecture (reports)

| Layer | Responsibility |
|-------|----------------|
| React + MUI | Report menu, filter form, Preview / Download / Print |
| ASP.NET Core | Validate session/region/centre/rolls; authorize; query SQL Server; render PDF |
| SQL Server | Migrated `Form*` + masters; report views/SPs |
| PDF engine | QuestPDF, Stimulsoft, Syncfusion, FastReport, or SSRS (team choice) |
| Fonts | Unicode Devanagari (e.g. Noto Sans Devanagari) — replace legacy `DV-TTAakash` |

### Shared React components (specification only)

| Component | Role |
|-----------|------|
| `ReportFilterBar` | Session, region, centre, roll from/to, portion (Pandit), variant |
| `ReportPreviewPane` | PDF iframe or PDF viewer |
| `ReportActionButtons` | Preview, Download, Print |
| `ResgenGateMessage` | Show when report requires result generated |

### Shared API patterns (specification only)

| Pattern | Description |
|---------|-------------|
| `POST /api/v1/{exam}/reports/{reportKey}` | Body = filters; response = `application/pdf` |
| `GET /api/v1/{exam}/reports/{reportKey}/meta` | Optional: labels, required flags, default filters |
| Async job (optional) | Large registers return `jobId` then poll for PDF |

---

## 3. Migration method (repeat for every report)

### Step 1 — Capture legacy definition
- Menu path and form that launches the report
- Parameters entered by user
- DataEnvironment command name / SQL
- Filters applied in VB before `.Show`
- Layout fields, grouping, headers/footers
- Business gate (e.g. `RESGEN_* = 'Y'`)
- Save one **golden sample print** (PDF/scan) for parity

### Step 2 — Define SQL Server dataset
- Map Access tables → SQL tables (see Data Mapping docs)
- Recreate SELECT + WHERE + ORDER + GROUP as view or stored procedure
- Parameterize session, region, centre, roll range, portion, variant

### Step 3 — Define API contract
- Method, route, request body, response type
- Auth role
- Error codes (e.g. `RESULT_NOT_GENERATED`, `NO_DATA`)

### Step 4 — Define PDF layout requirements
- Page size/orientation
- Header: institution name/address from `INSTITUTION` / `PARAMETER`
- Hindi + English labels
- Column list and order
- Group breaks (centre / region)
- Footer / signature lines
- Variant rules (e.g. Pandit mark sheet `new` / `onlynew` / `20162`)

### Step 5 — Define React page
- Route (already listed in UI inventory)
- Filters and validation
- Preview/download behaviour
- Empty-state and error messages matching business language

### Step 6 — Acceptance / parity
- Same session + filters → same student set as legacy
- Same totals, grades, results, ranks
- Layout “business equivalent” (pixel-perfect not required unless BA demands)

---

## 4. Technology decisions to confirm before build

| Decision | Options | Recommendation |
|----------|---------|----------------|
| PDF library | QuestPDF / Stimulsoft / Syncfusion / SSRS | QuestPDF or licensed designer if BA edits layouts |
| Preview | Blob URL iframe / `react-pdf` | Blob iframe first |
| Excel export | Needed for registers? | Optional Phase 2 |
| Hindi font | Noto Sans Devanagari embedded in PDF | Required |
| Large reports | Sync PDF vs background job | Sync first; async if timeout |

---

## 5. Implementation order

### Phase R1 — Shared report platform
- PDF service abstraction
- Filter bar + preview pane
- Auth + session context
- Institution/parameter header service

### Phase R2 — Prabodh (simplest exam)
1. Name list  
2. Attendance sheet  
3. Result sheet  
4. Mark sheet  
5. Certificate  
6. Hall ticket  
7. Register (RG)  
8. Lost by 2 marks  

### Phase R3 — Praveen
Same family; add Project/`reg_lang` where mark sheet needs it; centre-wise attendance variant; ranks report.

### Phase R4 — Pandit (most complex)
Attendance, result, result details, mark sheet variants, name list, register, ranks, students passing, lost by 2 marks.  
Include portion (NEW/OLD) and CrossRef-dependent result texts.

---

## 6. Master report inventory (in-scope exams)

### 6.1 Shared / shell reports

| Report ID | Legacy object | Menu | Target route (suggested) | Priority |
|-----------|---------------|------|--------------------------|----------|
| RPT-SHR-01 | Rpt_CentreList | Reports → List of Centres | `/reports/centres` | P2 |
| RPT-SHR-02 | Rpt_CentreWiseNoOfStudent | Centre-wise students | `/reports/centre-wise-students` | P2 |
| RPT-SHR-03 | Rpt_TotalForms | Userwise total forms | `/reports/total-forms` | P3 |

### 6.2 Prabodh

| Report ID | Legacy | FR | React page | API key | Priority |
|-----------|--------|----|------------|---------|----------|
| RPT-PRB-01 | Rpt_AttSheetPrabodh | FR-PRB-060 | `/prabodh/reports/attendance` | `attendance` | R2.2 |
| RPT-PRB-02 | Rpt_ResultSheetPrabodh | FR-PRB-061 | `/prabodh/reports/result-sheet` | `result-sheet` | R2.3 |
| RPT-PRB-03 | Rpt_MarkSheetPrabodh | FR-PRB-062 | `/prabodh/reports/mark-sheet` | `mark-sheet` | R2.4 |
| RPT-PRB-04 | Rpt_Certificate_Prabodh | FR-PRB-063 | `/prabodh/reports/certificate` | `certificate` | R2.5 |
| RPT-PRB-05 | Rpt_HallTicket_Prabodh | FR-PRB-064 | `/prabodh/reports/hall-ticket` | `hall-ticket` | R2.6 |
| RPT-PRB-06 | Rpt_NameListPrabodh | FR-PRB-065 | `/prabodh/reports/name-list` | `name-list` | R2.1 |
| RPT-PRB-07 | Rpt_RGPrabodh | FR-PRB-066 | `/prabodh/reports/register` | `register` | R2.7 |
| RPT-PRB-08 | Rpt_LostTwoMarksPrabodh | FR-PRB-067 | `/prabodh/reports/lost-two-marks` | `lost-two-marks` | R2.8 |

**Primary table:** `FORM_PRABODH` / `dbo.FormPrabodh`  
**Typical filters:** session (default), region, exam centre, roll from–to  

### 6.3 Praveen

| Report ID | Legacy | FR | React page | API key | Priority |
|-----------|--------|----|------------|---------|----------|
| RPT-PRV-01 | Rpt_AttSheetPraveenCentreWise(_New) | FR-PRV-040 | `/praveen/reports/attendance` | `attendance` | R3 |
| RPT-PRV-02 | Rpt_ResultPraveenBrf | FR-PRV-041 | `/praveen/reports/result-sheet` | `result-sheet` | R3 |
| RPT-PRV-03 | Rpt_MarkSheetPraveen(_new) | FR-PRV-042 | `/praveen/reports/mark-sheet` | `mark-sheet` | R3 |
| RPT-PRV-04 | Rpt_Certificate_Praveen | FR-PRV-043 | `/praveen/reports/certificate` | `certificate` | R3 |
| RPT-PRV-05 | Rpt_NameListPraveen | FR-PRV-044 | `/praveen/reports/name-list` | `name-list` | R3 |
| RPT-PRV-06 | Rpt_RGPraveen(_new) | FR-PRV-045 | `/praveen/reports/register` | `register` | R3 |
| RPT-PRV-07 | Rpt_LostTwoMarksPraveen(_new) | FR-PRV-046 | `/praveen/reports/lost-two-marks` | `lost-two-marks` | R3 |
| RPT-PRV-08 | Rpt_Praveen_Ranks | FR-PRV-047 | `/praveen/reports/ranks` | `ranks` | R3 |

**Primary table:** `FORM_PRAVEEN` / `dbo.FormPraveen`  
**Notes:** Session ≥ 20162 often uses `*_new` report variants — encode as `variant` parameter, not separate products long-term.

### 6.4 Pandit

| Report ID | Legacy | FR | React page | API key | Priority |
|-----------|--------|----|------------|---------|----------|
| RPT-PND-01 | Rpt_AttSheetPandit(_new) | FR-PND-050 | `/pandit/reports/attendance` | `attendance` | R4 |
| RPT-PND-02 | Rpt_ResultPandit | FR-PND-051 | `/pandit/reports/result` | `result` | R4 |
| RPT-PND-03 | Rpt_ResultPanditDetails | FR-PND-051 | `/pandit/reports/result-details` | `result-details` | R4 |
| RPT-PND-04 | Rpt_MarkSheetPandit_new / onlynew / 20162_new | FR-PND-052 | `/pandit/reports/mark-sheet` | `mark-sheet` + `variant` | R4 |
| RPT-PND-05 | Rpt_NameListPandit | FR-PND-053 | `/pandit/reports/name-list` | `name-list` | R4 |
| RPT-PND-06 | Rpt_RGPandit_New | FR-PND-054 | `/pandit/reports/register` | `register` | R4 |
| RPT-PND-07 | Rpt_Pandit_Ranks | FR-PND-055 | `/pandit/reports/ranks` | `ranks` | R4 |
| RPT-PND-08 | Rpt_StudentsPassingPandit(1/2) | FR-PND-056 | `/pandit/reports/students-passing` | `students-passing` + `mode` | R4 |
| RPT-PND-09 | Rpt_LostTwoMarksPandit | FR-PND-057 | `/pandit/reports/lost-two-marks` | `lost-two-marks` | R4 |

**Primary table:** `FORM_PANDIT` / `dbo.FormPandit`  
**Extra filters:** `flgportion` (N/O), khand, mark-sheet variant, students-passing mode (full / khand1 / khand2)

---

## 7. Standard filter model

Use this request shape conceptually for all exam reports (fields optional per report):

| Field | Type | Meaning |
|-------|------|---------|
| `sessionNo` | int | Exam session (default = active `DEFA='Y'`) |
| `regionNo` | int? | Region filter |
| `examCentre` | string? | Exam centre code |
| `formCentre` | string? | Form centre code |
| `rollFrom` | int? | Inclusive |
| `rollTo` | int? | Inclusive |
| `variant` | string? | `new` / `legacy` / `20162` / `onlynew` |
| `portion` | string? | Pandit `N` / `O` |
| `passingMode` | string? | Pandit `full` / `khand1` / `khand2` |
| `format` | string | `pdf` (default); `xlsx` if approved |

---

## 8. Business gates (must preserve)

| Gate | Applies | Behaviour |
|------|---------|-----------|
| Active session | Most reports | Default to `SESSION.DEFA='Y'` |
| `RESGEN_PRABODH/PRAVEEN/PANDIT = 'Y'` | Result / mark sheet / some certificates | Block or warn if result not generated (*confirm per report*) |
| Centre open / Pandit flag | Where legacy validates | Exam centre rules |
| No data | All | Return clear `NO_DATA` message, not empty crash |

---

## 9. Header / label data sources

Pull printable labels from migrated masters (not hardcode in React):

| Source | Use |
|--------|-----|
| `INSTITUTION` | Org name, address |
| `PARAMETER` | Attendance headings, paper labels, centre-head texts |
| `SESSION` | Month / session display |
| `REGION` | Region name (Hindi + Eng) |
| `CENTRE` | Centre name, city, address |
| `GRADE` / `RESULT` | Display descriptions if needed |

---

## 10. Per-report work checklist (copy into migration tickets)

For each Report ID:

- [ ] Legacy menu + form identified  
- [ ] Parameters listed  
- [ ] SQL / DE command extracted  
- [ ] SQL Server SP/view named  
- [ ] API route + FR ID mapped  
- [ ] React route mapped  
- [ ] PDF layout sections listed  
- [ ] Hindi labels listed  
- [ ] Business gates documented  
- [ ] Golden sample attached  
- [ ] Parity test cases written  
- [ ] BA sign-off  

Detailed per-exam catalogs:  
- `Prabodh/12_Report_Migration_Catalog.md`  
- `Praveen/12_Report_Migration_Catalog.md`  
- `Pandit/12_Report_Migration_Catalog.md`

---

## 11. What the migration project should generate later (out of scope for this doc)

When implementing (separate task), generate only from these specs:

1. SQL scripts for report datasets  
2. API controllers/services  
3. PDF templates  
4. React report pages  

**This BRD package intentionally contains no application source code.**

---

## 12. Open questions (reports)

1. Exact “lost by 2 marks” formula per exam (confirm from DE command + sample).  
2. Which reports strictly require `RESGEN_*=Y` vs allow draft print?  
3. Keep session-threshold `*_new` variants forever, or one template + `variant`?  
4. Excel export required for register/name list?  
5. Certificate paper size / pre-printed stationery constraints?  
6. Who may print certificates (role)?  

---

## 13. How to use this document in the migration project

1. Copy entire `BRD_Documents` folder (or at least this file + three `12_Report_Migration_Catalog.md` files).  
2. Create backlog tickets from Section 5 order + Section 10 checklist.  
3. For each ticket, fill the catalog row’s “Migration notes” during build.  
4. Do not start PDF coding until SQL dataset + golden sample exist for that report.  
5. Complete Prabodh R2 before cloning patterns to Praveen/Pandit.
