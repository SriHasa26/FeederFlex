# Synthetic Feeder Method

## Households (Phase 4B)

100 synthetic households across 2 archetypes (SRH-Mumbai: 66, Slum-Mumbai: 34 — see
`PHASE7_FAIRNESS_ANALYSIS.md`/Phase 4B for the exact split), each with a Bernoulli-realized
appliance ownership set drawn from real ownership-probability reference data (seed=42). Rated
power per owned appliance instance is REAL where a reference source exists (e.g. refrigerator
100-200 W, POWBAL paper), otherwise NOT_AVAILABLE and explicitly left unfilled.

## Appliance load profiles (Phase 4B)

Only 4 of 13 owned appliance types have a real load-profile source (all from the single iAWE
donor household): refrigerator, air conditioner, laptop computer, television ("Tier A" profile).
Every synthetic instance of these 4 types reuses the single iAWE donor's real profile SHAPE as a
**shared source profile** — up to 93 households share one real trace — an explicit, documented
limitation, not per-household diversity. The remaining 9 owned types are "Tier D": owned
(SYNTHETIC realization) but with no load curve generated, ever (never estimated to fill the gap).

## Feeder topology (Phase 4C)

100 households are assigned to 11 distribution transformers via a seeded, archetype-stratified
shuffle-then-chunk method (seed=4242), each transformer rated 25 kVA — a plausibility anchor
citing a real CEA planning-document range (10-50 kVA for small single-phase HVDS transformers),
explicitly NOT a validated rating for this specific synthetic feeder. Household loads are
aggregated to transformer level, then to feeder level, at Phase 4C's canonical hourly resolution
(1,491 modeled hours, 2013-06-07 to 2013-09-18, reflecting the real iAWE/weather data's actual
coverage window with some real gaps preserved, e.g. a 37-day-16-hour gap in August-September).

## Baseline simulation (Phase 5)

An uncontrolled, deterministic hourly load simulation over the full feeder — no flexibility,
forecasting, or control logic exists at this stage. This is the "baseline" load curve every
later phase's controlled/counterfactual comparison is measured against.

## What this method does NOT do

It does not claim the 100-household population is a statistically representative sample of any
real neighbourhood; it does not claim the 25 kVA transformer rating is field-validated for any
specific real feeder; it does not claim the shared-profile appliances represent genuine
household-to-household behavioral diversity.
