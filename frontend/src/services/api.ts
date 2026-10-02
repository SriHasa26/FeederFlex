import type {
  ApplianceResponse, ControlEventsResponse, ControllerState, EvaluationResult, EvidenceResponse,
  FeederKPIs, FeederOverview, FeederTimeseriesResponse, FlexibilityState, ForecastResponse,
  HealthResponse, HouseholdDetail, HouseholdSummary, LimitationsResponse, RenewableResponse,
  ScenarioListResponse, ScenarioResult, TransformerDetail, TransformerSummary,
} from '../types/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export interface ScenarioQuery {
  capacity_scenario?: string
  eligibility_scenario?: string
  participation_pct?: number
}

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(API_BASE + path)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `${res.status} ${res.statusText}: ${body}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => get<HealthResponse>('/api/health'),
  feeder: () => get<FeederOverview>('/api/feeder'),
  feederTimeseries: (scenario: ScenarioQuery, opts?: { start?: string; end?: string; limit?: number }) =>
    get<FeederTimeseriesResponse>('/api/feeder/timeseries', { ...scenario, ...opts }),
  feederKpis: (scenario: ScenarioQuery) => get<FeederKPIs>('/api/feeder/kpis', { ...scenario }),
  forecast: (limit = 200) => get<ForecastResponse>('/api/forecast', { limit }),
  renewable: (limit = 500) => get<RenewableResponse>('/api/renewable', { limit }),
  flexibility: (scenario: ScenarioQuery) => get<FlexibilityState>('/api/flexibility', { ...scenario }),
  controllerState: (scenario: ScenarioQuery, timestamp?: string) =>
    get<ControllerState>('/api/controller/state', { ...scenario, timestamp }),
  controllerEvents: (scenario: ScenarioQuery, opts?: { household_id?: string; transformer_id?: string; limit?: number; offset?: number }) =>
    get<ControlEventsResponse>('/api/controller/events', { ...scenario, ...opts }),
  transformers: () => get<TransformerSummary[]>('/api/transformers'),
  transformer: (id: string, scenario: ScenarioQuery) => get<TransformerDetail>(`/api/transformers/${id}`, { ...scenario }),
  households: () => get<HouseholdSummary[]>('/api/households'),
  household: (id: string, scenario: ScenarioQuery) => get<HouseholdDetail>(`/api/households/${id}`, { ...scenario }),
  appliances: () => get<ApplianceResponse>('/api/appliances'),
  scenarios: () => get<ScenarioListResponse>('/api/scenarios'),
  scenarioResult: (scenarioKey: string) => get<ScenarioResult>(`/api/scenarios/${scenarioKey}`),
  results: () => get<EvaluationResult>('/api/results'),
  evidence: () => get<EvidenceResponse>('/api/evidence'),
  limitations: () => get<LimitationsResponse>('/api/limitations'),
}

export function scenarioKey(s: { capacity_scenario: string; eligibility_scenario: string; participation_pct: number }) {
  return `${s.capacity_scenario}__${s.eligibility_scenario}__${s.participation_pct}`
}

export { ApiError }
