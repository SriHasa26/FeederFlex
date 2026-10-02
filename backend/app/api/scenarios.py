from fastapi import APIRouter, HTTPException

from app.api.deps import parse_scenario_key
from app.core.config import PHASE8_DIR, EVIDENCE_BACKED_ELIGIBILITY_SCENARIO, EVENING_START_HOUR, EVENING_END_HOUR
from app.schemas.models import ScenarioSelector, ScenarioListResponse, ScenarioResult
from app.services.data_loader import store

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


def _discover_scenarios() -> list[ScenarioSelector]:
    """Only lists capacity x eligibility x participation combinations that actually have a
    validated Phase 8 artifact on disk -- never invents a combination."""
    out = []
    for path in sorted((PHASE8_DIR / "scenarios").glob("hourly_*.parquet")):
        tag = path.stem[len("hourly_"):]
        # tag = "{capacity}_{eligibility}_participation{pct}"
        parts = tag.rsplit("_participation", 1)
        if len(parts) != 2:
            continue
        prefix, pct = parts
        for cap in ("assumed_nameplate_capacity", "assumed_stress_test"):
            if prefix.startswith(cap + "_"):
                eligibility = prefix[len(cap) + 1:]
                evidence_class = "A" if eligibility == EVIDENCE_BACKED_ELIGIBILITY_SCENARIO else "B"
                out.append(ScenarioSelector(capacity_scenario=cap, eligibility_scenario=eligibility,
                                             participation_pct=int(pct), evidence_class=evidence_class))
                break
    return out


_SCENARIOS_CACHE: list[ScenarioSelector] | None = None


@router.get("", response_model=ScenarioListResponse)
def list_scenarios():
    global _SCENARIOS_CACHE
    if _SCENARIOS_CACHE is None:
        _SCENARIOS_CACHE = _discover_scenarios()
    return ScenarioListResponse(scenarios=_SCENARIOS_CACHE)


@router.get("/{scenario_key}", response_model=ScenarioResult)
def get_scenario_result(scenario_key: str):
    scenario = parse_scenario_key(scenario_key)
    try:
        df = store.hourly(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
        log = store.control_log(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))

    ev = df[df["timestamp_hourly"].dt.hour.between(EVENING_START_HOUR, EVENING_END_HOUR - 1)]
    peak, controlled_peak = float(df["net_demand_w"].max()), float(df["controlled_load_w"].max())
    denom = df["available_flexibility_w"].sum()
    utilization = float(df["delivered_flexibility_w"].sum() / denom * 100) if denom > 0 else None
    n_interventions = int(len(log[log["reason_selected"].astype(str).str.startswith("RANK_", na=False)])) if len(log) else 0

    return ScenarioResult(
        scenario=scenario, peak_reduction_w=peak - controlled_peak,
        evening_reduction_w=float(ev["net_demand_w"].mean() - ev["controlled_load_w"].mean()) if len(ev) else 0.0,
        curtailed_energy_wh=float(df["delivered_flexibility_w"].sum()),
        delivered_flexibility_wh=float(df["delivered_flexibility_w"].sum()),
        unmet_flexibility_wh=float(df["unmet_flexibility_w"].sum()), interventions=n_interventions,
        flexibility_utilization_pct=utilization,
        insufficient_flexibility_hours=int((df["event_state"] == "INSUFFICIENT_FLEXIBILITY").sum()),
    )
