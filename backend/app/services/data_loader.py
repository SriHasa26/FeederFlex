"""
FeederFlex backend -- data_loader.py

Loads every validated Phase 4-9 artifact the API needs, ONCE, at process startup, into an
in-memory, read-only DataStore. No file under phase3_data/ is ever written to. No simulation is
re-run. All numbers served by the API trace directly to one of these files.
"""
import json
import logging
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Optional

import pandas as pd

from app.core.config import (
    PHASE4B_DIR, PHASE4C_DIR, PHASE6_DIR, PHASE7_DIR, PHASE8_DIR, PHASE9_DIR,
)

logger = logging.getLogger("feederflex.data_loader")


def _read_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@dataclass
class DataStore:
    # Phase 4C -- topology
    household_connections: pd.DataFrame = field(default=None)
    transformer_metrics: pd.DataFrame = field(default=None)
    feeder_load_hourly: pd.DataFrame = field(default=None)
    transformer_load_hourly: pd.DataFrame = field(default=None)
    household_load_hourly: pd.DataFrame = field(default=None)

    # Phase 4B -- appliance population
    appliance_instances: pd.DataFrame = field(default=None)

    # Phase 7 -- flexibility state
    participation_assignments: pd.DataFrame = field(default=None)

    # Phase 6 -- forecast / renewable (context only, NOT consumed by the controller)
    pv_availability_normalized: pd.DataFrame = field(default=None)
    load_forecast_comparison: pd.DataFrame = field(default=None)
    load_forecast_h1h: pd.DataFrame = field(default=None)

    # Phase 8 -- controller grid outputs
    controller_grid_summary: pd.DataFrame = field(default=None)
    controller_constraint_sensitivity: pd.DataFrame = field(default=None)
    fairness_metrics: dict = field(default=None)
    primary_scenario_kpis: dict = field(default=None)
    baseline_case_kpis: dict = field(default=None)
    phase8_validation_results: dict = field(default=None)

    # Phase 9 -- evaluation outputs
    baseline_evaluation: dict = field(default=None)
    counterfactual_evaluation: dict = field(default=None)
    restoration_and_duration_analysis: dict = field(default=None)
    controller_correctness_reconfirmation: dict = field(default=None)
    failure_mode_analysis: dict = field(default=None)
    evening_performance: pd.DataFrame = field(default=None)
    statistical_summary: dict = field(default=None)
    phase9_validation_results: dict = field(default=None)

    _loaded: bool = False

    def load(self):
        if self._loaded:
            return
        logger.info("Loading validated Phase 4-9 artifacts (read-only)...")

        self.household_connections = pd.read_parquet(PHASE4C_DIR / "feeder" / "household_connections.parquet")
        self.transformer_metrics = pd.read_csv(PHASE4C_DIR / "metrics" / "transformer_metrics.csv")
        self.feeder_load_hourly = pd.read_parquet(PHASE4C_DIR / "timeseries" / "feeder_load_hourly.parquet")
        self.transformer_load_hourly = pd.read_parquet(PHASE4C_DIR / "timeseries" / "transformer_load_hourly.parquet")
        self.household_load_hourly = pd.read_parquet(PHASE4C_DIR / "timeseries" / "household_load_hourly.parquet")

        self.appliance_instances = pd.read_parquet(PHASE4B_DIR / "population" / "appliance_instances.parquet")

        self.participation_assignments = pd.read_parquet(PHASE7_DIR / "scenarios" / "participation_assignments.parquet")

        pv = pd.read_csv(PHASE6_DIR / "features" / "pv_availability_normalized.csv")
        pv["timestamp_local"] = pd.to_datetime(pv["timestamp_local"])
        self.pv_availability_normalized = pv
        self.load_forecast_comparison = pd.read_csv(PHASE6_DIR / "metrics" / "load_forecast_comparison_table.csv")
        self.load_forecast_h1h = pd.read_parquet(PHASE6_DIR / "forecasts" / "load_forecast_h1h.parquet")

        self.controller_grid_summary = pd.read_csv(PHASE8_DIR / "scenarios" / "controller_grid_summary.csv")
        self.controller_constraint_sensitivity = pd.read_csv(PHASE8_DIR / "scenarios" / "controller_constraint_sensitivity.csv")
        self.fairness_metrics = _read_json(PHASE8_DIR / "metrics" / "fairness_metrics.json")
        self.primary_scenario_kpis = _read_json(PHASE8_DIR / "metrics" / "primary_scenario_kpis.json")
        self.baseline_case_kpis = _read_json(PHASE8_DIR / "metrics" / "baseline_case_kpis.json")
        self.phase8_validation_results = _read_json(PHASE8_DIR / "PHASE8_VALIDATION_RESULTS.json")

        self.baseline_evaluation = _read_json(PHASE9_DIR / "baseline" / "baseline_evaluation.json")
        self.counterfactual_evaluation = _read_json(PHASE9_DIR / "counterfactual" / "counterfactual_evaluation.json")
        self.restoration_and_duration_analysis = _read_json(PHASE9_DIR / "metrics" / "restoration_and_duration_analysis.json")
        self.controller_correctness_reconfirmation = _read_json(PHASE9_DIR / "evaluation" / "controller_correctness_reconfirmation.json")
        self.failure_mode_analysis = _read_json(PHASE9_DIR / "evaluation" / "failure_mode_analysis.json")
        self.evening_performance = pd.read_csv(PHASE9_DIR / "evaluation" / "evening_performance.csv")
        self.statistical_summary = _read_json(PHASE9_DIR / "metrics" / "statistical_summary.json")
        self.phase9_validation_results = _read_json(PHASE9_DIR / "PHASE9_VALIDATION_RESULTS.json")

        self._loaded = True
        logger.info("Data load complete.")

    def hourly(self, capacity_scenario: str, eligibility_scenario: str, participation_pct: int) -> pd.DataFrame:
        return _load_hourly_cached(capacity_scenario, eligibility_scenario, participation_pct)

    def control_log(self, capacity_scenario: str, eligibility_scenario: str, participation_pct: int) -> pd.DataFrame:
        return _load_control_log_cached(capacity_scenario, eligibility_scenario, participation_pct)

    def shortfall_series(self, capacity_scenario: str) -> pd.DataFrame:
        return _load_shortfall_cached(capacity_scenario)


@lru_cache(maxsize=32)
def _load_hourly_cached(capacity_scenario: str, eligibility_scenario: str, participation_pct: int) -> pd.DataFrame:
    tag = f"{capacity_scenario}_{eligibility_scenario}_participation{participation_pct}"
    path = PHASE8_DIR / "scenarios" / f"hourly_{tag}.parquet"
    if not path.exists():
        raise FileNotFoundError(f"No validated Phase 8 scenario artifact at {path}")
    return pd.read_parquet(path)


@lru_cache(maxsize=32)
def _load_control_log_cached(capacity_scenario: str, eligibility_scenario: str, participation_pct: int) -> pd.DataFrame:
    tag = f"{capacity_scenario}_{eligibility_scenario}_participation{participation_pct}"
    path = PHASE8_DIR / "control_logs" / f"control_log_{tag}.parquet"
    if not path.exists():
        raise FileNotFoundError(f"No validated Phase 8 control log artifact at {path}")
    return pd.read_parquet(path)


@lru_cache(maxsize=8)
def _load_shortfall_cached(capacity_scenario: str) -> pd.DataFrame:
    path = PHASE8_DIR / "scenarios" / f"shortfall_{capacity_scenario}.parquet"
    if not path.exists():
        raise FileNotFoundError(f"No validated Phase 8 shortfall artifact at {path}")
    return pd.read_parquet(path)


store = DataStore()
