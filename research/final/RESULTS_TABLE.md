# Canonical Results Table

**Every value below traces to Phase 9's validated evaluation outputs
(`phase3_data/processed/phase9/`), re-verified live against the running backend API during
Phase 11. Capacity scenario: `assumed_stress_test` (509/1,491 shortfall hours) unless noted.**

## Evidence-backed baseline (Class A)

| Participation | Shortfall (Wh requested) | Available flex. (W) | Delivered (Wh) | Unmet (Wh) | Peak reduction | Evening reduction | Interventions |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 30% | 1,335,086.3 | 0.0 | 0.0 | 1,335,086.3 | 0.0 W | 0.0 W | 0 |
| 50% | 1,335,086.3 | 0.0 | 0.0 | 1,335,086.3 | 0.0 W | 0.0 W | 0 |
| 70% | 1,335,086.3 | 0.0 | 0.0 | 1,335,086.3 | 0.0 W | 0.0 W | 0 |
| 90% | 1,335,086.3 | 0.0 | 0.0 | 1,335,086.3 | 0.0 W | 0.0 W | 0 |

Under `assumed_nameplate_capacity`: 0 shortfall hours at any participation rate (N/A for all
ratio metrics).

## Counterfactual AC-enabled (Class B — illustrative)

| Participation | Delivered (Wh) | Unmet (Wh) | Peak reduction | Interventions | Utilization |
|---:|---:|---:|---:|---:|---:|
| 30% | 113,810.7 | 1,260,260.0 | 0.0 W | 46 | 47.3% |
| 50% | 0.0 | 1,335,086.3 | 0.0 W | 0 | N/A |
| 70% | 0.0 | 1,335,086.3 | 0.0 W | 0 | N/A |
| 90% | 113,810.7 | 1,260,260.0 | 0.0 W | 46 | 47.3% |

## Counterfactual Broad (Class B — illustrative)

| Participation | Delivered (Wh) | Unmet (Wh) | Peak reduction | Evening reduction | Interventions | Utilization | Coverage |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 30% | 347,188.1 | 1,034,708.6 | 1,978.4 W (10.4%) | 123.3 W | 1,955 | 70.8% | 26.0% |
| 50% | 413,131.8 | 942,739.4 | 1,603.3 W (8.4%) | 0.8 W | 3,497 | 85.4% | 30.9% |
| 70% | 580,914.0 | 796,853.3 | 1,603.3 W (8.4%) | 0.0 W | 4,755 | 80.7% | 43.5% |
| 90% | 846,511.5 | 594,622.0 | 3,200.8 W (16.8%) | 124.6 W | 6,175 | 63.8% | 63.4% |

## Curtailment duration (primary scenario: assumed_stress_test / counterfactual_broad / 90%)

| Metric | Value |
|---|---:|
| Maximum realized duration | 2.0 modeled steps |
| Mean realized duration | 1.95 modeled steps |
| Maximum allowed (hard limit) | 2.0 modeled steps |
| Number exceeding limit | 0 (of 6,175 restorations) |

## Constraint violations (all scenarios, all participation rates)

| Violation type | Count |
|---|---:|
| Protected-load | 0 |
| Opt-out | 0 |
| Minimum-runtime | 0 |
| Cooldown | 0 |
| Interruption-limit | 0 |
| Maximum-duration | 0 |
| Flexibility utilization >100% | 0 |

## Population constants

| Quantity | Value |
|---|---:|
| Synthetic households | 100 (66 SRH-Mumbai, 34 Slum-Mumbai) |
| Transformers | 11 |
| Owned appliance types | 13 |
| Profiled appliance types (real load curve) | 4 (refrigerator, air conditioner, laptop, television) |
| Modeled hours | 1,491 (2013-06-07 to 2013-09-18) |
