# Reproducibility

## Research pipeline

Every phase that uses randomness fixes an explicit seed and verifies bit-identical output on
re-run:

| Phase | Seed | What it draws |
|---|---:|---|
| 4B | 42 | Appliance ownership Bernoulli realization |
| 4C | 4242 | Household-to-transformer assignment (stratified shuffle) |
| 6 | 606 | Model training (where applicable) |
| 7 | 707 | Household participation Bernoulli draws (30/50/70/90%) |
| 8 | 808 | Recorded for bookkeeping only — Phase 8 draws no new randomness, reusing Phase 7's participation draws unchanged |

Re-running any phase's computation script against unchanged inputs reproduces bit-identical
output — verified explicitly in each phase's own validation suite (e.g. Phase 8 check 8.29.20,
Phase 9 check 9.26.08).

## Application layer

The backend introduces no randomness anywhere. Given the same Phase 8/9 artifacts, every API
response is a deterministic function of the request parameters.

## Reproducing this project end-to-end

```bash
# Backend
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev

# Tests (separate terminal, backend must be running for E2E)
cd backend && python -m pytest tests/ -v          # 23 tests
cd frontend && npm run build                       # TypeScript + production bundle
cd frontend && npx playwright install chromium      # once
cd frontend && npx playwright test                  # 25 E2E tests
```

Full detail and exact verification commands: `docs/PHASE10_SETUP.md`,
`docs/FINAL_VALIDATION_MATRIX.md`.

## What is NOT reproducible from this repository alone

The original raw dataset acquisition (iAWE HDF5 file, Mathura/Bareilly CSVs, Open-Meteo API
response) is not re-fetched by any script in this repository — Phase 4A's raw inputs are treated
as a fixed, checksummed input (`phase3_data/processed/phase4a/validation/raw_file_checksums.csv`),
not re-downloaded on each run.
