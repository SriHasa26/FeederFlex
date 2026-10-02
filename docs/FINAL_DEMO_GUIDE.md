# FeederFlex — Final Demo Guide

**Before the demo**: start the backend (`uvicorn app.main:app --port 8000` in `backend/`) and
frontend (`npm run dev` in `frontend/`), confirm `http://127.0.0.1:8000/api/health` and
`http://localhost:5173` both respond. See `docs/PHASE10_SETUP.md`.

## Core narrative (do not skip step 6)

1. Renewable intermittency creates periods of stress on a small neighbourhood feeder.
2. FeederFlex models demand at household/transformer/feeder level from real appliance metering.
3. It forecasts demand and renewable availability (retrospectively evaluated, not live).
4. It estimates controllable flexibility under an evidence-backed appliance taxonomy.
5. It applies constrained, explainable, appliance-level DR dispatch.
6. **The evidence-backed baseline currently has 0 W controllable flexibility** — say this
   plainly; frame it as a finding, not a failure.
7. Under an explicitly labeled counterfactual controllability assumption, the controller
   demonstrates measurable modeled reductions (up to 846,511.5 Wh curtailed, 63.4% shortfall
   coverage at 90% participation).
8. The system transparently reports where flexibility is insufficient (357 of 1,491 hours in
   the primary demonstration scenario) rather than hiding the gap.

## 3-minute demo

1. **Landing (20s)** — scroll to "Evidence vs. counterfactual" section; point out the two badge
   colors are never mixed.
2. **Dashboard, baseline (40s)** — `/dashboard`, set eligibility to "Evidence-Backed Baseline".
   Point at the Flexibility panel's explanatory note: *"0 W currently controllable under
   evidence-backed eligibility... not an error."*
3. **Dashboard, counterfactual (60s)** — switch eligibility to "Counterfactual: Broad",
   participation to 90%. Scrub the timeline to a shortfall hour (event-state badge turns
   orange/red). Point at requested/available/delivered/unmet flexibility KPIs.
4. **Results (40s)** — `/results`, scroll to section 2 (Counterfactual Broad) and show the
   headline numbers match what was just seen live.
5. **Limitations (20s)** — `/limitations`, name the 4/13 appliance-coverage limitation aloud.

## 5-minute demo (adds)

6. **Controller events (30s)** — on the Dashboard, note the active-interventions count; mention
   `/api/controller/events` exposes the full per-intervention audit trail (appliance, household,
   reason, ranking score) for anyone who wants to inspect a specific decision.
7. **Restoration (20s)** — explain the two-tier restoration: hard deadline (unconditional, never
   exceeds the 2-step cap) vs. voluntary staggered (batch-throttled).
8. **Transformers/Households (40s)** — `/transformers`, click one row, show curtailed energy per
   transformer; `/households`, search one household, show its appliance list and participation
   state.
9. **Scenario Lab (30s)** — `/scenarios`, change participation 30% → 90%, show the comparison
   table updating live from the API.
10. **Evidence (30s)** — `/evidence`, show the three-category claim matrix; read one
    "NOT ESTABLISHED" item aloud (e.g. real DISCOM deployment).
11. **Methodology (20s)** — `/methodology`, point at the REAL/DERIVED/SYNTHETIC/ASSUMED
    provenance legend.

## Key numbers to have ready

| Number | Value |
|---|---:|
| Synthetic households / transformers | 100 / 11 |
| Profiled appliance types | 4 of 13 |
| Baseline available flexibility | 0 W |
| Primary counterfactual curtailed energy (90%) | 846,511.5 Wh |
| Primary counterfactual peak reduction (90%) | 3,200.8 W (16.8%) |
| Primary counterfactual shortfall coverage (90%) | 63.4% |
| Constraint violations (all scenarios) | 0 |
| Backend tests / E2E tests | 23 / 25, all passing |

## Limitations to disclose (say these, don't wait to be asked)

Only 4/13 appliance types have real load profiles; the feeder and its capacity are synthetic,
not field-validated; counterfactual results are illustrative, not measured; no real household
has participated; no hardware or SCADA integration exists. Full list: `/limitations`.
