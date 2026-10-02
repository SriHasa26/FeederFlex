# Deployment Readiness

**No deployment has been performed.** This document describes readiness and a recommended
architecture only, per Section 11.28's explicit instruction.

## Recommended architecture

```
Frontend (static build)  →  Vercel (or equivalent static host)
Backend (FastAPI)        →  Render / Railway / Fly.io (or equivalent container/PaaS host)
Data                     →  Read-only, packaged/precomputed research artifacts bundled into
                             the backend's own container image (NOT the full raw research tree)
```

## Data packaging strategy

**Do not deploy the full `phase3_data/` tree publicly.** It contains intermediate research
artifacts (scripts, validation logs, provenance registers) not needed by the running API. A
deployment build should package only:

- The specific Parquet/CSV/JSON files `backend/app/services/data_loader.py` actually reads
  (enumerated in `docs/PHASE10_DATA_FLOW.md`'s table) — roughly the `phase4b/population`,
  `phase4c/{feeder,metrics,timeseries}`, `phase6/{features,forecasts,metrics}`,
  `phase7/scenarios`, `phase8/{scenarios,control_logs,metrics}`, and `phase9/{baseline,
  counterfactual,evaluation,metrics}` subdirectories.
- Raw source data (`phase3_data/raw/`, `phase3_data/sources/`) and the full per-phase `scripts/`
  and intermediate `validation/` directories should NOT be included in a public deployment
  image — they are of research/audit value, not runtime value, and needlessly enlarge the
  public attack/exposure surface.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | Frontend build | Points the built frontend at the deployed backend's public URL |
| `FEEDERFLEX_API_HOST` / `FEEDERFLEX_API_PORT` | Backend (optional) | Local-dev convenience only; a PaaS host typically injects its own `PORT` |

No secret/API-key environment variable is required anywhere — the backend calls no external
service.

## Build / start commands

```bash
# Backend
pip install -r backend/requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT   # from backend/

# Frontend
cd frontend && npm ci && npm run build              # outputs frontend/dist/, served as static files
```

## CORS

Update `backend/app/core/config.py`'s `CORS_ORIGINS` to the deployed frontend's actual origin
before deploying (it currently allows only local dev origins by design).

## Security considerations for a real deployment

- Keep the API read-only (`GET` only) — no control endpoint should ever be added without a
  separate, explicit security review.
- Do not expose the raw `phase3_data/` filesystem tree via any static file server.
- Add rate limiting at the PaaS/CDN layer if public traffic is expected (not implemented at the
  application layer today).
- Consider adding a lightweight cache-control header strategy for the mostly-static reference
  endpoints (`/api/transformers`, `/api/appliances`, `/api/evidence`, `/api/limitations`) to
  reduce backend load, since the underlying data never changes at runtime.

## What is explicitly NOT ready

- No authentication layer (not required for a public demo; would be required before any
  operational use).
- No production-grade logging/monitoring/alerting configuration.
- No load testing has been performed — see `docs/PHASE10_LIMITATIONS.md` and this document's
  own scope note. Traffic expectations for a hackathon demo are low; this has not been validated
  for higher scale.
