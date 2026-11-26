# MrsExam Report Troubleshooting Guide (Legacy VB6)

> For **migrating** reports to React/ASP.NET, use  
> `00_Report_Migration_Guide_React_ASPNET.md` and each exam’s `12_Report_Migration_Catalog.md`.  
> This file is only for fixing legacy VB6 Data Reports on a desktop.

## Why forms work but reports fail

| Layer | How it connects | Status on this PC |
|-------|-----------------|-------------------|
| Forms / marks / result | ADO DSN-less: `DRIVER={Microsoft Access Driver (*.mdb)};DBQ=...;PWD=mrs2002` via `Module1.Db_Conn` | Works |
| Reports (Data Report) | `DataEnvironment1` → design-time ODBC DSN named **`Mrsexam`** (`DataEnvironment1.Dsr`) | **Was missing** |

Design-time connection in source:

```text
Provider=MSDASQL.1;Persist Security Info=False;Data Source=Mrsexam
```

`Module1.Db_Conn` also assigns:

```vb
DataEnvironment1.Connection1.ConnectionString = "DRIVER={Microsoft Access Driver (*.mdb)};DBQ=" & DbPath & ";UID=admin;PWD=mrs2002"
```

If the DSN is missing or wrong, or the DE connection was never opened cleanly, **`Rpt_*.Show` fails** while normal forms still work.

---

## Fix applied on this machine

1. Created **32-bit User ODBC DSN** named `Mrsexam`
   - Driver: `C:\Windows\SysWOW64\odbcjt32.dll`
   - DBQ: `z:\brd doc\Prabodh and Praveen and Pandit\MrsExam\Database\MRSEXAM.mdb`
   - UID: `admin` / PWD: `mrs2002`
2. Verified with 32-bit ADO: `SELECT COUNT(*) FROM REGION` → OK
3. Installed / registered **DV-TTAakash** font from `MrsExam\Reports\DVAK0BTT.TTF` (reports use Devnagari UI fonts)

---

## What you should do now

1. **Fully close** MrsExam / VB6 / `Exam*.exe`
2. Restart the application
3. Open a simple report first, e.g. **Reports → List of Centres** (`Rpt_CentreList`)
4. Then try Prabodh/Praveen/Pandit mark sheet or result sheet

---

## If reports still fail

### A. Confirm you are using 32-bit ODBC Admin
VB6 is 32-bit. Always use:

```text
C:\Windows\SysWOW64\odbcad32.exe
```

Check **User DSN** (or System DSN) for **`Mrsexam`** → Microsoft Access Driver (*.mdb) → database path correct.

### B. Typical error messages

| Message | Meaning | Action |
|---------|---------|--------|
| Data source name not found | DSN `Mrsexam` missing | Recreate DSN (above) |
| Architecture mismatch | Opened 64-bit ODBC admin / wrong driver | Use SysWOW64 `odbcad32.exe` |
| Not a valid password / cannot open database | MDB password / path wrong | PWD=`mrs2002`; path to `Database\MRSEXAM.mdb` |
| Object required / DataEnvironment | DE not initialized | Ensure login/`Db_Conn` ran before report |
| Operation is not allowed when object is closed/open | Recordset already open | Close report, reopen app, retry once |
| Blank Hindi / boxes | Font missing | Install `DVAK0BTT.TTF` |

### C. Business gates (not a crash)
Some reports require result already generated (`RESGEN_*=Y`) or a selected session (`DEFA=Y`). If the UI shows a message and exits, that is logic — not the ODBC issue.

### D. Recreate DSN manually
1. Run `C:\Windows\SysWOW64\odbcad32.exe` **as Administrator** (for System DSN) or normal (User DSN)
2. Add → **Microsoft Access Driver (*.mdb)**
3. Data Source Name: **`Mrsexam`** (exact spelling)
4. Select: `...\MrsExam\Database\MRSEXAM.mdb`
5. Advanced/Options: login `admin`, password `mrs2002` if prompted

---

## Permanent code hardening (optional, for VB6 maintainers)

In `Module1.Db_Conn`, after setting `ConnectionString`, also:

```vb
On Error Resume Next
If DataEnvironment1.Connection1.State = adStateOpen Then
    DataEnvironment1.Connection1.Close
End If
On Error GoTo 0
DataEnvironment1.Connection1.ConnectionString = _
    "DRIVER={Microsoft Access Driver (*.mdb)};DBQ=" & DbPath & ";UID=admin;PWD=mrs2002"
DataEnvironment1.Connection1.Open
```

This avoids depending on the design-time DSN name after login.

---

## Note for Z: network path
DSN currently points to `z:\brd doc\...`. If the drive letter changes, update the DSN DBQ path or reports will break again while forms may still work if you browse to the MDB at login.
