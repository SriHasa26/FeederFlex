# FeederFlex Backend

A read-only FastAPI service over the validated Phase 4-9 FeederFlex simulation pipeline. It is a
**simulation/demonstration API**, not a live grid-control system — see
`docs/PHASE10_LIMITATIONS.md`. It never writes to `phase3_data/`, never re-runs any simulation,
and exposes no control endpoint.

## Setup

```bash
cd backend
python -m venv .venv        # optional but recommended
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

The API is then available at `http://127.0.0.1:8000`, interactive docs at
`http://127.0.0.1:8000/docs`.

## Test

```bash
python -m pytest tests/ -v
```

22 tests cover every endpoint plus Section-10.29 data-consistency checks against the validated
Phase 7/8/9 artifacts directly.

## Architecture

- `app/core/config.py` — paths and scenario constants (all inherited unchanged from Phase 7/8/9)
- `app/services/data_loader.py` — loads every validated artifact once at startup into an
  in-memory, read-only `DataStore`; per-scenario hourly/control-log files are lazily cached
- `app/schemas/models.py` — typed Pydantic response models, every power/energy field unit-suffixed
- `app/api/*.py` — routers, one per resource group (feeder, forecast, flexibility/controller,
  topology, scenarios, research)
- `app/main.py` — FastAPI app, CORS, startup data load

See `docs/PHASE10_API_SPEC.md` for the full endpoint list and `docs/PHASE10_DATA_FLOW.md` for
which validated artifact backs each endpoint.

## Data source

All data is read from `../phase3_data/processed/phase{4c,4b,6,7,8,9}/`, resolved relative to the
repository root. No environment variable is required to point at it.
