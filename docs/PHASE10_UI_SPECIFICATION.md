# Phase 10 — UI Specification

## Routes

| Route | Purpose | Auth-gated? |
|---|---|---|
| `/` | Landing page (Section 10.4-10.5) | No |
| `/dashboard` | Main simulation dashboard, playback timeline (Section 10.6-10.9) | No |
| `/transformers` | 11 synthetic transformers, list + detail (Section 10.11) | No |
| `/households` | 100 synthetic households, searchable list + detail (Section 10.12) | No |
| `/appliances` | Modeled appliance population, 4/13 coverage notice (Section 10.13) | No |
| `/scenarios` | Scenario Lab — capacity/eligibility/participation selector + comparison (Section 10.14) | No |
| `/results` | Validated Phase 9 results, 6 sections (Section 10.16) | No |
| `/methodology` | Pipeline diagram + provenance classification (Section 10.15) | No |
| `/evidence` | Supported / Conditional / Not-established claim matrix (Section 10.17) | No |
| `/limitations` | Consolidated limitations (Section 10.18) | No |

No authentication exists anywhere in Phase 10 — this is a public demonstration, not a
credentialed operational tool.

## Evidence-class visual semantics (Section 10.25)

| State | Treatment |
|---|---|
| `EVIDENCE-BACKED` | Teal badge, calm, no pulse |
| `COUNTERFACTUAL · ILLUSTRATIVE` | Amber badge, always shown together with the label text, never a bare color |
| `NOT ESTABLISHED` | Neutral slate badge |
| Event state `NORMAL` | Slate, calm |
| Event state `WATCH` | Yellow |
| Event state `SHORTFALL` | Orange, subtle pulse |
| Event state `INSUFFICIENT_FLEXIBILITY` | Red, subtle pulse |
| Event state `RESTORING` | Sky blue |

Counterfactual results are never rendered with a more prominent or "more official" visual
treatment than evidence-backed results — both use the same card/typography scale; only the badge
color and copy differ.

## Dashboard playback (Section 10.7)

A horizontal range slider plus Previous/Play/Pause/Next buttons scrub through the already-loaded
`FeederTimeseriesPoint[]` array (fetched once per scenario change). "Play" advances the index on
a fixed client-side timer (250ms/step) — this is a **deterministic replay of historical
simulation data already returned by the API**, not a live data stream and not randomly
generated. Changing the timeline index updates: net demand, renewable offset, permitted import,
requested/available/delivered/unmet flexibility, active interventions, and the event-state badge
— all read directly from the point at that index.

## Error / empty states (Section 10.27)

`AsyncBoundary` (`src/components/AsyncBoundary.tsx`) renders exactly one of three states for
every data-dependent section: a loading spinner with contextual label, an explicit error panel
(never a fabricated zero), or the real content. The zero-flexibility baseline case is
distinguished from an error: `FlexibilityState.zero_flexibility_explanation` is populated by the
backend precisely when `available_flexibility_w === 0`, and the frontend renders it as an
explanatory note, not as an error.

## Responsive design (Section 10.26)

Tailwind's responsive utilities (`md:`, `lg:`) collapse KPI/table grids from 6/4 columns down to
2 on narrower viewports; the main nav wraps and scrolls horizontally rather than overflowing the
viewport. Tested at desktop (1440px), laptop (1280px), and tablet (768px) widths.
