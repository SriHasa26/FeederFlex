# FeederFlex Frontend

A React + TypeScript + Vite demonstration UI for the validated FeederFlex simulation pipeline.
**Simulation / demonstration only** — see `../docs/PHASE10_LIMITATIONS.md`.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`. Requires the backend running at `http://127.0.0.1:8000` (see
`../backend/README.md`) — override with `VITE_API_BASE_URL` in a `.env.local` file (see
`.env.example`).

## Build

```bash
npm run build     # TypeScript check + production bundle to dist/
npm run lint       # oxlint
npm run preview     # serve the production build locally
```

## Structure

- `src/types/api.ts` — TypeScript interfaces mirroring the backend's Pydantic schemas
- `src/services/api.ts` — typed fetch client
- `src/hooks/` — `useApi` (loading/error/success data fetching), `useScenario` (shared
  capacity/eligibility/participation selection context)
- `src/components/` — shared UI (nav layout, evidence/event-state badges, KPI cards, async
  loading/error boundary, scenario selector)
- `src/charts/` — Recharts wrappers (load, flexibility, renewable, transformer-contribution)
- `src/pages/` — one component per route: Landing, Dashboard, Transformers, Households,
  Appliances, ScenarioLab, Results, Methodology, Evidence, Limitations

See `../docs/PHASE10_UI_SPECIFICATION.md` for the full route/behavior spec and
`../docs/PHASE10_DATA_FLOW.md` for which backend endpoint (and ultimately which validated
research artifact) backs each piece of the UI.

## Design principles this codebase follows

- Every power/energy value keeps its unit in code and in the UI (`formatW`, `formatWh` in
  `src/utils/format.ts`) — never a bare number.
- `AsyncBoundary` is used for every data-dependent view so a failed API call renders an explicit
  error, never a misleading fabricated zero.
- Evidence-backed (Class A) and counterfactual/illustrative (Class B) results are always
  labeled with a distinct, consistent badge (`src/components/Badges.tsx`) and never visually
  implied to carry equal evidentiary weight.
