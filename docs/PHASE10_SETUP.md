# Phase 10 — Local Setup

## Prerequisites

- Python 3.13 (backend)
- Node.js 22 / npm 10 (frontend)

Both were verified available in this environment; no other runtime dependency is required.

## 1. Backend

```bash
cd backend
python -m venv .venv          # optional
.venv\Scripts\activate         # Windows; source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Verify: `curl http://127.0.0.1:8000/api/health` → `{"status":"ok",...}`.
Interactive docs: `http://127.0.0.1:8000/docs`.

## 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Verify: open `http://localhost:5173`. The frontend reads `VITE_API_BASE_URL` (default
`http://127.0.0.1:8000`, see `frontend/.env.example`) to reach the backend — copy to
`.env.local` only if you need to override it (e.g. a different backend port).

## 3. Run tests

```bash
cd backend
python -m pytest tests/ -v
```

22 tests, including Section 10.29's data-consistency checks against the validated Phase 7/8/9
artifacts directly.

```bash
cd frontend
npm run build      # TypeScript compile + production bundle
npm run lint        # oxlint
```

## Data location

No environment variable is needed to locate the research data — `backend/app/core/config.py`
resolves `phase3_data/` relative to the repository root (`backend/../phase3_data`). If you move
the backend directory, update `BACKEND_ROOT`/`REPO_ROOT` in that file accordingly.

## Ports

| Service | Default port | Override |
|---|---|---|
| Backend (FastAPI/uvicorn) | 8000 | `uvicorn app.main:app --port <N>` |
| Frontend (Vite dev server) | 5173 | `vite.config.ts`'s `server.port`, or `npm run dev -- --port <N>` |

If you change the backend port, update `VITE_API_BASE_URL` in `frontend/.env.local` and
`CORS_ORIGINS` in `backend/app/core/config.py` to match the frontend's actual origin.
