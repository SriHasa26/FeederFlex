# Methodology

## Overview

FeederFlex is built as ten sequential phases (4A-11), each consuming only the previous phases'
already-validated outputs, each producing its own validation report before the next phase may
begin. This document summarizes the methodology; phase-specific detail lives in the dedicated
`*_METHOD.md` files in this directory.

## Governing principles (applied in every phase)

1. **Provenance discipline.** Every value is labeled REAL (from a real dataset, unmodified),
   DERIVED (computed from REAL data via a documented deterministic transformation), SYNTHETIC
   (generated to fill a structural gap via a documented method), or
   METHODOLOGICAL_ASSUMPTION/ASSUMED (no real-data basis, used only for demonstration).
2. **No fabrication.** A missing value is reported as missing (e.g. "no load profile exists for
   9 of 13 appliance types"), never estimated or invented to fill a gap.
3. **Chronological integrity.** Any time-series train/validation/test split is chronological,
   never randomly shuffled, to prevent look-ahead leakage.
4. **Evidence-class separation.** Every result is tagged evidence-backed or
   counterfactual/illustrative; the two are never merged into a single headline number.
5. **Validation before progression.** Each phase ends with an automated validation checklist
   (24-26 checks per phase in the later phases) that must fully pass before the next phase
   begins; every phase also re-verifies that no earlier phase's output changed.

## Phase sequence

| Phase | What it does | Method doc |
|---|---|---|
| 4A | Raw data acquisition/audit (iAWE, Mathura/Bareilly, appliance-parameter evidence, weather) | `DATA_SOURCES_AND_PROVENANCE.md` |
| 4B-4D | Synthetic household/appliance population construction | `SYNTHETIC_FEEDER_METHOD.md` |
| 4C | Feeder topology (households → transformers → feeder) | `SYNTHETIC_FEEDER_METHOD.md` |
| 5 | Baseline (uncontrolled) hourly load simulation | `SYNTHETIC_FEEDER_METHOD.md` |
| 6 | Load and renewable-availability forecasting | `FORECASTING_METHOD.md` |
| 7 | Appliance-level flexibility estimation | `FLEXIBILITY_METHOD.md` |
| 8 (+ gap closure) | Constrained DR dispatch controller | `DR_CONTROLLER_METHOD.md` |
| 9 | Final research evaluation, evidence classification | `EVALUATION_RESULTS.md` |
| 10 | Full-stack demonstration application (backend + frontend) | `SYSTEM_ARCHITECTURE.md` |
| 11 | Final validation, documentation, demo readiness | this directory |

## Reproducibility

Every phase fixes an explicit random seed where randomness is used (e.g. Phase 4B ownership
realization seed=42, Phase 4C topology assignment seed=4242, Phase 7 participation draw
seed=707) and verifies bit-identical output on re-run. See `REPRODUCIBILITY.md`.

## Deviation policy

Where a genuine methodological deviation was required (e.g. Phase 6's calendar-time 70/15/15
split producing an empty validation set, corrected to a row-count chronological split), the
deviation is documented in place, not silently applied. Where a genuine defect was found after
a phase was declared complete (the Phase 8 duration-enforcement bug, found and fixed in a
dedicated gap-closure pass; the Phase 10 appliance-count bug, found by Phase 11's own E2E suite
and fixed in place), the defect, its root cause, and the fix are documented, not hidden.
