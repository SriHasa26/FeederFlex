# Phase 10 — API Specification

Base URL (local dev): `http://127.0.0.1:8000`. Interactive OpenAPI docs at `/docs`.

**Every endpoint is `GET`. No control endpoint exists anywhere in this API** (Section 10.21) —
there is no `POST /control-appliance` or equivalent, and none is planned for Phase 10.

## Common query parameters

Most endpoints accept a scenario triple, defaulting to the primary illustrative demonstration
scenario:

| Param | Values | Default |
|---|---|---|
| `capacity_scenario` | `assumed_nameplate_capacity` \| `assumed_stress_test` | `assumed_stress_test` |
| `eligibility_scenario` | `baseline` \| `counterfactual_ac_enabled` \| `counterfactual_broad` | `counterfactual_broad` |
| `participation_pct` | `30` \| `50` \| `70` \| `90` | `90` |

An invalid value returns `400`. A combination with no matching validated Phase 8 artifact
returns `404` (this should not occur for any of the 13 valid combinations `GET /api/scenarios`
enumerates).

## Endpoints

| Method | Path | Response model | Notes |
|---|---|---|---|
| GET | `/api/health` | `HealthResponse` | |
| GET | `/api/feeder` | `FeederOverview` | Topology summary, available scenarios |
| GET | `/api/feeder/timeseries` | `FeederTimeseriesResponse` | `start`, `end`, `limit` (≤2000) optional |
| GET | `/api/feeder/kpis` | `FeederKPIs` | Aggregated over the full modeled period |
| GET | `/api/forecast` | `ForecastResponse` | Phase 6 h1h forecast-vs-actual; `limit` optional |
| GET | `/api/renewable` | `RenewableResponse` | Phase 6 normalized PV availability; `limit` optional |
| GET | `/api/flexibility` | `FlexibilityState` | Includes `zero_flexibility_explanation` when applicable |
| GET | `/api/controller/state` | `ControllerState` | `timestamp` optional (ISO string); defaults to first modeled hour |
| GET | `/api/controller/events` | `ControlEventsResponse` | `household_id`, `transformer_id`, `limit`, `offset` optional |
| GET | `/api/transformers` | `TransformerSummary[]` | All 11 |
| GET | `/api/transformers/{transformer_id}` | `TransformerDetail` | 404 if unknown |
| GET | `/api/households` | `HouseholdSummary[]` | All 100 |
| GET | `/api/households/{household_id}` | `HouseholdDetail` | 404 if unknown |
| GET | `/api/appliances` | `ApplianceResponse` | All owned types, profiled flag |
| GET | `/api/scenarios` | `ScenarioListResponse` | The 13 combinations with a validated Phase 8 artifact |
| GET | `/api/scenarios/{scenario_key}` | `ScenarioResult` | `scenario_key` = `{capacity}__{eligibility}__{participation}` |
| GET | `/api/results` | `EvaluationResult` | Unmodified pass-through of Phase 9's own JSON |
| GET | `/api/evidence` | `EvidenceResponse` | Supported / conditional / not-established claims |
| GET | `/api/limitations` | `LimitationsResponse` | Consolidated Phase 4-9 limitations |

## Schemas

See `backend/app/schemas/models.py` for the authoritative definitions; every power/energy field
is unit-suffixed (`_w`, `_wh`, `availability_normalized`) per Section 10.20 — never a bare
`power`, `energy`, or `capacity`.

## Error handling

- `400` — invalid scenario parameter (with the list of valid values in the message)
- `404` — unknown transformer/household ID, or a scenario key with no validated artifact
- `500` — unexpected server error (should not occur against the validated dataset; not
  suppressed or converted to a fabricated `200`)
