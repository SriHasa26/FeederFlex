import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Activity, Home, Network, ShieldCheck, Sun, Zap } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { GridMark } from '../components/GridMark'
import { GridNetworkViz } from '../components/GridNetworkViz'
import { ProblemChart } from '../components/landing/ProblemChart'
import { WhyItMattersCard } from '../components/landing/WhyItMattersCard'
import { EnergyFlowDiagram } from '../components/landing/EnergyFlowDiagram'
import { BeforeAfterComparison } from '../components/landing/BeforeAfterComparison'
import { FeederNetworkDiagram } from '../components/landing/FeederNetworkDiagram'
import { EvidenceDeliveryCards } from '../components/landing/EvidenceDeliveryCards'
import { ExploreEvidenceSection } from '../components/landing/ExploreEvidenceSection'
import { SceneNumber } from '../components/landing/SceneNumber'
import { formatPct, formatWh } from '../utils/format'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as const } }),
}

export function Landing() {
  const results = useApi(() => api.results(), [])
  const feeder = useApi(() => api.feeder(), [])
  const kpis = useApi(() => api.feederKpis({}), [])
  const kpisBaseline = useApi(() => api.feederKpis({ eligibility_scenario: 'baseline' }), [])
  const renewable = useApi(() => api.renewable(1), [])
  const transformers = useApi(() => api.transformers(), [])
  const defaultSeries = useApi(() => api.feederTimeseries({}, { limit: 24 }), [])
  const baselineSeries = useApi(() => api.feederTimeseries({ eligibility_scenario: 'baseline' }, { limit: 24 }), [])
  const limitations = useApi(() => api.limitations(), [])

  const latestRenewablePct = renewable.status === 'success' && renewable.data.points.length
    ? renewable.data.points[renewable.data.points.length - 1].pv_availability_normalized
    : null

  const modeledHours = feeder.status === 'success' ? feeder.data.n_modeled_hours : null
  const modeledPeakW = kpis.status === 'success' ? kpis.data.modeled_peak_w : null
  const avgFlexW = kpis.status === 'success' && modeledHours && kpis.data.delivered_flexibility_wh > 0
    ? kpis.data.delivered_flexibility_wh / modeledHours
    : 0
  const flexibilityRatio = modeledPeakW && modeledPeakW > 0 ? avgFlexW / modeledPeakW : null

  return (
    <div style={{ background: 'var(--ff-bg)', color: 'var(--ff-ink)' }}>
      {/* ---------- Header ---------- */}
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold ff-display">
          <GridMark size={26} />
          FeederFlex
        </div>
        <div className="flex items-center gap-5 text-[13px]">
          <Link to="/methodology" className="hidden text-[var(--ff-ink-dim)] hover:text-[var(--ff-ink)] sm:inline">Methodology</Link>
          <Link to="/limitations" className="hidden text-[var(--ff-ink-dim)] hover:text-[var(--ff-ink)] sm:inline">Limitations</Link>
          <Link
            to="/dashboard"
            className="ff-mono rounded-md px-4 py-2 text-[12px] font-semibold tracking-wide text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--ff-primary)' }}
          >
            Open Simulation
          </Link>
        </div>
      </div>

      {/* ================= SCENE 1 — HERO ================= */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
        <div className="ff-contours" />
        <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
            <span className="ff-mono inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
              style={{ borderColor: 'var(--ff-line-strong)', color: 'var(--ff-secondary)' }}>
              Neighbourhood Energy Flexibility
            </span>

            <motion.h1
              variants={fadeUp} custom={1}
              className="ff-display mt-5 text-[42px] font-extrabold leading-[1.06] tracking-tight md:text-[54px]"
              style={{ color: 'var(--ff-ink)' }}
            >
              Turning flexible demand
              <br />into grid capacity.
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-[var(--ff-ink-dim)]">
              FeederFlex is a research simulation that models neighbourhood-feeder demand,
              forecasts renewable availability, estimates appliance-level flexibility, and applies
              explainable demand-response logic — built entirely on real and derived open datasets.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="ff-mono rounded-lg px-5 py-3 text-[13px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--ff-primary)' }}
              >
                Explore the Simulation
              </Link>
              <Link
                to="/methodology"
                className="ff-mono rounded-lg border px-5 py-3 text-[13px] font-semibold transition-colors hover:bg-[var(--ff-surface-alt)]"
                style={{ borderColor: 'var(--ff-line-strong)', color: 'var(--ff-ink)' }}
              >
                How it works
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-6 flex items-center gap-2 text-[11.5px] text-[var(--ff-ink-faint)]">
              <ShieldCheck size={14} strokeWidth={1.8} style={{ color: 'var(--ff-secondary)' }} />
              Simulation / demonstration system — not a live DISCOM control system.
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <AsyncBoundary state={kpis} label="feeder status">
              {(k) => (
                <GridNetworkViz
                  renewableAvailability={latestRenewablePct}
                  feederLoadW={k.modeled_peak_w}
                  flexibleW={avgFlexW}
                  eventState={k.shortfall_hours > 0 ? 'WATCH' : 'NORMAL'}
                  householdCount={feeder.status === 'success' ? feeder.data.n_households : 100}
                />
              )}
            </AsyncBoundary>
          </motion.div>
        </div>

        {/* ---------- Status strip (real data) ---------- */}
        <div className="mx-auto w-full max-w-[1280px] px-6 pb-12">
          <div className="ff-glass grid grid-cols-2 gap-5 p-5 md:grid-cols-5">
            <AsyncBoundary state={kpis} label="status strip">
              {(k) => (
                <>
                  <StripStat icon={Activity} label="Feeder status" value={k.shortfall_hours > 0 ? 'Watch' : 'Normal'} />
                  <StripStat icon={Sun} label="Renewable availability" value={latestRenewablePct !== null ? formatPct(latestRenewablePct * 100) : '—'} />
                  <StripStat icon={Zap} label="Flexible energy" value={formatWh(k.delivered_flexibility_wh)} />
                </>
              )}
            </AsyncBoundary>
            <AsyncBoundary state={feeder} label="topology">
              {(f) => (
                <>
                  <StripStat icon={Home} label="Households" value={String(f.n_households)} />
                  <StripStat icon={Network} label="Transformers" value={String(f.n_transformers)} />
                </>
              )}
            </AsyncBoundary>
          </div>
        </div>
      </section>

      {/* ================= SCENE 2 — THE PROBLEM ================= */}
      <section className="relative flex min-h-screen items-center overflow-hidden py-20" style={{ background: 'var(--ff-surface)' }}>
        <SceneNumber n="01" side="right" />
        <div className="relative mx-auto grid w-full max-w-[1280px] gap-12 px-6 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
            <span className="ff-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--ff-secondary)' }}>The problem</span>
            <h2 className="ff-display mt-2 text-[30px] font-bold leading-[1.1] tracking-tight text-[var(--ff-ink)] md:text-[36px]">
              Evening demand rises as solar availability falls.
            </h2>
            <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-[var(--ff-ink-dim)]">
              Low-income neighbourhood feeders face demand peaks just as solar generation falls
              away — with little operational margin and, in many households, no battery storage or
              rooftop solar to fall back on. FeederFlex investigates whether software-only,
              appliance-level demand response can provide meaningful flexibility instead.
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              className="ff-card p-5"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AsyncBoundary state={defaultSeries} label="24-hour demand/renewable trace">
                {(ts) => <ProblemChart points={ts.points} />}
              </AsyncBoundary>
            </motion.div>

            <div className="relative mt-6 flex justify-center md:absolute md:-bottom-10 md:-left-10 md:mt-0 md:justify-start">
              <WhyItMattersCard renewableRatio={latestRenewablePct} flexibilityRatio={flexibilityRatio} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SCENE 3 — HOW FEEDERFLEX WORKS ================= */}
      <section className="relative flex min-h-screen items-center overflow-hidden py-24" style={{ background: 'var(--ff-bg-alt)' }}>
        <SceneNumber n="02" side="left" />
        <div className="relative mx-auto w-full max-w-[1200px] px-6">
          <SectionHeading eyebrow="How FeederFlex works" title="From real metering to explainable dispatch." />
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[var(--ff-ink-dim)]">
            One continuous pipeline, five stages — hover any stage to see exactly what it does and
            what it hands to the next one.
          </p>
          <div className="mt-16">
            <EnergyFlowDiagram />
          </div>
        </div>
      </section>

      {/* ================= SCENE 4 — BEFORE / AFTER ================= */}
      <section className="relative flex min-h-screen items-center overflow-hidden py-20" style={{ background: 'var(--ff-bg-mint)' }}>
        <SceneNumber n="03" side="right" />
        <div className="relative mx-auto w-full max-w-[1000px] px-6">
          <SectionHeading eyebrow="What flexibility changes" title="Without flexibility, versus with it." />
          <p className="mt-3 max-w-2xl text-[13.5px] text-[var(--ff-ink-dim)]">
            A real, modeled comparison — not an animation of arbitrary numbers. Toggle between the
            evidence-backed baseline and the counterfactual broad-eligibility scenario.
          </p>
          <div className="mt-8">
            <AsyncBoundary state={defaultSeries} label="counterfactual 24-hour trace">
              {(after) => (
                <AsyncBoundary state={baselineSeries} label="baseline 24-hour trace">
                  {(before) => (
                    <BeforeAfterComparison
                      pointsBaseline={before.points}
                      pointsCounterfactual={after.points}
                      kpisBaseline={kpisBaseline.status === 'success' ? kpisBaseline.data : null}
                      kpisCounterfactual={kpis.status === 'success' ? kpis.data : null}
                    />
                  )}
                </AsyncBoundary>
              )}
            </AsyncBoundary>
          </div>
        </div>
      </section>

      {/* ================= SCENE 5 — GRID SCHEMATIC ================= */}
      <section className="relative min-h-screen overflow-hidden py-20" style={{ background: 'var(--ff-bg-warm)' }}>
        <SceneNumber n="04" side="left" />
        <div className="relative mx-auto w-full max-w-[1200px] px-6">
          <SectionHeading eyebrow="Grid schematic" title="A synthetic 11-transformer neighbourhood feeder." />
          <p className="mt-3 max-w-2xl text-[13.5px] text-[var(--ff-ink-dim)]">
            Engineering-style schematic, not a geographic map. Hover a transformer for its real
            modeled peak demand and household count; play the panel on the right to step through a
            real modeled day.
          </p>
          <div className="mt-8">
            <AsyncBoundary state={transformers} label="transformers">
              {(list) => (
                <AsyncBoundary state={defaultSeries} label="feeder timeseries">
                  {(ts) => <FeederNetworkDiagram transformers={list} points={ts.points} renewableLatestPct={latestRenewablePct} />}
                </AsyncBoundary>
              )}
            </AsyncBoundary>
          </div>
        </div>
      </section>

      {/* ================= SCENE 6 — WHAT FEEDERFLEX DELIVERS ================= */}
      <section className="relative flex min-h-screen items-center overflow-hidden py-20" style={{ background: 'var(--ff-surface)' }}>
        <SceneNumber n="05" side="right" />
        <div className="relative mx-auto w-full max-w-[1100px] px-6">
          <SectionHeading eyebrow="Scope" title="What FeederFlex actually delivers." />
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[var(--ff-ink-dim)]">
            Not a promise of what the system might someday do — a description of what this build
            actually does today, and where its edges are.
          </p>
          <div className="mt-12">
            <EvidenceDeliveryCards items={limitations.status === 'success' ? limitations.data.items : null} />
          </div>
        </div>
      </section>

      {/* ================= SCENE 7 — EXPLORE THE EVIDENCE ================= */}
      <section className="relative flex min-h-screen items-center overflow-hidden py-20" style={{ background: 'var(--ff-bg-alt)' }}>
        <SceneNumber n="06" side="left" />
        <div className="relative mx-auto w-full max-w-[1200px] px-6">
          <ExploreEvidenceSection />
        </div>
      </section>

      {/* ---------- Results glance (kept factual, folded into a compact strip) ---------- */}
      <section className="py-14" style={{ background: 'var(--ff-surface)' }}>
        <div className="mx-auto max-w-[1000px] px-6">
          <span className="ff-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--ff-secondary)' }}>At a glance</span>
          <AsyncBoundary state={results} label="validated results">
            {(data) => {
              const broad = (data.counterfactual as any)?.results?.counterfactual_broad?.participation_90
              return (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <ResultCard label="Evidence-backed baseline" value="0 W" sub="available flexibility, every hour tested" accent="var(--ff-ink)" />
                  <ResultCard label="Counterfactual · 90% participation" value={formatWh(broad?.delivered_flexibility_wh)} sub="curtailed energy delivered (illustrative)" accent="var(--ff-counterfactual)" />
                  <ResultCard label="Counterfactual · shortfall coverage" value={formatPct(broad?.shortfall_coverage_ratio * 100)} sub="of requested flexibility (illustrative)" accent="var(--ff-counterfactual)" />
                </div>
              )
            }}
          </AsyncBoundary>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="py-20 text-center" style={{ background: 'var(--ff-bg)' }}>
        <h2 className="ff-display text-[26px] font-bold text-[var(--ff-ink)]">Explore the simulated grid.</h2>
        <p className="mx-auto mt-3 max-w-xl text-[14px] text-[var(--ff-ink-dim)]">
          Live playback of modeled demand, renewable availability, controller dispatch, and
          household/transformer-level explainability.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="ff-mono inline-block rounded-lg px-6 py-3 text-[13px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--ff-primary)' }}
          >
            Open Simulation
          </Link>
          <Link
            to="/methodology"
            className="ff-mono inline-block rounded-lg border px-6 py-3 text-[13px] font-semibold transition-colors hover:bg-[var(--ff-surface-alt)]"
            style={{ borderColor: 'var(--ff-line-strong)', color: 'var(--ff-ink)' }}
          >
            Read Methodology
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-[var(--ff-ink-faint)]" style={{ borderColor: 'var(--ff-line)' }}>
        FeederFlex — a research simulation pipeline. Simulation / demonstration only.
      </footer>
    </div>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="ff-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--ff-secondary)' }}>{eyebrow}</span>
      <h2 className="ff-display mt-2 text-[26px] font-bold leading-tight text-[var(--ff-ink)] md:text-[30px]">{title}</h2>
    </div>
  )
}

function StripStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-primary)' }}>
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <div className="flex flex-col">
        <span className="ff-mono text-[9.5px] uppercase tracking-wide text-[var(--ff-ink-faint)]">{label}</span>
        <span className="ff-mono text-[15px] font-semibold text-[var(--ff-ink)]">{value}</span>
      </div>
    </div>
  )
}

function ResultCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="ff-card p-5">
      <p className="ff-mono text-[10.5px] uppercase tracking-wide text-[var(--ff-ink-faint)]">{label}</p>
      <p className="ff-mono mt-2 text-[24px] font-bold" style={{ color: accent }}>{value}</p>
      <p className="mt-1 text-[12px] text-[var(--ff-ink-faint)]">{sub}</p>
    </div>
  )
}
