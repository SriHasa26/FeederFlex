# Problem Statement

## The setting

Low-income and peri-urban neighbourhood electricity feeders in Indian cities — the kind serving
slum-rehabilitation housing (SRH) and informal settlements — face evening demand peaks (roughly
17:00-20:00) that coincide with the loss of solar generation as the sun sets. Distribution
transformers serving these neighbourhoods are typically small (single-phase HVDS, commonly in
the 10-50 kVA range per CEA planning guidance), leaving little operational margin during a
coincident stress period.

## Why conventional flexibility tools don't apply here

The two most common residential demand-side flexibility levers — home battery storage and
rooftop solar — are largely unavailable in this population: low-income households rarely own
either. Conventional smart-home demand response also frequently assumes a smartphone app and
reliable home Wi-Fi, which cannot be assumed either.

## The research question this project investigates

*"Can automated appliance-level demand response provide meaningful evening feeder flexibility
for low-income Indian households without relying on household batteries, rooftop solar,
smartphones, or Wi-Fi?"*

This is deliberately narrow: the question is about the **control mechanism** (can
appliance-level switching alone, in principle, produce useful flexibility), not about whether a
specific communication channel (SMS, USSD, LoRa) is feasible — those are explicitly out of scope
for the simulation itself.

## Why a simulation, not a field study

No field access, hardware deployment, or real household participation is available to this
project. A simulation grounded in real appliance-level metering and real household consumption
data is the only feasible way to investigate the question with the data actually accessible —
and, critically, the project treats the gap between simulation and field validation as a first-
class limitation to report, not something to paper over.

## What "meaningful flexibility" means here, precisely

The project defines and measures four concrete, auditable quantities at feeder level: requested
flexibility (a shortfall against an assumed import ceiling), available flexibility (what the
currently-eligible, currently-on appliance population could deliver), delivered flexibility
(what the controller actually dispatches), and unmet flexibility (what remains uncovered). "Is
flexibility meaningful" is answered by reporting these four numbers under an evidence-backed
baseline and, separately, under explicitly labeled counterfactual assumptions — never by a single
headline claim without its supporting evidence class.
