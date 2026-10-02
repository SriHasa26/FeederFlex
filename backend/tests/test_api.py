"""
Smoke + data-consistency tests for the FeederFlex API. These are read-only checks against the
validated Phase 8/9 artifacts -- nothing here re-runs a simulation.
"""
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.data_loader import store

store.load()  # TestClient's lifespan context isn't always triggered by a bare instantiation;
# load explicitly so tests don't depend on that behavior.
client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_feeder_overview():
    r = client.get("/api/feeder")
    assert r.status_code == 200
    body = r.json()
    assert body["n_households"] == 100
    assert body["n_transformers"] == 11
    assert body["n_modeled_hours"] == 1491


def test_feeder_timeseries_default_scenario():
    r = client.get("/api/feeder/timeseries", params={"limit": 10})
    assert r.status_code == 200
    body = r.json()
    assert len(body["points"]) == 10
    assert body["scenario"]["capacity_scenario"] == "assumed_stress_test"


def test_feeder_timeseries_invalid_scenario():
    r = client.get("/api/feeder/timeseries", params={"eligibility_scenario": "nonexistent"})
    assert r.status_code == 400


def test_feeder_kpis_baseline_zero_flexibility():
    r = client.get("/api/feeder/kpis", params={"eligibility_scenario": "baseline"})
    assert r.status_code == 200
    body = r.json()
    assert body["delivered_flexibility_wh"] == 0.0
    assert body["interventions"] == 0


def test_flexibility_baseline_explanation_present():
    r = client.get("/api/flexibility", params={"eligibility_scenario": "baseline"})
    assert r.status_code == 200
    body = r.json()
    assert body["available_flexibility_w"] == 0.0
    assert body["zero_flexibility_explanation"] is not None


def test_forecast():
    r = client.get("/api/forecast", params={"limit": 5})
    assert r.status_code == 200
    body = r.json()
    assert len(body["points"]) == 5
    assert "not consume" in body["note"] or "NOT consume" in body["note"]


def test_renewable():
    r = client.get("/api/renewable", params={"limit": 5})
    assert r.status_code == 200
    assert len(r.json()["points"]) == 5


def test_controller_state_and_events():
    r = client.get("/api/controller/state")
    assert r.status_code == 200
    r2 = client.get("/api/controller/events", params={"limit": 5})
    assert r2.status_code == 200
    assert r2.json()["total_events"] > 0


def test_transformers_list_and_detail():
    r = client.get("/api/transformers")
    assert r.status_code == 200
    transformers = r.json()
    assert len(transformers) == 11
    tid = transformers[0]["transformer_id"]
    r2 = client.get(f"/api/transformers/{tid}")
    assert r2.status_code == 200
    assert r2.json()["n_households"] == transformers[0]["n_households"]


def test_transformer_unknown_404():
    r = client.get("/api/transformers/NOT_A_TRANSFORMER")
    assert r.status_code == 404


def test_households_list_and_detail():
    r = client.get("/api/households")
    assert r.status_code == 200
    households = r.json()
    assert len(households) == 100
    hid = households[0]["household_id"]
    r2 = client.get(f"/api/households/{hid}")
    assert r2.status_code == 200


def test_appliances():
    r = client.get("/api/appliances")
    assert r.status_code == 200
    body = r.json()
    assert body["n_profiled_types"] == 4
    assert body["n_total_types"] == 13
    profiled = [t for t in body["types"] if t["has_real_load_profile"]]
    assert len(profiled) == 4


def test_appliances_excludes_iawe_donor_household():
    """Regression test (found by the Phase 11 E2E suite): appliance_instances.parquet also
    carries 9 REAL rows for the single iAWE donor household (iAWE_house1), a provenance
    reference NOT part of the 100-household synthetic feeder. An earlier version of
    GET /api/appliances failed to filter to provenance_class == 'SYNTHETIC', which counted
    iAWE_house1's appliances too and reported 16 total types instead of the correct 13
    (matching Phase 7's own established check 7.22.18) -- with air_conditioner specifically
    showing 2 instead of the correct 1 (Phase 7's documented n=1 AC-owning household)."""
    r = client.get("/api/appliances")
    body = r.json()
    ac = next(t for t in body["types"] if t["appliance_type"] == "air_conditioner")
    assert ac["n_instances"] == 1
    assert {t["appliance_type"] for t in body["types"]} == {
        "ceiling_fan", "led_lighting", "refrigerator", "television", "mixer_grinder",
        "clothes_iron", "cfl_lighting", "exhaust_fan", "washing_machine", "bulb_lighting",
        "laptop_computer", "table_fan", "air_conditioner",
    }


def test_scenarios_list():
    r = client.get("/api/scenarios")
    assert r.status_code == 200
    scenarios = r.json()["scenarios"]
    assert len(scenarios) == 13


def test_scenario_result():
    r = client.get("/api/scenarios/assumed_stress_test__counterfactual_broad__90")
    assert r.status_code == 200
    body = r.json()
    assert abs(body["curtailed_energy_wh"] - 846511.4671144746) < 1.0


def test_results_bundle():
    r = client.get("/api/results")
    assert r.status_code == 200
    body = r.json()
    assert "baseline" in body and "counterfactual" in body


def test_evidence():
    r = client.get("/api/evidence")
    assert r.status_code == 200
    body = r.json()
    assert len(body["not_established"]) == 6


def test_limitations():
    r = client.get("/api/limitations")
    assert r.status_code == 200
    assert len(r.json()["items"]) >= 15


# --- Section 10.29 data-consistency checks: Phase 9 artifact == backend response ---

PHASE9_DIR = Path(__file__).resolve().parents[2] / "phase3_data" / "processed" / "phase9"
PHASE8_DIR = Path(__file__).resolve().parents[2] / "phase3_data" / "processed" / "phase8"


def test_consistency_baseline_available_flexibility():
    with open(PHASE9_DIR / "baseline" / "baseline_evaluation.json", encoding="utf-8") as f:
        phase9_value = json.load(f)["by_participation"]["participation_90"]["available_flexibility_w_sum"]
    api_value = client.get("/api/flexibility", params={"eligibility_scenario": "baseline", "participation_pct": 90}).json()["available_flexibility_w"]
    assert phase9_value == 0.0
    assert api_value == phase9_value


def test_consistency_primary_curtailed_energy():
    import pandas as pd
    grid = pd.read_csv(PHASE8_DIR / "scenarios" / "controller_grid_summary.csv")
    row = grid[(grid["capacity_scenario"] == "assumed_stress_test") & (grid["eligibility_scenario"] == "counterfactual_broad") & (grid["participation_pct"] == 90)].iloc[0]
    api_value = client.get("/api/scenarios/assumed_stress_test__counterfactual_broad__90").json()["curtailed_energy_wh"]
    assert abs(api_value - row["total_curtailed_energy_wh"]) < 1.0


def test_consistency_participation_counts():
    import pandas as pd
    part = pd.read_parquet(Path(__file__).resolve().parents[2] / "phase3_data" / "processed" / "phase7" / "scenarios" / "participation_assignments.parquet")
    expected = {30: 28, 50: 50, 70: 73, 90: 91}
    for pct, n in expected.items():
        actual = int(part[part["scenario_participation_pct"] == pct]["participating"].sum())
        assert actual == n
        api_value = client.get("/api/flexibility", params={"participation_pct": pct}).json()["participating_households"]
        assert api_value == n


def test_consistency_transformer_and_household_counts():
    assert len(client.get("/api/transformers").json()) == 11
    assert len(client.get("/api/households").json()) == 100


if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v"]))
