# Flexibility Estimation Method (Phase 7)

## Eligibility taxonomy

Every owned appliance type is classified FLEXIBLE, CONDITIONALLY_FLEXIBLE,
UNCLASSIFIED_CONSERVATIVE_DEFAULT, or PROTECTED/critical, per the project's own specification
(Phase 2 Part F / Rule 8). Air conditioner defaults to Never-Control (Rule 8) unless a household
has explicitly opted for "Allow Limited DR" — no household in this population is known to have
done so.

## The central, evidence-backed finding

Cross-referencing the eligibility taxonomy against which appliance types actually have a real
load profile (4 of 13: refrigerator, air conditioner, laptop, television) produces an **empty
intersection** with Phase 2's named flexible candidates (washing machine, ceiling fan, table
fan, exhaust fan) — none of those 4 named-flexible types has real profile data. Refrigerator is
critical; air conditioner defaults to Never-Control; laptop/television are unclassified
(conservative default = protected). Result: **available_flexibility = 0 W at every hour, under
the evidence-backed `baseline` eligibility scenario** — verified both analytically and by
directly running the computation.

## Counterfactual scenarios (never evidence-backed)

Two explicitly hypothetical eligibility expansions were defined solely to exercise the
computation and support later sensitivity/controller demonstration:

- `COUNTERFACTUAL_AC_ENABLED` — additionally treats air conditioner as eligible
- `COUNTERFACTUAL_BROAD` — additionally treats air conditioner, laptop, and television as eligible

## AVAILABLE_NOW vs POTENTIAL_LATER

Only appliances that are currently ON, currently eligible, and belong to a currently-participating
household count as AVAILABLE_NOW flexibility for a given hour — an OFF appliance is never treated
as curtailable "later" without being recharacterized once it is actually on.

## Constraint model

Five distinct constraint concepts are tracked with separate state fields (never collapsed into
one): maximum interruption duration, maximum interruption count, minimum runtime, cooldown
duration, and restoration requirement. All numeric thresholds are explicitly ASSUMED/illustrative
— zero evidence-backed values exist anywhere in the source appliance data for these thresholds.

## Participation

Household-level participation is modeled separately from ownership: a Bernoulli draw at
30/50/70/90% (seed=707) determines which households' otherwise-eligible appliances actually
count toward AVAILABLE_NOW flexibility that scenario (28/50/73/91 households respectively).
