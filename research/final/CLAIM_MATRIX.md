# Claim Matrix (Phase 9 Evidence Classification)

Machine-readable equivalent: `GET /api/evidence`; UI: `/evidence`. Reproduced here verbatim as
the canonical research-document version.

## A. SUPPORTED BY SIMULATION

- Under the evidence-backed baseline, available flexibility is 0 W at every hour and every
  participation rate tested — a genuine, verified finding, not a defect.
- The dispatch controller enforces every tested constraint (protected-load, opt-out, minimum
  runtime, cooldown, interruption-count, maximum duration) with 0 violations across all 13
  tested capacity × eligibility × participation combinations.
- Under Phase 4C's plausibility-anchored (not field-validated) transformer capacity, this
  feeder's modeled demand never produces a shortfall in the modeled data.
- Phase 6's load-forecast models are measurably more/less accurate than a persistence baseline
  at specific horizons, on real historical held-out data.
- The controller's outputs are deterministic and bit-identical on re-run.

## B. CONDITIONAL / COUNTERFACTUAL

- IF appliance-level controllability were expanded to include AC, laptop, and television (a
  hypothetical assumption, not evidence-backed), the controller can deliver up to 846,511.5 Wh
  of curtailed energy and cover up to 63.4% of a modeled shortfall's requested energy at 90%
  participation.
- IF the same expanded controllability is assumed, peak reduction of up to 16.8% of modeled
  synthetic feeder peak is achievable in this dataset.
- IF participation is assumed to reach 90% (an assumed scenario, not a measured or targeted
  rate), dispatch volume metrics scale up roughly monotonically under the broad counterfactual
  scenario.
- IF an ASSUMED stress-test import ceiling is imposed (not a real capacity constraint), the
  feeder experiences a modeled shortfall in 509 of 1,491 hours.

## C. NOT ESTABLISHED

- That any real household has participated, would participate, or has been asked to participate.
- That this pipeline's synthetic feeder, households, or appliance profiles represent a
  statistically valid sample of real low-income Indian households or feeders.
- That any real DISCOM, SCADA system, or grid operator has integrated with, tested, or endorsed
  this pipeline.
- That the illustrative capacity, threshold, or fairness-weight values reflect real operational
  constraints.
- That any hardware required to actually implement this control mechanism has been built,
  specified, or costed.
- That this approach is cheaper, more effective, or preferable to battery storage, rooftop
  solar, or any other DR/DSM alternative.
- That the 9 unprofiled appliance types would behave similarly to, better than, or worse than
  the 4 profiled types if load-profile data were obtained for them.

## Usage rule

Category A claims may be stated plainly. Category B claims must always carry the "IF
[assumption]" framing or an explicit COUNTERFACTUAL/ILLUSTRATIVE label in the same sentence.
Category C claims must never be affirmatively stated; the correct answer is "not established by
this project."
