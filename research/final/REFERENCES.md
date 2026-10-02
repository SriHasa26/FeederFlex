# References

**Only sources actually used and already cited within this project's own Phase 3/4A
documentation are listed here. No citation has been invented for this document.**

## Datasets

- Batra, N. et al. **iAWE** — appliance-level submetered energy dataset, single Delhi household
  ("building1"), 12 meters, 2013-05-24 to 2013-09-18. BuildSys 2013. (Cited internally at
  `phase3_data/processed/phase4a/PHASE4A_GAP_CLOSURE_REPORT.md`.)
- Gupta et al. (2025). Mumbai household ownership/energy reference data (Mathura/Bareilly
  household energy files; Mumbai appliance-ownership reference). (Cited internally at
  `phase3_data/processed/phase4a/PHASE4A_GAP_CLOSURE_REPORT.md`.)
- **Open-Meteo Historical Weather API** (`https://archive-api.open-meteo.com/v1/archive`),
  underlying reanalysis: ECMWF ERA5 / ERA5-Land. Data license CC BY 4.0.
  (`phase3_data/sources/weather/WEATHER_SOURCE_METADATA.md`.)

## Standards and reference documents (appliance parameters, transformer capacity)

- Central Electricity Authority (CEA), distribution feeder planning-criteria document — cited
  range for small single-phase HVDS distribution transformer capacity (10-50 kVA).
- Bureau of Energy Efficiency (BEE), **Schedule 12 — Washing Machines**
  (`https://beeindia.gov.in/sites/default/files/Schedule12-WM.pdf`).
- **IS 8034:2002** — Submersible Pumpsets Specification, Bureau of Indian Standards
  (`https://law.resource.org/pub/in/bis/S08/is.8034.2002.pdf`).
- Kerala State Energy Department — **Guide on Energy-Efficient Home Refrigerator**
  (`https://keralaenergy.gov.in/images/pdf/conervation_tip/Guide%20on%20Energy-Efficient%20Home%20Refrigerator.pdf`).
- Khanna, Martin & Muûls — POWBAL paper, cited for refrigerator rated/compressor power
  (100-200 W range). (Cited internally at `phase3_data/sources/APPLIANCE_PARAMETER_EVIDENCE.md`.)

## Internal foundational documents

- `research/FeederFlex Phase 2 — System Specification v1.0.pdf` — the project's own governing
  specification (appliance flexibility rules including Rule 8 AC Never-Control default, evening
  demand-response window definition, renewable-availability modeling approach).
- `research/FeederFlex Phase 3 — Data Source Audit (Stage 1).pdf` — the project's own initial
  data-source audit preceding Phase 4A.
- `research/FeederFlex Research Audit Report.pdf` — the project's own research audit.

## Software

FastAPI, Uvicorn, pandas, pyarrow, Pydantic, pytest, httpx (backend); React, TypeScript, Vite,
Tailwind CSS, Recharts, React Router, Playwright (frontend/testing). Exact versions:
`docs/PHASE10_VALIDATION.md`'s dependency audit / `backend/requirements.txt` /
`frontend/package.json`.
