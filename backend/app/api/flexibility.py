import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import scenario_params
from app.schemas.models import (
    FlexibilityState, ControllerState, ControlEvent, ControlEventsResponse, ScenarioSelector,
)
from app.services.data_loader import store

router = APIRouter(prefix="/api", tags=["flexibility", "controller"])


def _n(value):
    """NaN/NaT -> None (restoration rows have no household/appliance/type when the appliance
    doesn't appear in that hour's candidate pool -- a genuine gap, not a serialization bug)."""
    return None if pd.isna(value) else value

# Reproduced from Phase 7's own ELIGIBILITY_SCENARIOS definition (flexibility.py) -- the only 4
# appliance types with real load-profile data, and which of them are eligible under each
# eligibility scenario. Not a new classification; a direct restatement of Phase 7's own labeled
# taxonomy for display purposes.
_PROFILED_TYPES = ["refrigerator", "air_conditioner", "laptop_computer", "television"]
_ELIGIBLE_BY_SCENARIO = {
    "baseline": set(),  # all 4 profiled types are protected/critical/unclassified under baseline
    "counterfactual_ac_enabled": {"air_conditioner"},
    "counterfactual_broad": {"air_conditioner", "laptop_computer", "television"},
}


@router.get("/flexibility", response_model=FlexibilityState)
def get_flexibility(scenario: ScenarioSelector = Depends(scenario_params)):
    try:
        df = store.hourly(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
        log = store.control_log(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    part = store.participation_assignments
    part_row = part[part["scenario_participation_pct"] == scenario.participation_pct]
    n_participating = int(part_row["participating"].sum())

    eligible_types = sorted(_ELIGIBLE_BY_SCENARIO.get(scenario.eligibility_scenario, set()))
    protected_types = sorted(set(_PROFILED_TYPES) - set(eligible_types))

    available_sum = float(df["available_flexibility_w"].sum())
    explanation = None
    if available_sum == 0.0:
        explanation = (
            "The validated baseline contains no appliance population that meets all current "
            "profile, eligibility, and controllability requirements. This is a genuine research "
            "finding (Phase 7), not an error."
        )

    n_interventions = int(len(log[log["reason_selected"].astype(str).str.startswith("RANK_", na=False)])) if len(log) else 0

    return FlexibilityState(
        scenario=scenario, timestamp=None,
        available_flexibility_w=available_sum, delivered_flexibility_w=float(df["delivered_flexibility_w"].sum()),
        participating_households=n_participating, eligible_appliance_types=eligible_types,
        protected_appliance_types=protected_types, current_interventions=n_interventions,
        zero_flexibility_explanation=explanation,
    )


@router.get("/controller/state", response_model=ControllerState)
def get_controller_state(
    scenario: ScenarioSelector = Depends(scenario_params),
    timestamp: str | None = Query(None, description="ISO timestamp; defaults to the first modeled hour"),
):
    try:
        df = store.hourly(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    if timestamp:
        matches = df[df["timestamp_hourly"].astype(str) == timestamp]
        if matches.empty:
            raise HTTPException(404, f"No modeled hour at timestamp '{timestamp}' for this scenario")
        row = matches.iloc[0]
    else:
        row = df.iloc[0]

    return ControllerState(
        scenario=scenario, timestamp=str(row["timestamp_hourly"]), event_state=row["event_state"],
        net_demand_w=float(row["net_demand_w"]), renewable_w=float(row["renewable_w"]),
        permitted_import_w=float(row["permitted_import_w"]),
        requested_flexibility_w=float(row["required_flexibility_w"]),
        available_flexibility_w=float(row["available_flexibility_w"]),
        delivered_flexibility_w=float(row["delivered_flexibility_w"]),
        unmet_flexibility_w=float(row["unmet_flexibility_w"]),
    )


@router.get("/controller/events", response_model=ControlEventsResponse)
def get_controller_events(
    scenario: ScenarioSelector = Depends(scenario_params),
    household_id: str | None = Query(None),
    transformer_id: str | None = Query(None),
    limit: int = Query(200, le=1000),
    offset: int = Query(0, ge=0),
):
    try:
        log = store.control_log(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    if household_id:
        log = log[log["household_id"] == household_id]
    if transformer_id:
        log = log[log["transformer_id"] == transformer_id]

    total = len(log)
    page = log.iloc[offset: offset + limit]
    events = [
        ControlEvent(
            timestamp=str(row.timestamp), event_id=int(row.event_id), household_id=_n(row.household_id),
            transformer_id=_n(row.transformer_id), appliance_id=_n(row.appliance_id), appliance_type=_n(row.appliance_type),
            requested_flexibility_w=_n(row.requested_flexibility_w), selected_power_w=_n(row.selected_power_w),
            reason_selected=_n(row.reason_selected), ranking_score=_n(row.ranking_score),
            runtime_before_minutes=_n(row.runtime_before), interruption_count_before=_n(row.interruption_count_before),
            cooldown_before_minutes=_n(row.cooldown_before), realized_duration_steps=_n(row.realized_duration_steps),
        )
        for row in page.itertuples()
    ]
    return ControlEventsResponse(scenario=scenario, total_events=total, events=events)
