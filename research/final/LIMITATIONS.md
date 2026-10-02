# Limitations (Consolidated, Phase 4A-11)

**Nothing below was removed or softened to make results look more impressive.** Machine-readable
equivalent: `GET /api/limitations`; UI: `/limitations`.

## Appliance/data coverage
1. Only 4 of 13 owned appliance types have real load-profile data (refrigerator, air
   conditioner, laptop, television).
2. Up to 93 households share a single real appliance trace (shared-profile architecture) —
   limited per-household diversity by design.
3. The 9 unprofiled appliance types are known to be owned but have unknown flexibility, not zero
   flexibility.

## Resolution and modeling
4. Hourly resolution only — sub-hourly dynamics (e.g. compressor cycling) are smoothed out.
5. No power-flow, voltage, or transformer-thermal model exists anywhere in this pipeline.

## Source-data provenance
6. iAWE meter1 vs meter2 relationship investigated but unresolved (Gap 5).
7. iAWE timezone interpretation inconclusive (Gap 6) — clock-hour-sensitive results (including
   the 17:00-20:00 evening window) may be off by up to 5.5 hours.
8. Mathura/Bareilly cross-year household identity unverified (Gap M1).

## Controller/capacity assumptions
9. Counterfactual controllability (AC-enabled, Broad) is illustrative, not evidence-backed.
10. Both capacity scenarios are methodological assumptions, not real or validated grid capacity.
11. Every controller threshold (runtime, cooldown, interruption limits, duration, batch size,
    fairness weights) is an ASSUMED, illustrative value.
12. Exactly one AC-owning household exists in this population (n=1) — AC-enabled counterfactual
    results are dominated by that single household's random participation draw.
13. No real dispatch history exists prior to Phase 8's own simulation.

## Forecast/renewable
14. Phase 6's 80% prediction intervals are empirical, not a calibrated probabilistic guarantee.
15. Weather/PV training data covers only 2013-06-07 to 2013-09-18 (Delhi).
16. Renewable availability is normalized [0,1] SYNTHETIC/MODELLED availability, not measured PV
    generation; no installed PV capacity exists anywhere in this project.
17. The controller is a retrospective simulation using historical load, not a forecast-driven,
    prospective dispatch.

## Deployment/validation
18. No real household has ever participated, or been asked to participate.
19. No SCADA, IEC-104, LoRa, USSD, or hardware integration exists anywhere in this project.
20. No hardware validation — nothing has been tested against a physical meter, relay, or
    controller.

## Application-layer (Phase 10/11)
21. No authentication, no persistence layer, no production deployment configuration exists —
    see `docs/PHASE10_LIMITATIONS.md` and `docs/DEPLOYMENT_READINESS.md`.
22. The Dashboard's "playback" replays already-computed historical records on a client-side
    timer; it is not a live feed.
23. No automated end-to-end browser test suite existed prior to Phase 11; one was added
    (25 Playwright tests) but coverage is smoke-level, not exhaustive.
24. Two genuine defects were found and fixed during Phase 8 gap-closure and Phase 11's own E2E
    testing respectively (interruption-duration enforcement; an appliance-count display bug that
    included one non-feeder REAL household) — documented in
    `phase3_data/processed/phase8/reports/PHASE8_DURATION_GAP_CLOSURE.md` and
    `backend/tests/test_api.py::test_appliances_excludes_iawe_donor_household`.
