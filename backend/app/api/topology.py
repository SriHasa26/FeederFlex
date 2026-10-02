from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import scenario_params
from app.schemas.models import (
    TransformerSummary, TransformerDetail, HouseholdSummary, HouseholdDetail,
    ApplianceTypeSummary, ApplianceResponse, ScenarioSelector,
)
from app.services.data_loader import store

router = APIRouter(prefix="/api", tags=["topology"])

_PROFILED_TYPES = {"refrigerator", "air_conditioner", "laptop_computer", "television"}


@router.get("/transformers", response_model=list[TransformerSummary])
def list_transformers():
    conn = store.household_connections
    out = []
    for row in store.transformer_metrics.itertuples():
        archetypes = sorted(conn[conn["transformer_id"] == row.transformer_id]["archetype_id"].unique().tolist())
        out.append(TransformerSummary(
            transformer_id=row.transformer_id, archetype_ids=archetypes, n_households=int(row.n_households),
            capacity_kva=float(row.capacity_kva), peak_demand_w=float(row.peak_demand_w),
            average_demand_w=float(row.average_demand_w),
        ))
    return out


@router.get("/transformers/{transformer_id}", response_model=TransformerDetail)
def get_transformer(transformer_id: str, scenario: ScenarioSelector = Depends(scenario_params)):
    tm = store.transformer_metrics[store.transformer_metrics["transformer_id"] == transformer_id]
    if tm.empty:
        raise HTTPException(404, f"Unknown transformer_id '{transformer_id}'")
    row = tm.iloc[0]
    conn = store.household_connections
    households = conn[conn["transformer_id"] == transformer_id]

    try:
        log = store.control_log(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))
    sel = log[(log["transformer_id"] == transformer_id) & (log["reason_selected"].astype(str).str.startswith("RANK_", na=False))]

    return TransformerDetail(
        transformer_id=transformer_id, archetype_ids=sorted(households["archetype_id"].unique().tolist()),
        n_households=int(row["n_households"]), capacity_kva=float(row["capacity_kva"]),
        peak_demand_w=float(row["peak_demand_w"]), average_demand_w=float(row["average_demand_w"]),
        household_ids=sorted(households["household_id"].tolist()), scenario=scenario,
        curtailed_energy_wh=float(sel["selected_power_w"].sum()), n_interventions=int(len(sel)),
    )


@router.get("/households", response_model=list[HouseholdSummary])
def list_households():
    conn = store.household_connections
    counts = store.appliance_instances.groupby("household_id").size()
    out = []
    for row in conn.itertuples():
        out.append(HouseholdSummary(
            household_id=row.household_id, archetype_id=row.archetype_id, archetype_name=row.archetype_name,
            transformer_id=row.transformer_id, n_appliance_instances=int(counts.get(row.household_id, 0)),
        ))
    return out


@router.get("/households/{household_id}", response_model=HouseholdDetail)
def get_household(household_id: str, scenario: ScenarioSelector = Depends(scenario_params)):
    conn = store.household_connections[store.household_connections["household_id"] == household_id]
    if conn.empty:
        raise HTTPException(404, f"Unknown household_id '{household_id}'")
    row = conn.iloc[0]

    inst = store.appliance_instances[store.appliance_instances["household_id"] == household_id]
    appliances = inst[["appliance_id", "appliance_type", "rated_power_w", "criticality",
                        "eligible_for_control_default", "provenance_class"]].to_dict(orient="records")

    part = store.participation_assignments
    part_row = part[(part["household_id"] == household_id) & (part["scenario_participation_pct"] == scenario.participation_pct)]
    participating = bool(part_row.iloc[0]["participating"]) if len(part_row) else None

    try:
        log = store.control_log(scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct)
        sel = log[(log["household_id"] == household_id) & (log["reason_selected"].astype(str).str.startswith("RANK_", na=False))]
        n_interventions, curtailed_wh = int(len(sel)), float(sel["selected_power_w"].sum())
    except FileNotFoundError:
        n_interventions, curtailed_wh = 0, 0.0

    return HouseholdDetail(
        household_id=household_id, archetype_id=row["archetype_id"], archetype_name=row["archetype_name"],
        transformer_id=row["transformer_id"], n_appliance_instances=len(inst), scenario=scenario,
        appliances=appliances, participating=participating, n_interventions=n_interventions,
        total_curtailed_energy_wh=curtailed_wh,
    )


@router.get("/appliances", response_model=ApplianceResponse)
def get_appliances():
    # SYNTHETIC only -- appliance_instances.parquet also carries 9 REAL rows for the single iAWE
    # donor household (iAWE_house1), included verbatim as a provenance reference, NOT part of
    # the 100-household synthetic feeder population. Phase 7's own validation (check 7.22.18)
    # established this exact filter (n_types == 13 only after restricting to SYNTHETIC); without
    # it, the unfiltered table shows 16 appliance types instead of 13, and off-by-one instance
    # counts wherever iAWE_house1 happens to share a type name with the synthetic population
    # (e.g. refrigerator/television/air_conditioner) -- found via the Phase 11 E2E suite.
    inst = store.appliance_instances[store.appliance_instances["provenance_class"] == "SYNTHETIC"]
    counts = inst["appliance_type"].value_counts()
    types = []
    for t, n in counts.items():
        sub = inst[inst["appliance_type"] == t].iloc[0]
        types.append(ApplianceTypeSummary(
            appliance_type=t, n_instances=int(n), has_real_load_profile=t in _PROFILED_TYPES,
            eligible_for_control_default=bool(sub["eligible_for_control_default"]),
            criticality=sub["criticality"] if isinstance(sub["criticality"], str) else None,
        ))
    return ApplianceResponse(types=types, n_profiled_types=len(_PROFILED_TYPES), n_total_types=len(counts))
