# Evaluation Results (Phase 9)

Full detail: `phase3_data/processed/phase9/reports/`. Canonical numeric table:
`research/final/RESULTS_TABLE.md`. All values re-verified live against the running backend API
during Phase 11 (see `docs/PHASE10_VALIDATION.md`).

## 1. Evidence-backed baseline

0 W available flexibility, 0 interventions, at every participation rate (30/50/70/90%), under
either capacity scenario. Under `assumed_stress_test` capacity (509 shortfall hours exist to
test against), 100% of the 1,335,086.3 Wh requested flexibility over the modeled period remains
unmet.

## 2. Shortfall coverage

`shortfall_coverage = delivered / requested`, never divided by zero (reported N/A, not 0%/100%,
when nothing was requested). Baseline: 0.0%. `assumed_nameplate_capacity`: N/A (0 shortfall
hours). `counterfactual_broad` @ 90%: 63.4% — the highest coverage achieved anywhere in this
project, still leaving 36.6% (594,622.0 Wh) unmet.

## 3. Counterfactual results

`COUNTERFACTUAL_BROAD` @ 90% participation: peak reduction 3,200.8 W (16.8% of modeled peak),
curtailed energy 846,511.5 Wh, 6,175 interventions, 0 constraint violations.
`COUNTERFACTUAL_AC_ENABLED` is driven entirely by n=1 sampling variance (one AC-owning household)
— non-monotonic across participation, a verified data artifact, not a controller defect.

## 4. Participation sensitivity

Flat (0 W) under `baseline` at every rate. Erratic under `counterfactual_ac_enabled` (n=1).
Monotonically increasing delivered energy/interventions under `counterfactual_broad`
(347,188.1 Wh @ 30% → 846,511.5 Wh @ 90%); peak reduction and utilization are NOT strictly
monotonic, reported exactly as computed.

## 5. Controller-assumption sensitivity

Minimum runtime, cooldown, and maximum interruption duration each independently swept (explicit
values only, never randomly perturbed). All three show the qualitatively expected direction
(stricter constraint → less delivered energy) except duration, which is cleanly monotonic in the
intuitive direction only after the gap-closure fix.

## 6. Fairness

Descriptive only — no fairness score or equalization objective exists in the validated
methodology. 85 of 100 households received at least one intervention in the primary
demonstration scenario; median 69, max 150, mean 72.6 interventions.

## 7. Controller correctness (reconfirmed, Phase 9 and again in Phase 11)

0 protected-load, opt-out, minimum-runtime, cooldown, interruption-limit, and maximum-duration
violations across every tested scenario. Flexibility utilization never exceeds 100%.
Reproducibility bit-identical on re-run.

## 8. Forecast context

Phase 6's forecast accuracy is real and measured (see `FORECASTING_METHOD.md`), but is **not**
consumed by the Phase 8 controller — the evaluation above describes a retrospective simulation,
not a prospective forecast-driven dispatch.
