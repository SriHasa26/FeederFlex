# Phase 10 — Validation

## Backend

| Check | Result |
|---|---|
| Backend starts (`uvicorn app.main:app`) | PASS — confirmed via live process, `/api/health` returns `{"status":"ok","data_loaded":true}` |
| All 17 required endpoints respond `200` | PASS — live-tested: health, feeder, feeder/timeseries, feeder/kpis, forecast, renewable, flexibility, controller/state, controller/events, transformers, households, appliances, scenarios, scenarios/{key}, results, evidence, limitations |
| Automated test suite | PASS — 22/22 (`backend/tests/test_api.py`), including Section-10.29 data-consistency checks |
| Invalid scenario parameter returns `400` | PASS (`test_feeder_timeseries_invalid_scenario`) |
| Unknown transformer/household ID returns `404` | PASS (`test_transformer_unknown_404`) |
| No control endpoint exists | PASS — source scan for `POST`/`control-appliance`/`live control` in `backend/app`: 0 matches |

## Frontend

| Check | Result |
|---|---|
| TypeScript compiles (`tsc -b`) | PASS |
| Production build (`vite build`) | PASS — `dist/` generated, 716 KB JS bundle (gzip 208 KB) |
| Dev server starts and serves | PASS — `http://localhost:5173` returns `200`, `main.tsx` module transforms without error |
| Lint (`oxlint`) | PASS with 6 stylistic warnings only (fetch-in-effect patterns), no errors |
| Rules-of-Hooks violation found and fixed | A `useMemo` call inside an `AsyncBoundary` render-prop callback in `Households.tsx` was found during review and replaced with a plain (non-memoized) filter — 100 rows does not need memoization, and calling hooks inside a non-component callback violates React's Rules of Hooks even though it happened not to crash in this specific case |

## Data consistency (Section 10.29)

All checks run directly against the validated Phase 7/8/9 artifacts, not against the backend's
own cached copy, so a serialization or aggregation bug would be caught:

| Check | Phase 9/8/7 artifact value | Backend API value | Match |
|---|---:|---:|---|
| Baseline available flexibility (90%) | 0.0 W (`baseline_evaluation.json`) | 0.0 W (`/api/flexibility?eligibility_scenario=baseline&participation_pct=90`) | PASS |
| Primary counterfactual curtailed energy | 846,511.4671144746 Wh (`controller_grid_summary.csv`) | matches within 1.0 Wh (`/api/scenarios/assumed_stress_test__counterfactual_broad__90`) | PASS |
| Participation household counts (30/50/70/90%) | 28/50/73/91 (`participation_assignments.parquet`) | 28/50/73/91 (`/api/flexibility?participation_pct=N`) | PASS |
| Transformer count | 11 (`transformer_metrics.csv`) | 11 (`/api/transformers`) | PASS |
| Household count | 100 (`household_connections.parquet`) | 100 (`/api/households`) | PASS |

## No scientific drift (Section 10.30)

- [x] No Phase 4 output changed — re-verified: 0 raw-data checksum mismatches against
  `phase4a/validation/raw_file_checksums.csv`
- [x] No Phase 5 output changed — not written to by any Phase 10 code (read-only import in
  `data_loader.py` touches only phase4b/4c/6/7/8/9)
- [x] No Phase 6 output changed — read-only
- [x] No Phase 7 output changed — read-only
- [x] No Phase 8 output changed — re-verified: `PHASE8_VALIDATION_RESULTS.json` still reports
  24/24 passed
- [x] No Phase 9 output changed — re-verified: `PHASE9_VALIDATION_RESULTS.json` still reports
  13/13 passed
- [x] No new scientific assumptions — Phase 10's `backend/app/core/config.py` only restates
  Phase 7/8/9 scenario constants; no new capacity, threshold, or participation value is defined
- [x] No fabricated numbers — every dynamic value traces to a validated artifact
  (`PHASE10_DATA_FLOW.md`)
- [x] No counterfactual result labeled as real — `EvidenceBadge` renders
  "COUNTERFACTUAL · ILLUSTRATIVE" on every Class-B view; verified via source scan
- [x] No real DISCOM claim — source scan: 0 matches for "real DISCOM integration" (unnegated)
- [x] No SCADA claim — source scan: 0 matches for "SCADA integration confirmed"
- [x] No hardware claim — no hardware-control code or copy exists anywhere in `frontend/` or `backend/`

## Not yet done (documented, not hidden)

- No automated end-to-end (headless-browser) test exists for the frontend — verification here is
  TypeScript compilation, ESLint, a working dev-server response, and manual source review, not a
  rendered-DOM assertion suite. A `playwright`/`vitest`-based test suite is a reasonable Phase 11
  candidate if a persistent frontend test harness is wanted.
