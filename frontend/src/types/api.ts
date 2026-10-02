// Mirrors backend/app/schemas/models.py exactly. Every power/energy field keeps its backend
// unit suffix (_w, _wh, _pct, _normalized) -- never renamed to something ambiguous.

export interface ScenarioSelector {
  capacity_scenario: string
  eligibility_scenario: string
  participation_pct: number
  evidence_class: 'A' | 'B'
}

export interface FeederOverview {
  feeder_id: string
  n_transformers: number
  n_households: number
  n_modeled_hours: number
  time_range_start: string
  time_range_end: string
  capacity_scenarios_available: string[]
  eligibility_scenarios_available: string[]
  participation_scenarios_available: number[]
  note: string
}

export interface FeederTimeseriesPoint {
  timestamp: string
  net_demand_w: number
  controlled_load_w: number
  shortfall_w: number
  permitted_import_w: number
  renewable_w: number
  required_flexibility_w: number
  available_flexibility_w: number
  delivered_flexibility_w: number
  unmet_flexibility_w: number
  event_state: EventState
  n_interventions_active: number
}

export type EventState = 'NORMAL' | 'WATCH' | 'SHORTFALL' | 'INSUFFICIENT_FLEXIBILITY' | 'RESTORING'

export interface FeederTimeseriesResponse {
  scenario: ScenarioSelector
  points: FeederTimeseriesPoint[]
}

export interface FeederKPIs {
  scenario: ScenarioSelector
  modeled_peak_w: number
  controlled_peak_w: number
  peak_reduction_w: number
  peak_reduction_pct: number
  modeled_average_w: number
  evening_baseline_avg_w: number | null
  evening_controlled_avg_w: number | null
  requested_flexibility_wh: number
  delivered_flexibility_wh: number
  unmet_flexibility_wh: number
  shortfall_coverage_pct: number | null
  shortfall_hours: number
  interventions: number
}

export interface ForecastPoint {
  forecast_origin_timestamp: string
  target_timestamp: string
  horizon_hours: number
  actual_load_w: number | null
  persistence_pred_w: number | null
  linear_regression_pred_w: number | null
  xgboost_pred_w: number | null
}

export interface ForecastResponse {
  points: ForecastPoint[]
  model_comparison_mae_w: Record<string, number>
  note: string
}

export interface RenewablePoint {
  timestamp: string
  pv_availability_normalized: number
  ghi_wm2: number | null
}

export interface RenewableResponse {
  points: RenewablePoint[]
  note: string
}

export interface FlexibilityState {
  scenario: ScenarioSelector
  timestamp: string | null
  available_flexibility_w: number
  delivered_flexibility_w: number
  protected_power_w: number | null
  participating_households: number
  eligible_appliance_types: string[]
  protected_appliance_types: string[]
  current_interventions: number
  zero_flexibility_explanation: string | null
}

export interface ControllerState {
  scenario: ScenarioSelector
  timestamp: string
  event_state: EventState
  net_demand_w: number
  renewable_w: number
  permitted_import_w: number
  permitted_import_label: string
  requested_flexibility_w: number
  available_flexibility_w: number
  delivered_flexibility_w: number
  unmet_flexibility_w: number
}

export interface ControlEvent {
  timestamp: string
  event_id: number
  household_id: string | null
  transformer_id: string | null
  appliance_id: string | null
  appliance_type: string | null
  requested_flexibility_w: number | null
  selected_power_w: number | null
  reason_selected: string | null
  ranking_score: number | null
  runtime_before_minutes: number | null
  interruption_count_before: number | null
  cooldown_before_minutes: number | null
  realized_duration_steps: number | null
}

export interface ControlEventsResponse {
  scenario: ScenarioSelector
  total_events: number
  events: ControlEvent[]
}

export interface TransformerSummary {
  transformer_id: string
  archetype_ids: string[]
  n_households: number
  capacity_kva: number
  capacity_provenance: string
  peak_demand_w: number
  average_demand_w: number
}

export interface TransformerDetail extends TransformerSummary {
  household_ids: string[]
  scenario: ScenarioSelector
  curtailed_energy_wh: number
  n_interventions: number
}

export interface HouseholdSummary {
  household_id: string
  archetype_id: string
  archetype_name: string
  transformer_id: string
  n_appliance_instances: number
}

export interface ApplianceInstanceRecord {
  appliance_id: string
  appliance_type: string
  rated_power_w: number | null
  criticality: string | null
  eligible_for_control_default: boolean
  provenance_class: string
}

export interface HouseholdDetail extends HouseholdSummary {
  scenario: ScenarioSelector
  appliances: ApplianceInstanceRecord[]
  participating: boolean | null
  n_interventions: number
  total_curtailed_energy_wh: number
}

export interface ApplianceTypeSummary {
  appliance_type: string
  n_instances: number
  has_real_load_profile: boolean
  eligible_for_control_default: boolean
  criticality: string | null
}

export interface ApplianceResponse {
  types: ApplianceTypeSummary[]
  n_profiled_types: number
  n_total_types: number
  note: string
}

export interface ScenarioListResponse {
  scenarios: ScenarioSelector[]
}

export interface ScenarioResult {
  scenario: ScenarioSelector
  peak_reduction_w: number
  evening_reduction_w: number
  curtailed_energy_wh: number
  delivered_flexibility_wh: number
  unmet_flexibility_wh: number
  interventions: number
  flexibility_utilization_pct: number | null
  insufficient_flexibility_hours: number
}

export interface EvaluationResult {
  baseline: Record<string, unknown>
  counterfactual: Record<string, unknown>
  restoration_and_duration: Record<string, unknown>
  failure_modes: Record<string, unknown>
  statistical_summary: Record<string, unknown>
  fairness: Record<string, unknown>
}

export interface EvidenceClaim {
  claim: string
  evidence_type: string
  supported: string
  qualification: string
}

export interface EvidenceResponse {
  supported: EvidenceClaim[]
  conditional_counterfactual: EvidenceClaim[]
  not_established: EvidenceClaim[]
}

export interface LimitationItem {
  category: string
  text: string
}

export interface LimitationsResponse {
  items: LimitationItem[]
}

export interface HealthResponse {
  status: string
  app_version: string
  data_loaded: boolean
}
