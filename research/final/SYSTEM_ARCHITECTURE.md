# System Architecture

## Two layers

1. **The research pipeline** (`phase3_data/processed/phase4a` through `phase9`) — Python/pandas
   batch scripts, each phase a directory of scripts + validated Parquet/CSV/JSON outputs +
   markdown reports. This layer is frozen as of Phase 9/the Phase 8 gap closure; Phase 10/11
   never modify it.
2. **The demonstration application** (`backend/`, `frontend/`) — a FastAPI backend serving the
   pipeline's validated outputs read-only, and a React/TypeScript/Vite frontend presenting them.

```
Real/derived source data (iAWE, Mathura/Bareilly, Open-Meteo, CEA capacity range)
        │
        ▼
Phase 4A-4D  Synthetic household/appliance population construction
        │
        ▼
Phase 4C     Feeder topology (100 households → 11 transformers → 1 feeder)
        │
        ▼
Phase 5      Baseline (uncontrolled) hourly load simulation
        │
        ▼
Phase 6      Load + renewable-availability forecasting
        │
        ▼
Phase 7      Appliance-level flexibility estimation
        │
        ▼
Phase 8      Constrained DR dispatch controller (+ gap closure)
        │
        ▼
Phase 9      Final evaluation, evidence classification
        │
        ▼
Phase 10 backend (FastAPI, read-only)  ──HTTP──▶  Phase 10 frontend (React)
```

## Backend

FastAPI, Python 3.13. A `DataStore` singleton loads every static reference artifact once at
startup; per-scenario hourly/control-log Parquet files are lazily cached on first request. 17
`GET`-only endpoints, typed Pydantic response models with explicit units. No control endpoint,
no database, no filesystem path accepted from the client. Detail: `docs/PHASE10_ARCHITECTURE.md`,
`docs/PHASE10_API_SPEC.md`.

## Frontend

React 19 + TypeScript + Vite, Tailwind CSS v4, Recharts. Ten routes: Landing, Dashboard,
Transformers, Households, Appliances, Scenario Lab, Results, Methodology, Evidence, Limitations.
A shared scenario-selector context drives the Dashboard and Scenario Lab; a deterministic
playback timeline replays already-computed historical simulation records (not live data).
Detail: `docs/PHASE10_UI_SPECIFICATION.md`.

## Data flow guarantee

Every number the frontend displays traces to one validated Phase 4-9 artifact, either passed
through unmodified (Phase 9's own evaluation JSON) or aggregated live from Phase 8's row-level
output using the exact same source columns Phase 8/9 themselves used. See
`docs/PHASE10_DATA_FLOW.md` for the full per-element mapping, and
`backend/tests/test_api.py`'s data-consistency tests for the automated verification.
