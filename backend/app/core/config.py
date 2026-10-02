"""
FeederFlex backend -- configuration.

The backend is READ-ONLY over the validated Phase 4-9 research pipeline. It never writes to
phase3_data/, never re-runs any simulation, and never accepts a control command.
"""
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = BACKEND_ROOT.parent
PHASE3_DATA = REPO_ROOT / "phase3_data"

PHASE4B_DIR = PHASE3_DATA / "processed" / "phase4b"
PHASE4C_DIR = PHASE3_DATA / "processed" / "phase4c"
PHASE6_DIR = PHASE3_DATA / "processed" / "phase6"
PHASE7_DIR = PHASE3_DATA / "processed" / "phase7"
PHASE8_DIR = PHASE3_DATA / "processed" / "phase8"
PHASE9_DIR = PHASE3_DATA / "processed" / "phase9"

# Scenario identifiers -- inherited unchanged from Phase 7/8/9. The backend never defines a new
# scenario, threshold, or capacity value.
CAPACITY_SCENARIOS = ["assumed_nameplate_capacity", "assumed_stress_test"]
ELIGIBILITY_SCENARIOS = ["baseline", "counterfactual_ac_enabled", "counterfactual_broad"]
PARTICIPATION_SCENARIOS_PCT = [30, 50, 70, 90]

EVIDENCE_BACKED_ELIGIBILITY_SCENARIO = "baseline"
DEFAULT_CAPACITY_SCENARIO = "assumed_stress_test"
DEFAULT_ELIGIBILITY_SCENARIO = "counterfactual_broad"
DEFAULT_PARTICIPATION_PCT = 90

EVENING_START_HOUR = 17
EVENING_END_HOUR = 20

APP_TITLE = "FeederFlex Simulation API"
APP_VERSION = "1.0.0"
# Port 5199 is the frontend dev server's explicit port (see frontend/vite.config.ts) -- picked to
# avoid colliding with an unrelated pre-existing dev server on the default Vite port (5173) on
# shared dev machines. Both ports are kept allowed for compatibility with any environment where
# 5173 is actually free.
CORS_ORIGINS = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5199", "http://127.0.0.1:5199",
]
