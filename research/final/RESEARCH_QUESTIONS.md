# Research Questions

## Primary

**RQ0.** Can automated appliance-level demand response provide meaningful evening feeder
flexibility for low-income Indian households, without household batteries, rooftop solar,
smartphones, or Wi-Fi? — see `ABSTRACT.md` for the headline answer split by evidence class.

## Supporting questions (Phase 9's own evaluation structure, unchanged)

1. What happens under the evidence-backed baseline? — `EVALUATION_RESULTS.md` §1
2. What happens when a modeled shortfall occurs? — `EVALUATION_RESULTS.md` §2
3. How much demand reduction can the controller provide under explicitly defined counterfactual
   controllability assumptions? — `EVALUATION_RESULTS.md` §3
4. How much shortfall remains unmet? — `EVALUATION_RESULTS.md` §2, §3
5. How does performance change with participation? — `EVALUATION_RESULTS.md` §4
6. How sensitive are results to controller assumptions (minimum runtime, cooldown, interruption
   duration)? — `EVALUATION_RESULTS.md` §5
7. How fairly are interventions distributed across households? — `EVALUATION_RESULTS.md` §6
8. What are the actual limitations of the approach? — `LIMITATIONS.md`
9. Which claims are supported by the simulation, and which are not? — `CLAIM_MATRIX.md`

## What this project does not attempt to answer

- Whether real low-income households would actually adopt or tolerate appliance-level DR
  (requires field study, not simulation).
- Whether a specific communication technology (USSD, LoRa, missed-call) is technically or
  economically viable for this population (explicitly out of scope for every phase).
- Whether this approach is more cost-effective than battery storage or rooftop solar (no
  economic model exists in this project).
- Whether the findings generalize beyond the two synthetic archetypes (SRH-Mumbai, Slum-Mumbai)
  modeled here.

Every research question above is answered using only the validated Phase 4-9 pipeline's own
outputs — no new computation was introduced to answer them.
