# Phase 10 — Architecture

## Overview

Phase 10 is an **application integration** phase. It builds a full-stack demonstration around
the already-validated Phase 4-9 research pipeline, without modifying it.

```
┌─────────────────────────────┐        ┌───────────────────────────┐        ┌─────────────────────────────┐
│  phase3_data/processed/      │  read  │  backend/  (FastAPI)       │  HTTP  │  frontend/  (React + Vite)  │
│  phase4c, phase4b, phase6,   │ ─────▶ │  read-only DataStore,      │ ─────▶ │  pages, charts, scenario     │
│  phase7, phase8, phase9      │  only  │  typed Pydantic responses  │  GET   │  selector, playback timeline │
│  (FROZEN research artifacts) │        │  no control endpoints      │        │  no fabricated data          │
└─────────────────────────────┘        └───────────────────────────┘        └─────────────────────────────┘
```

## Critical architectural rule

**The validated scientific pipeline (`phase3_data/processed/phase4a` through `phase9`) is
never modified.** The backend reads Parquet/CSV/JSON files from these directories read-only, at
process startup, into an in-memory cache. No Phase 10 code writes to `phase3_data/`, re-runs any
simulation, retrains any model, or duplicates the Phase 8 controller's logic. Every number the
frontend displays traces to a specific validated artifact — see `PHASE10_DATA_FLOW.md`.

## Backend (`backend/`)

FastAPI application, Python 3.13, `app/` package:

- `app/core/config.py` — paths (relative to repo root) and scenario constants, all inherited
  unchanged from Phase 7/8/9. No new scenario, threshold, or capacity value is defined here.
- `app/services/data_loader.py` — a `DataStore` singleton, `.load()` called once at FastAPI
  startup (via `lifespan`), reading every static reference artifact (topology, appliance
  population, participation assignments, Phase 6/9 evaluation outputs) into memory. Per-scenario
  hourly/control-log Parquet files (13 combinations each) are lazily loaded and `lru_cache`d on
  first request, since not every scenario combination is necessarily requested in a given
  session.
- `app/schemas/models.py` — typed Pydantic response models. Every power/energy field is
  unit-suffixed (`_w`, `_wh`, `_pct`, `_normalized`).
- `app/api/*.py` — one router per resource group: `health`, `feeder`, `forecast`, `flexibility`
  (also controller state/events), `topology` (transformers/households/appliances), `scenarios`,
  `research` (results/evidence/limitations).
- `app/main.py` — app instance, CORS (frontend dev origin only), router registration.

No control endpoint exists anywhere (Section 10.21) — every route is `GET`.

## Frontend (`frontend/`)

React 19 + TypeScript + Vite, Tailwind CSS v4 for styling, Recharts for charts, React Router for
navigation.

- `src/types/api.ts` — TypeScript interfaces mirroring the backend's Pydantic schemas exactly.
- `src/services/api.ts` — a thin typed fetch client, one function per backend endpoint.
- `src/hooks/useApi.ts` — a small data-fetching hook with explicit `loading` / `error` /
  `success` states (Section 10.27 — never silently shows a fabricated zero on failure).
- `src/hooks/useScenario.tsx` — a React context holding the globally-selected capacity /
  eligibility / participation scenario, shared across the Dashboard and Scenario Lab.
- `src/components/` — shared UI: `Layout` (nav/footer), `Badges` (evidence-class and
  event-state visual semantics), `AsyncBoundary` (loading/error rendering), `KpiCard`,
  `ScenarioSelector`.
- `src/charts/` — Recharts wrappers: `LoadChart`, `FlexibilityChart`, `RenewableChart`,
  `TransformerContributionChart`.
- `src/pages/` — one component per route (see `PHASE10_UI_SPECIFICATION.md`).

## Why this split

The backend owns all numeric computation that touches the validated artifacts (aggregation,
filtering, unit conversion) so the frontend never re-derives a research number independently —
this keeps the "single source of truth" property Sections 10.2/10.29 require. The frontend owns
presentation, scenario selection, and playback state only.
