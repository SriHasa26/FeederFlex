# Phase 10 — Limitations

**This application is a simulation/demonstration system. It is NOT a live DISCOM control
system.** Every limitation inherited from Phases 4-9 (`phase3_data/processed/phase9/reports/PHASE9_LIMITATIONS_AUDIT.md`,
served structurally at `GET /api/limitations`) applies unchanged to everything this application
displays. This document adds only the limitations specific to the Phase 10 integration layer.

## Inherited, unchanged (see `/limitations` page or `/api/limitations` for the full 20-item list)

Only 4/13 appliance types profiled; synthetic feeder anchored to a plausibility-range capacity,
not field-validated; shared source profiles across up to 93 households; hourly resolution only;
unresolved iAWE meter1/meter2 and timezone uncertainty; Mathura/Bareilly cross-year identity
unverified; both capacity scenarios and every controller threshold are methodological
assumptions; n=1 AC counterfactual; normalized synthetic renewable availability, no measured PV
generation; no field participation data; no power-flow model; no SCADA/hardware integration or
validation.

## Phase 10-specific limitations

1. **No authentication exists.** This is a public demonstration surface with no login, no
   per-user state, and no access control. It must not be deployed as if it were an operational
   tool with restricted access.
2. **No persistence layer.** The backend holds everything in an in-memory, read-only cache
   populated at startup; there is no database, and nothing a user does in the frontend (e.g.
   scenario selection) is saved anywhere.
3. **Retrospective simulation only, not live.** The "Dashboard playback" feature replays
   already-computed historical simulation records at a fixed client-side cadence — it is not a
   live data stream, a forecast-driven dispatch, or a real-time feed of any kind, even though it
   is designed to feel interactive.
4. **No end-to-end browser test suite.** Frontend correctness here rests on TypeScript
   compilation, linting, a working dev-server response, and manual review — not on an automated
   rendered-DOM assertion suite (see `PHASE10_VALIDATION.md`'s "not yet done" section).
5. **Single-machine local deployment only.** No production hosting, TLS, load balancing, or
   scaling configuration exists. `PHASE10_SETUP.md` describes local development only.
6. **The 4/13-profiled-type notice is Phase 10 UI copy, not enforcement.** The `/appliances`
   page states the coverage limitation prominently, but nothing in the API or UI technically
   prevents a future developer from adding a chart that implies complete appliance coverage —
   this remains a documentation and review discipline, not a structural guarantee.
7. **Chart libraries and UI copy are new Phase 10 artifacts, not independently peer-reviewed.**
   The visual framing (badges, color semantics) is this phase's own design choice for
   communicating the Class A/B distinction; it has not been evaluated for how effectively real
   users actually perceive that distinction.

## What Phase 10 explicitly does not add

No new scientific claim, capacity value, threshold, or appliance/household record was introduced
anywhere in Phase 10. Every number is either read directly from a Phase 4-9 artifact or is a
documented aggregation over Phase 8's own row-level output, verified against source values in
`backend/tests/test_api.py`.
