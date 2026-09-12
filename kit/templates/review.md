# Review dispositions
<!-- Save as qa/<id>/review-N.md. This is the orchestrator's assessment of saved reports, not a reviewer reply.
Replace N in filenames. Every role must appear exactly once. PASS requires a report and a concrete
reason resolving findings. SKIP is only for a focused role whose trigger is absent, with a reason.
FAIL/UNCONFIRMED block sealing. Older unaffected focused reports may be reused with an explanation.
Do not label an adverse report PASS until its real findings are fixed and re-reviewed or refuted
with evidence. finish.cjs hashes reports; it does not interpret free-form QA prose. -->

## Reviews
| Agent | Status | Report | Reason |
|---|---|---|---|
| ap-qa | UNCONFIRMED | report-N.md | <disposition of findings> |
| ap-acceptance | UNCONFIRMED | ap-acceptance-report-N.md | <disposition or reason to skip> |
| ap-regression | UNCONFIRMED | ap-regression-report-N.md | <disposition or reason to skip> |
| ap-security | UNCONFIRMED | ap-security-report-N.md | <disposition or reason to skip> |
| ap-cleanup | UNCONFIRMED | ap-cleanup-report-N.md | <disposition or reason to skip> |
