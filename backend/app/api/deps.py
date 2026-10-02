"""Shared FastAPI dependencies -- scenario validation, common query params."""
from fastapi import HTTPException, Query

from app.core.config import (
    CAPACITY_SCENARIOS, ELIGIBILITY_SCENARIOS, PARTICIPATION_SCENARIOS_PCT,
    DEFAULT_CAPACITY_SCENARIO, DEFAULT_ELIGIBILITY_SCENARIO, DEFAULT_PARTICIPATION_PCT,
    EVIDENCE_BACKED_ELIGIBILITY_SCENARIO,
)
from app.schemas.models import ScenarioSelector


def scenario_params(
    capacity_scenario: str = Query(DEFAULT_CAPACITY_SCENARIO, description="assumed_nameplate_capacity | assumed_stress_test"),
    eligibility_scenario: str = Query(DEFAULT_ELIGIBILITY_SCENARIO, description="baseline | counterfactual_ac_enabled | counterfactual_broad"),
    participation_pct: int = Query(DEFAULT_PARTICIPATION_PCT, description="30 | 50 | 70 | 90"),
) -> ScenarioSelector:
    if capacity_scenario not in CAPACITY_SCENARIOS:
        raise HTTPException(400, f"Unknown capacity_scenario '{capacity_scenario}'. Valid: {CAPACITY_SCENARIOS}")
    if eligibility_scenario not in ELIGIBILITY_SCENARIOS:
        raise HTTPException(400, f"Unknown eligibility_scenario '{eligibility_scenario}'. Valid: {ELIGIBILITY_SCENARIOS}")
    if participation_pct not in PARTICIPATION_SCENARIOS_PCT:
        raise HTTPException(400, f"Unknown participation_pct '{participation_pct}'. Valid: {PARTICIPATION_SCENARIOS_PCT}")
    evidence_class = "A" if eligibility_scenario == EVIDENCE_BACKED_ELIGIBILITY_SCENARIO else "B"
    return ScenarioSelector(
        capacity_scenario=capacity_scenario, eligibility_scenario=eligibility_scenario,
        participation_pct=participation_pct, evidence_class=evidence_class,
    )


def parse_scenario_key(scenario_key: str) -> ScenarioSelector:
    """Parses a path-param scenario key of the form
    '{capacity_scenario}__{eligibility_scenario}__{participation_pct}'."""
    parts = scenario_key.split("__")
    if len(parts) != 3:
        raise HTTPException(400, "scenario key must be '{capacity_scenario}__{eligibility_scenario}__{participation_pct}'")
    capacity_scenario, eligibility_scenario, pct_str = parts
    try:
        participation_pct = int(pct_str)
    except ValueError:
        raise HTTPException(400, f"Invalid participation_pct in scenario key: {pct_str}")
    return scenario_params(capacity_scenario, eligibility_scenario, participation_pct)
