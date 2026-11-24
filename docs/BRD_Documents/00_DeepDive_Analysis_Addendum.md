# Deep-Dive Analysis Addendum

**Date:** 2026-11-24  
**Status:** Confirmed refinements from secondary source pass  
**Applies to:** Prabodh / Praveen / Pandit BRD packs (v1.0 → treat as errata until docs revised inline)

This addendum captures findings that refine or correct the initial BRD set. Prefer this document over conflicting earlier statements until individual files are patched.

---

## Shared corrections

| Topic | Correction |
|-------|------------|
| Flag reset vs mark correction | **`Frm_regen_res.frm`** = Supervisor “Reset Result Generated Flag” (`RESGEN_*='N'`). **`Frm_RegenResult.frm`** = Supervisor “Update Marks” (single-student mark edit + clear result fields). Do not conflate. |
| Roll set form (Prabodh) | Active path uses **`Frm_SetRollNo_FromToCentre.frm`** when `LblExam="Prabodh"` (not only `Frm_SetRollNo1`). Aur uses `Frm_SetRollNoAur`. |
| `passing_marks` | Loaded from `PAPER` in Prabodh/Praveen generate loops but **not used**; pass checks use `min_marks` (+ oral rules). |

---

## Prabodh refinements

### Confirmed
1. Form entry: **roll is locked / display-oriented**; allocation via Set Roll / Aur flows.
2. Marks grid includes **`reg_lang` as “Optional Paper”** (max **50**). Validated at entry; **ignored in result generation**.
3. `TOT_MARKS` = papers 1–3 only (oral + optional excluded) — confirmed in marks and `Frm_RegenResult` Prabodh path.
4. Oral min **35** hardcoded; oral **NULL → treated as 0** → fails oral check (does not take `"-"` path).
5. Generate does **not** set `RESGEN_PRABODH='Y'` (unlike Praveen/Pandit). Flag set location still **Open Question** (Session master / elsewhere).
6. Rank: generate assigns **FIRST** only; **`Cmd_ranks_Click`** can assign FIRST+SECOND. Explicit `rsrank.Update` often missing — persistence ambiguous.
7. Post-result correction: `Frm_RegenResult` clears grade/result/rank/run; if student had `SPECIAL_RANK`, clears result fields for **entire region** and warns to regenerate.
8. Region for generate = **first character** of `Cmb_region` text (`Mid(...,1,1)`).

### Doc patches needed
- Screen inventory: add `Frm_regen_res`, `Frm_RegenResult` (Update Marks), `Frm_SetRollNo_FromToCentre`.
- Marks BR: document optional paper (`reg_lang`) entry rules vs non-use in generate.
- Open Q: keep RESGEN_PRABODH writer unknown.

---

## Praveen refinements

### Confirmed
1. **`UND_FLAG` / `UND_CLASS`:** no Praveen UI/code usage (Pandit-only undertaking pattern). Retain columns; hide in UI unless business reintroduces.
2. **`FORM_PRAVEEN20162`:** no VB references — archive table only.
3. **`reg_lang` caption = “Project”** on marks grid; combined with oral for pass: `(oral + reg_lang) < 35` → Fail.
4. Generate **sets** `RESGEN_PRAVEEN='Y'`.
5. **No MDI roll-allocation menu** for Praveen (manual roll on form).
6. **`Frm_RegenResult` exam combo has no Praveen** — no in-app single-row mark correction like Prabodh.
7. Orphan / not in `Project1.vbp`: `Frm_SelectRegionPraveen.frm`, `Frm_MarkSheetPraveen.frm`.
8. Delete SQL uses `roll_no + session_no` only — **missing `region_no`** though uniqueness is roll+session+region.
9. **Absent-logic defect (copy-paste):** conditions repeat `marks2` instead of checking marks3/4/5 properly — modernization should **fix** with business approval (do not silently “fix” without CR, but document as known legacy defect).
10. `_org` generate = **4 papers** + oral-only &lt;35; current = **5 papers** + oral+project &lt;35.

### Doc patches needed
- Screen inventory: fix regen screen name (`Frm_regen_res`); note orphan forms; note no Update-Marks for Praveen.
- Open Q: whether to repair absent-check bug and delete-key incompleteness in new system.

---

## Pandit refinements

### Confirmed
1. **Exam centre must have `CENTRE.PANDIT_FLAG='Y'`** (form centre validation path).
2. Generate **sets** `SESSION.RESGEN_PANDIT='Y'`.
3. **Cross-reference (`Frm_Pandit_CrossRef`):** links two rolls (different Khands) → sets reciprocal `OTH_KHAND_ROLLNO`, `BOTH_KHAND_FLAG='Y'`; `RES_DECL_FLAG` on declare roll. Merge path: if Khand1 Pass + paired Khand2 Pass → both **`Pandit Exam Pass` / grade `3`**.
4. Prior paper sessions must be within **`session_no - 20` … current** (~2 years).
5. Save: must have **≥1 paper slot** matching current session+roll; **cannot** have opposite-khand slots also on current session (forces separate form / cross-ref).
6. Ranking among **`PANDIT EXAM PASS`**: FIRST then SECOND by `tot_marks`.
7. **`lblpandit.mdb`:** no code references found — likely unused/orphan label DB; confirm before migration.
8. **`NO_OF_PAPERS=3`:** treat as **per-khand syllabus count** (or legacy metadata), not column count of `MARKS1..8`.

### Known defects (document; require CR to change behavior)
| Defect | Location | Impact |
|--------|----------|--------|
| `cmdportion = "MEW"` | `check_data` | Papers 7–8 prior-mark validation likely never runs |
| `li_passing9 = rspaper8.passing_marks` | `Frm_GenResultPandit` | Oral threshold may use paper 8 instead of 9 |
| `TxtTot` = P1..P7 only | `Frm_PanditMarks` | Excludes marks8 from total |
| Hardcoded Khand2 min **70** | OLD portion branch | Differs from `MIN_TOTAL_KHAND2=105` |
| Some OLD grade bands hardcoded 375/300/250 | GenResult | Differs from EXAM 525/420/350 |

### Doc patches needed
- FRS CrossRef: replace “open spike” with confirmed field updates + Exam Pass/grade 3 merge rule.
- Screen inventory: `Frm_regen_res` vs Update Marks; centre pandit_flag rule in BRD/rules.
- Architecture: strategy tests must cover CrossRef merge and OLD/NEW separately.

---

## Recommended review order for stakeholders

1. Confirm whether known **defects** should be preserved (legacy parity) or fixed (approved change).
2. Answer remaining open questions in each exam BRD §Open Questions.
3. Sign off Prabodh BRD first (simplest; fewest defects blocking build).
