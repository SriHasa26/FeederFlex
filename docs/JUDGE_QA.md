# Judge Q&A

Every answer below matches the evidence classification in `research/final/CLAIM_MATRIX.md` —
no answer here claims more than that document supports.

**1. What problem are you solving?**
Whether automated, appliance-level demand response can provide meaningful evening flexibility on
low-income Indian neighbourhood feeders, without batteries, rooftop solar, or a smartphone/Wi-Fi
dependency in the control mechanism itself. See `research/final/PROBLEM_STATEMENT.md`.

**2. Why is renewable intermittency difficult?**
Evening demand peaks (17:00-20:00) coincide with the loss of solar generation, and small
neighbourhood transformers have little operational margin during a coincident stress period.

**3. Why not batteries?**
Low-income households in this target population typically do not own battery storage or rooftop
solar — the premise of the research question is explicitly to find flexibility without them.

**4. What exactly does FeederFlex control?**
Nothing in the real world — it is a simulation. In the simulated controller, it selects among
currently-on, currently-eligible appliance instances (binary on/off) to model temporary
curtailment.

**5. How does the controller choose appliances?**
A deterministic ranking: highest current power first (minimizes the number of interventions
needed), then a fairness penalty (avoids repeatedly picking the same household), then runtime
slack, then appliance ID for full determinism. No ML, no MILP. Detail:
`research/final/DR_CONTROLLER_METHOD.md`.

**6. What data did you use?**
Real appliance-level metering (iAWE, one Delhi household, 12 meters), real household energy data
(Mathura/Bareilly), real weather (Open-Meteo/ERA5), and real reference ranges for appliance power
and transformer capacity (BEE, BIS, CEA, Kerala State Energy Dept.). Full list:
`research/final/DATA_SOURCES_AND_PROVENANCE.md`.

**7. Why synthetic feeder?**
No real feeder-level dataset for this population was available. A synthetic feeder anchored to
real ownership/consumption data and a real cited capacity range lets the flexibility/controller
methodology be exercised on realistic numbers, explicitly labeled as synthetic throughout.

**8. Is this a real DISCOM feeder?**
No. It is entirely synthetic, built from real household-level source data but never validated
against, or connected to, any actual feeder.

**9. Is SCADA integrated?**
No. No SCADA, IEC-104, or equivalent protocol integration exists anywhere in this project.

**10. What happens if households do not participate?**
Participation is modeled explicitly and separately from ownership — a non-participating
household's appliances never enter the eligible candidate pool, at any hour, under any scenario
(verified, 0 violations). Lower participation reduces available and delivered flexibility.

**11. What happens if flexibility is insufficient?**
The controller reports `INSUFFICIENT_FLEXIBILITY` and the exact unmet amount — it never
fabricates a resolution. In the primary demonstration scenario this occurs in 357 of 1,491
modeled hours.

**12. How do you protect critical appliances?**
Every appliance instance carries a criticality/eligibility classification (e.g. refrigerator is
always critical); protected instances never enter the candidate pool regardless of scenario —
verified (0 protected-load violations across every test).

**13. How do you protect user opt-outs?**
A non-participating household's appliances are filtered out before ranking ever runs — the same
mechanical gate as question 10; verified absolute (0 violations).

**14. How do you prevent repeated interruptions?**
A daily interruption-count limit (illustrative, ASSUMED value) and a cooldown period after each
restoration, both enforced as hard filters; a fairness penalty in ranking further discourages
repeatedly selecting the same household among power-equivalent candidates.

**15. What does the 4/13 limitation mean?**
Only 4 of 13 appliance types owned by the synthetic population have real load-profile data
(refrigerator, AC, laptop, television). Every flexibility and dispatch number in this project
describes only this modeled subset — never extrapolated to the other 9 types.

**16. What is actually proven?**
That the evidence-backed baseline has 0 W flexibility under the current appliance population;
that the controller mechanism enforces its constraints correctly (0 violations); that Phase 6's
forecast models are measurably accurate against historical data. See
`research/final/CLAIM_MATRIX.md` Category A.

**17. What remains unproven?**
Real household participation or adoption; field-validated feeder/transformer capacity; any
real-world cost or reliability outcome; hardware or DISCOM/SCADA integration feasibility. See
Category C of the same document.

**18. What would you need for a field pilot?**
Real load-profile data for the remaining 9 appliance types (or evidence they're not needed),
real household recruitment and consent, a real communication/control mechanism (out of scope
here), and field-measured transformer capacity in place of the current plausibility anchor.

**19. How would DISCOM integration work conceptually?**
Not designed or implemented here. Conceptually, the controller's decision layer (Phase 8) would
need a real-time data feed in place of retrospective historical load, and a real communication
channel to the appliance/relay layer — both explicitly out of scope for this project.

**20. What is the research contribution?**
A fully-labeled, reproducible, gap-closed simulation pipeline and demonstration application for
appliance-level DR research on Indian low-income feeders, including a rigorous evidence-
classification discipline applied end-to-end. See `research/final/RESEARCH_CONTRIBUTION.md`.
