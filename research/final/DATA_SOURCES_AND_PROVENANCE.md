# Data Sources & Provenance

## Real source datasets

| Source | What it provides | Real coverage | Provenance notes |
|---|---|---|---|
| **iAWE** (Batra et al., BuildSys 2013) | Appliance-level submetered power, single Delhi household ("building1"), 12 meters (mains x2, refrigerator, AC x2, washing machine, laptop, clothes iron, kitchen outlets, television, others) | 2013-05-24 to 2013-09-18, 1-minute resolution | HDF5 format; appliance labels taken directly from the dataset's own embedded metadata (two independent encodings agree). meter1/meter2 (mains) relationship investigated but unresolved (Gap 5); timezone interpretation inconclusive (Gap 6) |
| **Mathura/Bareilly household energy** (Gupta et al. 2025, Mumbai-context ownership study) | Daily household energy consumption, 8 raw files, multiple meters/years | Full extent processed, all rows preserved (including all-zero rows, explicitly flagged not silently dropped) | `power_w = energy_kwh × 20 × 1000` derivation is DERIVED, not measured; cross-year household identity (same meter ID across year files) explicitly NOT assumed to be the same physical household (Gap M1) |
| **Open-Meteo Historical Weather API** (ERA5/ERA5-Land reanalysis) | Temperature, GHI (shortwave radiation), cloud cover | 2013-06-07 to 2013-09-18, Delhi, hourly | REAL as delivered by the API; the underlying ERA5/ERA5-Land values are themselves a reanalysis-model output, not a direct station observation — documented as such, not presented as ground-truth measurement |
| **CEA distribution-planning criteria** | Real cited range (10-50 kVA) for small single-phase HVDS distribution transformers | Reference range only, not a per-transformer measurement | Used as a plausibility anchor for the synthetic feeder's 25 kVA transformer rating — explicitly NOT a validated rating for this specific synthetic feeder |
| **Appliance parameter evidence** (BEE Schedule 12, IS 8034:2002, Kerala State Energy Dept. guide, POWBAL paper — Khanna, Martin & Muûls) | Rated/typical power ranges for washing machines, pumps, refrigerators | Reference ranges | Used to validate/bound synthetic appliance rated-power assignments, not to generate load curves directly |
| **Mumbai household appliance ownership** | Real ownership-probability reference data | Used as the ownership-probability basis for Bernoulli-realized synthetic appliance ownership | SYNTHETIC realization, REAL probability basis |

## Provenance classification (used identically in every phase)

| Label | Meaning |
|---|---|
| REAL | Directly from a real dataset, unmodified |
| DERIVED | Computed from REAL data via a documented, deterministic transformation |
| SYNTHETIC | Generated to fill a structural gap via a documented method, not measured |
| METHODOLOGICAL_ASSUMPTION / ASSUMED | No real-data basis; used only for demonstration, always explicitly labeled |

## Known unresolved provenance gaps (carried forward, never silently resolved)

- **Gap 5 — iAWE meter1 vs meter2**: which mains channel (if either) reliably represents whole-
  household demand is empirically investigated but unresolved; neither is used as validated
  feeder ground truth anywhere downstream.
- **Gap 6 — iAWE timezone interpretation**: the raw timestamp's local/UTC interpretation is
  inconclusive from the diurnal-pattern test performed; clock-hour-sensitive results (including
  this project's 17:00-20:00 evening window) inherit up to ~5.5 hours of uncertainty.
- **Gap M1 — Mathura/Bareilly cross-year household identity**: not used anywhere downstream that
  would require it (the one archetype built from this source is kept as-is).

Full detail: `phase3_data/processed/phase4a/docs/GAP5_IAWE_MAINS_CHANNELS.md`,
`GAP6_IAWE_TIMEZONE.md`, and the consolidated register at
`phase3_data/processed/phase4d/consolidated_assumptions_uncertainty_register.csv`.
