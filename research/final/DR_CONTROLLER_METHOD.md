# DR Controller Method (Phase 8, gap-closed)

## Architecture

A deterministic, single-threaded, hour-by-hour simulation: shortfall detection → required
flexibility → candidate filtering (static + dynamic) → constrained ranking → minimum-intervention
selection → curtailment → staggered restoration → event-state classification. No ML model, no
MILP, no reinforcement learning — an explicit, auditable heuristic.

## Shortfall model

```
shortfall_w = max(0, net_demand_w − renewable_w − permitted_import_w)
```

Two separate capacity scenarios, never combined: `assumed_nameplate_capacity` (derived from
Phase 4C's plausibility-anchored 25 kVA × 11 transformers × 0.9 assumed power factor = 247,500 W;
produces 0 shortfall hours across the whole modeled period) and `assumed_stress_test` (a
separate, explicitly illustrative ceiling — the 55th percentile of the feeder's own real/derived
load distribution, 7,511.1 W — chosen only to produce enough shortfall hours, 509 of 1,491, to
demonstrate the controller).

## Ranking (deterministic, explicit components)

Primary key: descending current power (minimizes the number of interventions needed to reach a
target — Section 8.8's minimum-intervention objective). Secondary key: a fairness penalty
(cumulative household contribution + same-day interruption count) that reduces, but does not
eliminate, repeated selection of the same households among power-equivalent candidates. Tertiary:
runtime slack. Final: `appliance_id` for full determinism.

## Constraint enforcement (gap-closed)

Minimum runtime, cooldown, and daily interruption-count limits are enforced as pool filters.
**Maximum interruption duration is a hard, unconditional limit**, measured in modeled simulation
steps (not calendar time — the underlying dataset has real multi-week gaps that make calendar-
time duration measurement meaningless). An appliance that reaches its duration limit is
force-restored immediately, bypassing the staggered-restoration batch throttle entirely; the
batch throttle (5/hour) applies only to voluntary early restorations. Verified: 0 of 6,175
restorations in the primary demonstration scenario exceed the 2-step limit.

## What was found and fixed (not hidden)

An earlier version of this controller let realized interruption duration reach ~18.5 hours mean
(up to ~925 hours in one traced case, due to calendar-time measurement across a real 37-day
dataset gap) against a nominal 2-step cap. Root-caused, fixed (step-based duration + unconditional
deadline restoration), and permanently regression-guarded. A second, independent bug
(`available_flexibility_w` accounting) was found while verifying the first fix and also
corrected. Full detail: `phase3_data/processed/phase8/reports/PHASE8_DURATION_GAP_CLOSURE.md`.

## Validation

24/24 automated checks pass, including the gap-closure regression guards, covering: protected-
load, opt-out, minimum-runtime, cooldown, interruption-limit, and maximum-duration violations
(all 0); aggregation integrity; utilization ≤100%; bit-identical reproducibility.
