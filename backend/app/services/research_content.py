"""
Structured, API-servable restatements of Phase 9's own validated reports
(PHASE9_EVIDENCE_CLASSIFICATION.md, PHASE9_CLAIM_MATRIX.md, PHASE9_LIMITATIONS_AUDIT.md). Every
entry here is a direct restatement of Phase 9's already-written, validated content -- nothing is
newly asserted here that Phase 9 did not already document.
"""

EVIDENCE_CLAIMS = [
    {"claim": "Synthetic feeder can represent household aggregation", "evidence_type": "DERIVED (Phase 4C aggregation anchored to a real CEA capacity range)",
     "supported": "Partially supported", "qualification": "A plausible aggregation structure, not a validated real feeder; no field measurement confirms it."},
    {"claim": "Baseline modeled flexibility", "evidence_type": "REAL/DERIVED, evidence-backed eligibility taxonomy",
     "supported": "Supported (as a negative result)", "qualification": "Available flexibility = 0 W is the finding, confirmed at every participation rate and both capacity scenarios."},
    {"claim": "Counterfactual DR flexibility", "evidence_type": "SIMULATION-BASED, COUNTERFACTUAL eligibility",
     "supported": "Conditionally supported", "qualification": "Demonstrates the controller mechanism works on real appliance/load data under a hypothetical eligibility expansion."},
    {"claim": "Peak reduction", "evidence_type": "DERIVED, modeled synthetic load only",
     "supported": "Conditionally supported", "qualification": "Up to 16.8% (Class B, 90% participation); 0% under evidence-backed baseline; never measured real-feeder reduction."},
    {"claim": "Evening reduction", "evidence_type": "DERIVED, modeled synthetic load only",
     "supported": "Conditionally supported", "qualification": "Evening AVERAGE reduced in most Class-B scenarios; evening PEAK never reduced in any tested scenario."},
    {"claim": "Renewable-aware stress handling", "evidence_type": "SIMULATION-BASED, ASSUMED PV capacity applied to real/derived availability",
     "supported": "Conditionally supported", "qualification": "The PV capacity itself is invented for demonstration, not measured or planned."},
    {"claim": "Forecasting performance", "evidence_type": "REAL/DERIVED (Phase 6 forecast-vs-actual comparison)",
     "supported": "Supported, narrowly", "qualification": "Measured against historical held-out data; the Phase 8 controller does NOT consume this forecast output (retrospective simulation)."},
    {"claim": "Appliance-level controllability", "evidence_type": "SIMULATION-BASED",
     "supported": "Conditionally supported", "qualification": "Demonstrated only for 4/13 profiled appliance types, and only under counterfactual scenarios."},
    {"claim": "Real household participation", "evidence_type": "—",
     "supported": "NOT ESTABLISHED", "qualification": "No real household has ever been asked, measured, or observed participating."},
    {"claim": "Real DISCOM deployment", "evidence_type": "—",
     "supported": "NOT ESTABLISHED", "qualification": "No DISCOM system, process, or personnel has interacted with this pipeline."},
    {"claim": "SCADA integration", "evidence_type": "—",
     "supported": "NOT ESTABLISHED", "qualification": "No SCADA, IEC-104, or equivalent protocol integration exists anywhere."},
    {"claim": "Hardware feasibility", "evidence_type": "—",
     "supported": "NOT ESTABLISHED", "qualification": "No relay, smart plug, meter, or communication hardware has been built or specified."},
    {"claim": "Low-income household generalization", "evidence_type": "SYNTHETIC (Phase 4B archetypes)",
     "supported": "NOT ESTABLISHED", "qualification": "The 2 archetypes are constructed profiles anchored to real dataset ranges, not a survey/census."},
    {"claim": "Battery replacement / cost advantage", "evidence_type": "—",
     "supported": "NOT ESTABLISHED", "qualification": "No cost model or economic evaluation exists anywhere in this project."},
]

LIMITATIONS = [
    {"category": "Appliance/data coverage", "text": "Only 4 of 13 owned appliance types (refrigerator, AC, laptop, television) have real load-profile data."},
    {"category": "Appliance/data coverage", "text": "Up to 93 households share a single real appliance trace (Phase 4B shared-profile architecture)."},
    {"category": "Appliance/data coverage", "text": "The 9 unprofiled appliance types are known to be owned but have no load curve; their potential flexibility is unknown, not zero."},
    {"category": "Resolution and modeling", "text": "Hourly resolution only -- sub-hourly dynamics (e.g. refrigerator compressor cycling) are smoothed out."},
    {"category": "Resolution and modeling", "text": "No power-flow, voltage, or transformer-thermal model exists anywhere in this pipeline."},
    {"category": "Source-data provenance", "text": "iAWE meter1 vs meter2 relationship investigated but NOT resolved (Gap 5) -- neither channel is validated feeder ground truth."},
    {"category": "Source-data provenance", "text": "iAWE timezone interpretation is inconclusive (Gap 6) -- clock-hour-sensitive results (including the 17:00-20:00 evening window) may be off by up to 5.5 hours."},
    {"category": "Source-data provenance", "text": "Mathura/Bareilly cross-year household identity is unverified."},
    {"category": "Controller/capacity assumptions", "text": "Counterfactual controllability (AC-enabled, Broad) is illustrative, not evidence-backed."},
    {"category": "Controller/capacity assumptions", "text": "Both assumed_nameplate_capacity and assumed_stress_test are methodological assumptions, not real or validated grid capacity."},
    {"category": "Controller/capacity assumptions", "text": "Minimum runtime, cooldown, max interruptions/day, max interruption duration, and restoration batch size are all ASSUMED, illustrative values."},
    {"category": "Controller/capacity assumptions", "text": "Exactly one AC-owning household exists in this population (n=1) -- COUNTERFACTUAL_AC_ENABLED results are dominated by that single household's random draw."},
    {"category": "Controller/capacity assumptions", "text": "No real dispatch history exists prior to Phase 8's own simulation."},
    {"category": "Forecast/renewable", "text": "Phase 6's 80% prediction intervals are empirical (validation-residual-based), not a calibrated probabilistic guarantee."},
    {"category": "Forecast/renewable", "text": "Weather/PV training data covers only 2013-06-07 to 2013-09-18 (Delhi)."},
    {"category": "Forecast/renewable", "text": "Renewable availability is normalized [0,1] SYNTHETIC/MODELLED availability, not measured PV generation; no installed PV capacity exists anywhere in this project."},
    {"category": "Forecast/renewable", "text": "The Phase 8/9 controller is a RETROSPECTIVE simulation using historical load, not a forecast-driven, prospective dispatch."},
    {"category": "Deployment/validation", "text": "No real household has ever agreed to, or been measured for, participation."},
    {"category": "Deployment/validation", "text": "No SCADA, IEC-104, LoRa, USSD, or hardware integration exists anywhere in this project."},
    {"category": "Deployment/validation", "text": "No hardware validation -- nothing has been tested against a physical meter, relay, or controller."},
]
