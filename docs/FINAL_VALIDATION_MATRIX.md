# Final Validation Matrix (Phase 11)

All results below were produced by live re-verification during Phase 11, not carried forward
from memory.

| Layer | Test | Result | Evidence |
|---|---|---|---|
| Raw data integrity | Checksum re-verification against `phase4a/validation/raw_file_checksums.csv` | PASS | 0 mismatches |
| Phase 4A | Data audit, gap register (Gaps 1-8, M1) | PASS (frozen) | `phase4a/PHASE4A_SUMMARY.md`, `PHASE4A_GAP_CLOSURE_REPORT.md` |
| Phase 4B-4D | Synthetic household/appliance population | PASS (frozen) | `phase4d/PHASE4D_VALIDATION_RESULTS.json` |
| Phase 5 | Baseline simulation | PASS (frozen) | `phase5/reports/PHASE5_SUMMARY.md` |
| Phase 6 | Forecasting, leakage audit | PASS (frozen) | 26/26 validation, 6/6 leakage, 4/4 reproducibility checks |
| Phase 7 | Flexibility estimation | PASS (frozen) | 21/21 validation checks |
| Phase 8 | DR controller (+ gap closure) | PASS (frozen) | 24/24 validation checks, re-confirmed live this phase |
| Phase 9 | Final evaluation | PASS (frozen) | 13/13 validation checks, re-confirmed live this phase |
| Backend | Automated test suite | PASS | 23/23 (`backend/tests/test_api.py`), including 1 new Phase-11 regression test |
| Backend | Live endpoint smoke test | PASS | All 17 endpoints re-tested live, 200 OK |
| Frontend | TypeScript compile + production build | PASS | `tsc -b && vite build`, 716 KB JS (gzip 208 KB) |
| Frontend | Lint (oxlint) | PASS | 0 errors, 6 stylistic warnings |
| Browser E2E | Playwright smoke + responsive + accessibility suite | PASS | 25/25 (`frontend/e2e/{smoke,responsive}.spec.ts`) |
| API/UI consistency | Data-consistency tests (Section 10.29/11.5) | PASS | Baseline flexibility, primary curtailed energy, participation counts, transformer/household counts all verified source == API == UI |
| Research consistency | Stale-number audit (Section 11.17) | PASS | 0 matches for pre-gap-closure figures (70.1%, 5,447.3 W, 76.1%, 4,039 interventions, 1,400,378 Wh) anywhere in frontend/backend/docs |
| Claim/language audit | Misleading-phrase scan (Section 11.18) | PASS | All matches correctly negated or are claim-category labels, not assertions |
| Security | Secrets, control endpoints, CORS, path traversal | PASS | 0 secrets committed; 0 control endpoints; CORS restricted to local dev origins; no user-supplied filesystem path |
| Reproducibility | Clean-environment command sequence | PASS | `research/final/REPRODUCIBILITY.md`; backend/frontend start, tests, and build all succeed from the documented commands |
| Documentation | Required Phase 10/11 docs present | PASS | 7 `docs/PHASE10_*.md`, 15 `research/final/*_METHOD.md`-and-friends, `RESULTS_TABLE.md`, `CLAIM_MATRIX.md`, root `README.md`, `FINAL_DEMO_GUIDE.md`, `JUDGE_QA.md`, `DEPLOYMENT_READINESS.md`, this matrix |

## Defects found and fixed during Phase 11 (not hidden)

| Defect | Root cause | Fix | Regression guard |
|---|---|---|---|
| `/api/appliances` reported 16 appliance types instead of 13, with several instance counts off by one | Missing `provenance_class == "SYNTHETIC"` filter let the single REAL iAWE donor household (`iAWE_house1`) be counted alongside the 100-household synthetic population | Added the filter in `backend/app/api/topology.py::get_appliances` | `backend/tests/test_api.py::test_appliances_excludes_iawe_donor_household` |
| 3 E2E test selectors were ambiguous (Playwright strict-mode violations) or referenced the pre-fix "16" figure | Test-authoring bugs, not application bugs | Selectors disambiguated with `.first()` / `{ exact: true }`; appliance test updated to assert "13" | Verified via full 25/25 E2E re-run |

Neither defect affected any Phase 4-9 research artifact; both were caught and fixed entirely
within the Phase 10 application layer.

## Not yet done (documented, not hidden)

- No load/stress testing has been performed (out of scope for a hackathon demo; see
  `docs/DEPLOYMENT_READINESS.md`).
- No cross-browser E2E matrix (Chromium only) — Firefox/WebKit were not exercised.
- No CI pipeline configuration exists to run these suites automatically on every change.
