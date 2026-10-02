from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import scenario_params
from app.core.config import CAPACITY_SCENARIOS, ELIGIBILITY_SCENARIOS, PARTICIPATION_SCENARIOS_PCT, EVENING_START_HOUR, EVENING_END_HOUR
from app.schemas.models import (
    FeederOverview, FeederTimeseriesPoint, FeederTimeseriesResponse, FeederKPIs, ScenarioSelector,
)
from app.services.data_loader import store

router = APIRouter(prefix="/api/feeder", tags=["feeder"])


@router.get("", response_model=FeederOverview)
def get_feeder_overview():
    hourly = store.feeder_load_hourly
    return FeederOverview(
        feeder_id="FEEDER_001",
        n_transformers=int(store.transformer_metrics["transformer_id"].nunique()),
        n_households=int(store.household_connections["household_id"].nunique()),
        n_modeled_hours=int(len(hourly)),
        time_range_start=str(hourly["timestamp_hourly"].min()),
        time_range_end=str(hourly["timestamp_hourly"].max()),
        capacity_scenarios_available=CAPACITY_SCENARIOS,
        eligibility_scenarios_available=ELIGIBILITY_SCENARIOS,
        participation_scenarios_available=PARTICIPATION_SCENARIOS_PCT,
    )


@router.get("/timeseries", response_model=FeederTimeseriesResponse)
def get_feeder_timeseries(
    scenario: ScenarioSelector = Depends(scenario_params),
    start: str | None = Query(None, description="ISO timestamp, inclusive"),
    end: str | None = Query(None, description="ISO timestamp, inclusive"),
    limit: int = Query(2000, le=2000),
):
    try:
        df = store.hourly(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    if start:
        df = df[df["timestamp_hourly"] >= start]
    if end:
        df = df[df["timestamp_hourly"] <= end]
    df = df.head(limit)

    points = [
        FeederTimeseriesPoint(
            timestamp=str(row.timestamp_hourly), net_demand_w=row.net_demand_w,
            controlled_load_w=row.controlled_load_w, shortfall_w=row.shortfall_w,
            permitted_import_w=row.permitted_import_w, renewable_w=row.renewable_w,
            required_flexibility_w=row.required_flexibility_w,
            available_flexibility_w=row.available_flexibility_w,
            delivered_flexibility_w=row.delivered_flexibility_w,
            unmet_flexibility_w=row.unmet_flexibility_w, event_state=row.event_state,
            n_interventions_active=row.n_interventions_active,
        )
        for row in df.itertuples()
    ]
    return FeederTimeseriesResponse(scenario=scenario, points=points)


@router.get("/kpis", response_model=FeederKPIs)
def get_feeder_kpis(scenario: ScenarioSelector = Depends(scenario_params)):
    try:
        df = store.hourly(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
        log = store.control_log(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    ev = df[df["timestamp_hourly"].dt.hour.between(EVENING_START_HOUR, EVENING_END_HOUR - 1)]
    requested = float(df["required_flexibility_w"].sum())
    delivered = float(df["delivered_flexibility_w"].sum())
    coverage = (delivered / requested * 100) if requested > 0 else None
    n_interventions = int(len(log[log["reason_selected"].astype(str).str.startswith("RANK_", na=False)])) if len(log) else 0

    peak = float(df["net_demand_w"].max())
    controlled_peak = float(df["controlled_load_w"].max())
    return FeederKPIs(
        scenario=scenario, modeled_peak_w=peak, controlled_peak_w=controlled_peak,
        peak_reduction_w=peak - controlled_peak, peak_reduction_pct=(peak - controlled_peak) / peak * 100,
        modeled_average_w=float(df["net_demand_w"].mean()),
        evening_baseline_avg_w=float(ev["net_demand_w"].mean()) if len(ev) else None,
        evening_controlled_avg_w=float(ev["controlled_load_w"].mean()) if len(ev) else None,
        requested_flexibility_wh=requested, delivered_flexibility_wh=delivered,
        unmet_flexibility_wh=float(df["unmet_flexibility_w"].sum()),
        shortfall_coverage_pct=coverage, shortfall_hours=int((df["shortfall_w"] > 0).sum()),
        interventions=n_interventions,
    )
