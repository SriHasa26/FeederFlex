"""
FeederFlex backend -- typed Pydantic response schemas.

Every power/energy field is unit-suffixed (`_w`, `_wh`, `_normalized`) per Section 10.20 --
never a bare `power`, `energy`, or `capacity` name.
"""
from typing import Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    app_version: str
    data_loaded: bool


class ScenarioSelector(BaseModel):
    capacity_scenario: str
    eligibility_scenario: str
    participation_pct: int
    evidence_class: str = Field(description='"A" (evidence-backed) or "B" (COUNTERFACTUAL/ILLUSTRATIVE)')


class FeederOverview(BaseModel):
    feeder_id: str
    n_transformers: int
    n_households: int
    n_modeled_hours: int
    time_range_start: str
    time_range_end: str
    capacity_scenarios_available: list[str]
    eligibility_scenarios_available: list[str]
    participation_scenarios_available: list[int]
    note: str = (
        "Synthetic feeder topology, anchored to a real CEA transformer-capacity range "
        "(a plausibility anchor, not a field-validated rating). See /api/limitations."
    )


class FeederTimeseriesPoint(BaseModel):
    timestamp: str
    net_demand_w: float
    controlled_load_w: float
    shortfall_w: float
    permitted_import_w: float
    renewable_w: float
    required_flexibility_w: float
    available_flexibility_w: float
    delivered_flexibility_w: float
    unmet_flexibility_w: float
    event_state: str
    n_interventions_active: int


class FeederTimeseriesResponse(BaseModel):
    scenario: ScenarioSelector
    points: list[FeederTimeseriesPoint]


class FeederKPIs(BaseModel):
    scenario: ScenarioSelector
    modeled_peak_w: float
    controlled_peak_w: float
    peak_reduction_w: float
    peak_reduction_pct: float
    modeled_average_w: float
    evening_baseline_avg_w: Optional[float]
    evening_controlled_avg_w: Optional[float]
    requested_flexibility_wh: float
    delivered_flexibility_wh: float
    unmet_flexibility_wh: float
    shortfall_coverage_pct: Optional[float] = Field(description="null when nothing was requested (N/A), never 0/100 by convention")
    shortfall_hours: int
    interventions: int


class ForecastPoint(BaseModel):
    forecast_origin_timestamp: str
    target_timestamp: str
    horizon_hours: int
    actual_load_w: Optional[float]
    persistence_pred_w: Optional[float]
    linear_regression_pred_w: Optional[float]
    xgboost_pred_w: Optional[float]


class ForecastResponse(BaseModel):
    points: list[ForecastPoint]
    model_comparison_mae_w: dict[str, float]
    note: str = (
        "REAL/DERIVED forecast-vs-actual comparison on historical held-out data. The Phase 8 "
        "controller does NOT consume this forecast output -- dispatch is a RETROSPECTIVE "
        "simulation driven by actual/derived historical load, not a prospective forecast."
    )


class RenewablePoint(BaseModel):
    timestamp: str
    pv_availability_normalized: float
    ghi_wm2: Optional[float] = None


class RenewableResponse(BaseModel):
    points: list[RenewablePoint]
    note: str = (
        "SYNTHETIC/MODELLED normalized [0,1] PV availability derived from REAL GHI via a "
        "documented deterministic formula. This is NOT measured electricity generation, and no "
        "installed PV capacity exists anywhere in this project."
    )


class FlexibilityState(BaseModel):
    scenario: ScenarioSelector
    timestamp: Optional[str]
    available_flexibility_w: float
    delivered_flexibility_w: float
    protected_power_w: Optional[float] = None
    participating_households: int
    eligible_appliance_types: list[str]
    protected_appliance_types: list[str]
    current_interventions: int
    zero_flexibility_explanation: Optional[str] = None


class ControllerState(BaseModel):
    scenario: ScenarioSelector
    timestamp: str
    event_state: str
    net_demand_w: float
    renewable_w: float
    permitted_import_w: float
    permitted_import_label: str = "ASSUMED SCENARIO CAPACITY"
    requested_flexibility_w: float
    available_flexibility_w: float
    delivered_flexibility_w: float
    unmet_flexibility_w: float


class ControlEvent(BaseModel):
    timestamp: str
    event_id: int
    household_id: Optional[str]
    transformer_id: Optional[str]
    appliance_id: Optional[str]
    appliance_type: Optional[str]
    requested_flexibility_w: Optional[float]
    selected_power_w: Optional[float]
    reason_selected: Optional[str]
    ranking_score: Optional[float]
    runtime_before_minutes: Optional[float]
    interruption_count_before: Optional[int]
    cooldown_before_minutes: Optional[float]
    realized_duration_steps: Optional[float]


class ControlEventsResponse(BaseModel):
    scenario: ScenarioSelector
    total_events: int
    events: list[ControlEvent]


class TransformerSummary(BaseModel):
    transformer_id: str
    archetype_ids: list[str]
    n_households: int
    capacity_kva: float
    capacity_provenance: str = (
        "METHODOLOGICAL_ASSUMPTION -- 25 kVA is a plausibility anchor citing a real CEA "
        "planning-document capacity range, NOT a field-validated rating for this feeder."
    )
    peak_demand_w: float
    average_demand_w: float


class TransformerDetail(TransformerSummary):
    household_ids: list[str]
    scenario: ScenarioSelector
    curtailed_energy_wh: float
    n_interventions: int


class HouseholdSummary(BaseModel):
    household_id: str
    archetype_id: str
    archetype_name: str
    transformer_id: str
    n_appliance_instances: int


class HouseholdDetail(HouseholdSummary):
    scenario: ScenarioSelector
    appliances: list[dict]
    participating: Optional[bool]
    n_interventions: int
    total_curtailed_energy_wh: float


class ApplianceTypeSummary(BaseModel):
    appliance_type: str
    n_instances: int
    has_real_load_profile: bool
    eligible_for_control_default: bool
    criticality: Optional[str]


class ApplianceResponse(BaseModel):
    types: list[ApplianceTypeSummary]
    n_profiled_types: int
    n_total_types: int
    note: str = "Only 4 of 13 owned appliance types currently have real load profiles."


class ScenarioResult(BaseModel):
    scenario: ScenarioSelector
    peak_reduction_w: float
    evening_reduction_w: float
    curtailed_energy_wh: float
    delivered_flexibility_wh: float
    unmet_flexibility_wh: float
    interventions: int
    flexibility_utilization_pct: Optional[float]
    insufficient_flexibility_hours: int


class ScenarioListResponse(BaseModel):
    scenarios: list[ScenarioSelector]


class EvaluationResult(BaseModel):
    """Bundled Phase 9 validated evaluation output -- served as-is, not recomputed."""
    baseline: dict
    counterfactual: dict
    restoration_and_duration: dict
    failure_modes: dict
    statistical_summary: dict
    fairness: dict


class EvidenceClaim(BaseModel):
    claim: str
    evidence_type: str
    supported: str
    qualification: str


class EvidenceResponse(BaseModel):
    supported: list[EvidenceClaim]
    conditional_counterfactual: list[EvidenceClaim]
    not_established: list[EvidenceClaim]


class LimitationItem(BaseModel):
    category: str
    text: str


class LimitationsResponse(BaseModel):
    items: list[LimitationItem]
