# Phase 10 — Data Flow

**Every UI value traces to one validated artifact below (Section 10.2). No Phase 10 code
fabricates a demo number.**

| UI element | Backend endpoint | Source artifact(s) |
|---|---|---|
| Landing "Results preview" | `/api/results` | `phase9/baseline/baseline_evaluation.json`, `phase9/counterfactual/counterfactual_evaluation.json` |
| Dashboard KPI row | `/api/feeder/kpis` | `phase8/scenarios/hourly_{scenario}.parquet` (aggregated) |
| Dashboard timeline / playback | `/api/feeder/timeseries` | `phase8/scenarios/hourly_{scenario}.parquet` (row-for-row) |
| Dashboard Grid Stress panel | (from timeseries points) | Same, `event_state`/`shortfall_w`/`permitted_import_w` columns |
| Dashboard Flexibility panel | (from timeseries points) + `/api/flexibility` | Same + `phase7/scenarios/participation_assignments.parquet` |
| Dashboard renewable chart | `/api/renewable` | `phase6/features/pv_availability_normalized.csv` |
| Dashboard transformer contribution | `/api/transformers/{id}` × 11 | `phase8/control_logs/control_log_{scenario}.parquet`, grouped by `transformer_id` |
| Transformers page | `/api/transformers`, `/api/transformers/{id}` | `phase4c/metrics/transformer_metrics.csv`, `phase4c/feeder/household_connections.parquet` |
| Households page | `/api/households`, `/api/households/{id}` | `phase4c/feeder/household_connections.parquet`, `phase4b/population/appliance_instances.parquet` |
| Appliances page | `/api/appliances` | `phase4b/population/appliance_instances.parquet` (hardcoded 4-profiled-type list mirrors Phase 7's own taxonomy) |
| Scenario Lab | `/api/scenarios`, `/api/scenarios/{key}` | `phase8/scenarios/controller_grid_summary.csv`-equivalent aggregation, computed live from the same `hourly_*.parquet` files Phase 8 itself produced |
| Results page | `/api/results` | All 6 Phase 9 evaluation JSON/CSV files, `phase8/metrics/fairness_metrics.json` |
| Results page forecast section | `/api/forecast` | `phase6/forecasts/load_forecast_h1h.parquet`, `phase6/metrics/load_forecast_comparison_table.csv` |
| Evidence page | `/api/evidence` | Structured restatement of `phase9/reports/PHASE9_EVIDENCE_CLASSIFICATION.md` (`backend/app/services/research_content.py`) |
| Limitations page | `/api/limitations` | Structured restatement of `phase9/reports/PHASE9_LIMITATIONS_AUDIT.md` (`backend/app/services/research_content.py`) |
| Methodology page | (static content) | Phase 4A-9 pipeline description; no API call needed, content mirrors `PHASE9_RESEARCH_CONTRIBUTION.md` |

## Where the backend computes vs. passes through

- **Pass-through, unmodified**: `/api/results`, and every Phase 9 JSON field within it. Phase 9
  already validated these numbers; Phase 10 never recomputes them.
- **Live aggregation from Phase 8's own row-level output** (sums, means, percentiles over
  `hourly_*.parquet` / `control_log_*.parquet`): `/api/feeder/kpis`, `/api/scenarios/{key}`,
  `/api/transformers/{id}`, `/api/households/{id}`. These use the exact same source columns
  Phase 8 itself produced and Phase 9 itself aggregated (e.g. `delivered_flexibility_w.sum()`)
  — the formulas are restated in `PHASE10_API_SPEC.md`'s schema notes, and verified identical to
  Phase 8/9's own numbers by the data-consistency tests in `backend/tests/test_api.py`
  (Section 10.29).
- **Static, curated restatement of already-written Phase 9 prose**: `/api/evidence`,
  `/api/limitations` (`research_content.py`) — word-for-word claims from
  `PHASE9_EVIDENCE_CLASSIFICATION.md` / `PHASE9_CLAIM_MATRIX.md` / `PHASE9_LIMITATIONS_AUDIT.md`,
  structured for API consumption, not reworded or softened.

## What never happens

No endpoint re-runs Phase 8's controller, re-fits a Phase 6 forecast model, re-derives Phase 7's
eligibility taxonomy, or generates a synthetic appliance/household record. Every dynamic number
is either read directly from a Parquet/CSV/JSON cell or is a documented sum/mean/ratio over
already-computed cells.
