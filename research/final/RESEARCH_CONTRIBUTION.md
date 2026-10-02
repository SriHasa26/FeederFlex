# Research Contribution

**Cautious research language throughout — no claim of novelty or breakthrough beyond what the
evidence in Phases 4-11 actually supports.**

## What is demonstrated

1. A fully-labeled, end-to-end, reproducible **software-only demand-response simulation
   pipeline**, from raw dataset acquisition through a working full-stack demonstration
   application, built entirely on real/derived open datasets with every synthetic value
   explicitly classified.
2. A **synthetic Indian low-income household/feeder construction method** anchored to cited real
   ranges (CEA transformer capacity, BEE/BIS/state-government appliance-power references) rather
   than freely invented values.
3. A **renewable-aware shortfall model** built on normalized, dimensionless PV availability
   derived from real GHI, never conflated with measured generation.
4. An **appliance-level flexibility estimation methodology** that distinguishes AVAILABLE_NOW
   from POTENTIAL_LATER, enforces protected-load rules, and reports a genuine zero-flexibility
   finding under its own evidence-backed taxonomy rather than adjusting the taxonomy to produce a
   more favorable headline number.
5. A **constrained, deterministic, explainable DR dispatch controller** validated to zero
   constraint violations, including after a real defect (duration enforcement) was found,
   investigated, and fixed in a dedicated, documented gap-closure pass — a demonstrated
   commitment to correctness over a more impressive-looking (but wrong) result.
6. A **demonstrated participation-sensitivity pattern**, showing how outcomes differ between a
   data-limited (n=1) and a data-rich eligible appliance pool.
7. A **rigorous evidence-classification discipline** (Supported / Conditional-Counterfactual /
   Not-established) applied consistently from the research pipeline through to the demonstration
   application's own UI — including two further genuine defects found and fixed during Phase 11's
   own testing rather than shipped silently.

## What is not claimed

Real-world DR feasibility, a validated feeder model, hardware feasibility, real household
adoption, or any measured savings/cost advantage. See `CLAIM_MATRIX.md` Category C.

## Honest answer to the primary research question

Under the evidence-backed appliance population currently modeled, no meaningful flexibility
exists (0 W). Under an illustrative, broader controllability assumption, a working, validated
controller mechanism can deliver up to 63.4% of a modeled shortfall's energy using only
appliance-level control — no battery, no PV, and no smartphone/Wi-Fi dependency built into the
dispatch mechanism itself. Whether real households would configure appliances this way, whether
the 9 unprofiled types would change the answer, and whether the underlying communication channel
is practically feasible all remain open.
