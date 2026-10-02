# Forecasting Method (Phase 6)

## Load forecasting

Four models at four horizons (1h, 2h, 3h, 4h ahead): persistence (naive last-value), seasonal
persistence, linear regression, and XGBoost — trained on a **chronological** (never randomly
shuffled) split of the feeder's own hourly load history, to prevent look-ahead leakage. A
6-check leakage audit (future-target, future-weather, shuffling, train-only preprocessing,
rolling-stat future leakage, train-only normalization) passed 6/6.

**1-hour-ahead MAE by model** (real, measured against held-out historical data):

| Model | MAE (W) |
|---|---:|
| Persistence | 1,758.1 |
| Seasonal Persistence | 4,435.8 |
| Linear Regression | 3,088.0 |
| XGBoost | 3,233.1 |

Persistence outperforms both ML models at 3 of 4 tested horizons — reported as a real, measured
finding, not adjusted to favor the more sophisticated models.

## Renewable availability forecasting

Normalized [0,1] PV availability (`pv_availability = clip(0.8 × GHI/1000, 0, 1)`, DERIVED from
real Open-Meteo GHI) forecast via persistence and seasonal-persistence baselines. This is
dimensionless availability, never a generation forecast in kW/MW — no installed PV capacity
exists anywhere in this project.

## Uncertainty quantification

Empirical 80% prediction intervals computed from validation-set residuals only (never test-set
residuals, to avoid contaminating the held-out evaluation). Explicitly **not** a calibrated
probabilistic guarantee — stated as such in every report that references it.

## What Phase 8/9's controller actually uses

**The Phase 8 dispatch controller does not consume any Phase 6 forecast output.** Dispatch is a
**retrospective simulation** driven by actual/derived historical load (the same feeder load
Phase 6 forecasts against, used here as ground truth, not as a forecast). This is stated
explicitly to prevent the false impression that FeederFlex demonstrates prospective, forecast-
driven real-time dispatch — it demonstrates the flexibility-estimation and controller mechanism
against historical fact.

## Training data limitation

Weather/PV data covers only 2013-06-07 to 2013-09-18 (Delhi) — no other period was acquired;
forecast performance outside this window and season is unknown.
