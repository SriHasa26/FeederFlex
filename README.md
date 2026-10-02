# FeederFlex

Software-only demand flexibility for renewable-aware neighbourhood grid reliability — a
**research simulation**, not a live DISCOM control system.

## 1. Overview

FeederFlex investigates whether automated, appliance-level demand response can provide
meaningful evening feeder flexibility for low-income Indian households, without household
batteries, rooftop solar, smartphones, or Wi-Fi. It is an end-to-end, ten-phase pipeline —
real-data ingestion through synthetic household/feeder construction, forecasting, flexibility
estimation, a constrained dispatch controller, a final research evaluation, and a full-stack
demonstration application — with every value explicitly labeled REAL / DERIVED / SYNTHETIC /
METHODOLOGICAL_ASSUMPTION.

**Headline finding: under the evidence-backed baseline (the currently-modeled, real-profiled
appliance population), available flexibility is 0 W.** Under an explicitly labeled, illustrative
counterfactual controllability assumption, the same controller demonstrates up to 846,511.5 Wh
of curtailed energy and 63.4% shortfall coverage at 90% participation. Both results, and the
distinction between them, are central to this project — see `research/final/ABSTRACT.md`.

## 2. The problem

See `research/final/PROBLEM_STATEMENT.md`. In short: low-income neighbourhood feeders face
evening peaks just as solar falls away, typically without battery or rooftop-solar access.

## 3. Architecture

```
Real/derived source data → Synthetic households/feeder → Baseline simulation →
Forecasting → Flexibility estimation → DR controller → Evaluation → Backend API → Frontend
```

Full detail: `research/final/SYSTEM_ARCHITECTURE.md`, `docs/PHASE10_ARCHITECTURE.md`.

## 4. Repository structure

```
phase3_data/processed/phase4a..phase9/   FROZEN validated research pipeline (never modified by
                                          the application layer)
backend/                                  FastAPI, read-only API over the validated pipeline
frontend/                                 React + TypeScript + Vite demonstration UI
docs/                                     Phase 10/11 technical + demo documentation
research/final/                           Final research documentation (this phase's own writeup)
research/*.pdf                            The project's own foundational specification/audit
```

## 5. Research pipeline (phases)

| Phase | Output |
|---|---|
| 4A-4D | Real data audit, synthetic household/appliance population |
| 4C | Feeder topology (100 households, 11 transformers) |
| 5 | Baseline hourly load simulation |
| 6 | Load + renewable forecasting |
| 7 | Appliance-level flexibility estimation |
| 8 (+ gap closure) | Constrained DR dispatch controller |
| 9 | Final evaluation, evidence classification |
| 10 | Full-stack demonstration application |
| 11 | Final validation, documentation, demo readiness (this phase) |

Full methodology: `research/final/METHODOLOGY.md` and the phase-specific `*_METHOD.md` files
alongside it.

## 6. Technology stack

**Backend**: Python 3.13, FastAPI, Uvicorn, pandas, pyarrow, Pydantic, pytest.
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, React Router, Playwright.
Exact versions: `backend/requirements.txt`, `frontend/package.json`.

## 7. Running the backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # optional
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Verify: `http://127.0.0.1:8000/api/health`. Docs: `http://127.0.0.1:8000/docs`.

## 8. Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Requires the backend running at `http://127.0.0.1:8000` (override
via `VITE_API_BASE_URL`, see `frontend/.env.example`).

## 9. Testing

```bash
cd backend && python -m pytest tests/ -v        # 23 tests
cd frontend && npm run build                     # TypeScript + production bundle
cd frontend && npx playwright install chromium   # once
cd frontend && npx playwright test               # 25 E2E tests (backend + frontend must be running)
```

Full validation record: `docs/FINAL_VALIDATION_MATRIX.md`.

## 10. Demo flow

3-minute and 5-minute scripted walkthroughs, exact screens and numbers to show:
`docs/FINAL_DEMO_GUIDE.md`. Anticipated judge questions: `docs/JUDGE_QA.md`.

## 11. Results

Canonical numeric table: `research/final/RESULTS_TABLE.md`. Full evaluation narrative:
`research/final/EVALUATION_RESULTS.md`. Live in the app: `/results`.

## 12. Limitations

Full audit (24 items): `research/final/LIMITATIONS.md`. Live in the app: `/limitations`,
`GET /api/limitations`. Highlights: only 4/13 appliance types profiled; synthetic feeder/capacity
not field-validated; no real household participation; no hardware or SCADA integration.

## 13. Provenance

Every value in the research pipeline carries a REAL / DERIVED / SYNTHETIC /
METHODOLOGICAL_ASSUMPTION label. Source datasets and citations: `research/final/REFERENCES.md`,
`research/final/DATA_SOURCES_AND_PROVENANCE.md`.

## 14. Research status

**READY FOR FINAL DEMO** as of Phase 11 (see the phase's own final status report for the full
validation matrix). The scientific pipeline (Phase 4A-9) is frozen; the application layer
(Phase 10-11) is tested (23 backend tests, 25 E2E tests) and consistent with it. This project
does not claim real-world deployment feasibility, field validation, or measured outcomes — see
`research/final/CLAIM_MATRIX.md` for exactly what is and is not established.
