# FeederFlex — Abstract

Low-income neighbourhood electricity feeders in Indian cities face evening demand peaks that
coincide with the loss of solar generation, with little operational margin and, in many
households, no battery storage or rooftop solar to fall back on. FeederFlex is a **software
simulation** investigating whether automated, appliance-level demand response (DR) — without
batteries, rooftop solar, or dependence on a smartphone/Wi-Fi in the control mechanism itself —
can provide meaningful flexibility under these conditions.

**Approach.** The project builds an end-to-end pipeline: real appliance-level metering (iAWE,
Batra et al., BuildSys 2013) and household consumption data (Mathura/Bareilly; Gupta et al.
2025, Mumbai) ground a synthetic low-income feeder (100 households across 2 archetypes, 11
transformers, anchored to a real CEA transformer-capacity range). Hourly load and normalized
renewable-availability forecasts are produced (persistence/linear-regression/XGBoost).
Appliance-level flexibility is estimated under an explicit, evidence-backed eligibility
taxonomy. A deterministic, constrained dispatch controller ranks and selects interventions
under a minimum-intervention objective, with hard-enforced runtime, cooldown, interruption-count,
and duration constraints. A final evaluation phase classifies every resulting claim as
evidence-backed, counterfactual/illustrative, or not established.

**Data.** Every value in the pipeline carries an explicit REAL / DERIVED / SYNTHETIC /
METHODOLOGICAL_ASSUMPTION label. No value is presented as measured unless it traces directly to
a real dataset.

**Main findings — evidence-backed baseline.** Under the currently-modeled, evidence-backed
appliance population (4 of 13 owned appliance types have real load profiles), **available
demand-response flexibility is 0 W at every one of the 1,491 modeled hours, at every tested
participation rate (30/50/70/90%)**. This is a genuine finding about the current appliance
population, not a system defect: none of Phase 2's named flexible appliance types (washing
machine, fans, pump) have real load-profile data in this build, and the profiled types
(refrigerator, air conditioner, laptop, television) are each either critical, defaulted to
Never-Control (air conditioner), or outside the named flexible list.

**Main findings — counterfactual.** Under an explicitly labeled, hypothetical expansion of
controllability (`COUNTERFACTUAL_BROAD`), the same controller delivers up to 846,511.5 Wh of
curtailed energy and up to 3,200.8 W (16.8%) of peak reduction at 90% participation, covering up
to 63.4% of a modeled shortfall's requested energy, with **zero constraint violations** across
every tested scenario. These results are illustrative of controller mechanism, not measured or
field-validated flexibility.

**Limitations.** Only 4/13 appliance types are profiled; the feeder and its capacity are
synthetic/methodologically-assumed, not field-validated; renewable availability is normalized
[0,1], not measured generation; no real household has participated; no hardware, SCADA, or DISCOM
integration exists. See `research/final/LIMITATIONS.md` for the full audit.

**Contribution.** A fully-labeled, reproducible, gap-closed simulation pipeline and full-stack
demonstration application for appliance-level DR research on Indian low-income feeders — not a
claim of real-world deployment feasibility.
