# Target Architecture & Technical Design — Praveen

Document ID: ARCH-PRAVEEN-001

Reuse shared Identity, Masters, Session, Report infrastructure from Prabodh module.

Praveen-specific: FormPraveen aggregate keyed by Session+Region+Roll; ResultService implements RULE-PRV-10..17; after successful generate update ExamSession.ResgenPraveen.

Indexes: (SESSION_NO, REGION_NO, ROLL_NO), (SESSION_NO, RESULT, TOT_MARKS).

Security: parameterized SQL; JWT; SUPER for flag reset.

Testing: golden vectors for oral+reg_lang boundary (34 fail, 35 pass) and 5-paper absence rules.
