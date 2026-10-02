import { motion } from 'framer-motion'
import type { EventState } from '../types/api'
import { EventStateBadge } from './Badges'

export interface GridNetworkVizProps {
  /** Normalized [0,1] renewable availability -- real/derived data, never invented. */
  renewableAvailability: number | null
  /** Current modeled feeder load, watts. */
  feederLoadW: number | null
  /** Current available/delivered flexibility, watts. */
  flexibleW: number | null
  eventState: EventState | null
  householdCount?: number
  compact?: boolean
}

const HOUSEHOLDS = [0, 1, 2, 3, 4]

/** A stylized, animated miniature distribution network:
 *  Renewable -> Feeder bus -> Transformer -> Households.
 *  All displayed figures are passed in as props from real API data -- this component invents
 *  no numbers of its own; a null value renders "—" rather than a fabricated placeholder. */
export function GridNetworkViz({ renewableAvailability, feederLoadW, flexibleW, eventState, householdCount = 100, compact = false }: GridNetworkVizProps) {
  const renewPct = renewableAvailability !== null ? Math.round(renewableAvailability * 100) : null
  const h = compact ? 320 : 420

  return (
    <div className="ff-card relative overflow-hidden p-5">
      <div className="ff-contours" />
      <div className="relative flex items-center justify-between">
        <span className="ff-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ff-ink-faint)]">Live network model</span>
        {eventState && <EventStateBadge state={eventState} size="sm" />}
      </div>

      <svg viewBox={`0 0 320 ${h}`} width="100%" height={h} className="relative mt-2">
        {/* Renewable node */}
        <g transform="translate(160, 30)">
          <motion.circle
            fill="none" stroke="var(--ff-energy)" strokeWidth="2"
            initial={{ r: 16, opacity: 0.5 }}
            animate={{ r: [16, 19, 16], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle r="10" fill="var(--ff-energy)" />
          <text x="0" y="-24" textAnchor="middle" className="ff-mono" fontSize="9" fill="var(--ff-ink-faint)" letterSpacing="0.05em">
            SOLAR AVAILABILITY
          </text>
          <text x="0" y="4" textAnchor="middle" className="ff-mono" fontSize="10" fontWeight="700" fill="#4B3A12">
            {renewPct !== null ? `${renewPct}%` : '—'}
          </text>
        </g>

        {/* Renewable -> feeder bus line */}
        <FlowLine x1={160} y1={46} x2={160} y2={90} color="var(--ff-energy)" />

        {/* Feeder bus */}
        <g transform="translate(160, 100)">
          <rect x="-90" y="-6" width="180" height="12" rx="6" fill="var(--ff-surface-sunken)" stroke="var(--ff-line-strong)" />
          <text x="0" y="-14" textAnchor="middle" className="ff-mono" fontSize="9" fill="var(--ff-ink-faint)" letterSpacing="0.05em">
            FEEDER LOAD
          </text>
          <text x="0" y="26" textAnchor="middle" className="ff-mono" fontSize="10" fontWeight="700" fill="var(--ff-ink)">
            {feederLoadW !== null ? `${(feederLoadW / 1000).toFixed(2)} kW` : '—'}
          </text>
        </g>

        {/* Feeder -> transformer */}
        <FlowLine x1={160} y1={112} x2={160} y2={150} color="var(--ff-primary)" />

        {/* Transformer */}
        <g transform="translate(160, 168)">
          <motion.circle
            fill="rgba(31,92,69,0.10)"
            initial={{ r: 20 }}
            animate={{ r: [20, 26, 20] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle r="14" fill="var(--ff-primary)" />
          <path d="M-5,-6 L2,-2 L-2,1 L5,6" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="0" y="34" textAnchor="middle" className="ff-mono" fontSize="9" fill="var(--ff-ink-faint)" letterSpacing="0.05em">
            TRANSFORMER
          </text>
        </g>

        {/* Transformer -> households fan-out */}
        {HOUSEHOLDS.map((i) => {
          const x = 40 + i * 60
          return <FlowLine key={i} x1={160} y1={186} x2={x} y2={236} color="var(--ff-secondary)" thin />
        })}

        {/* Household nodes */}
        {HOUSEHOLDS.map((i) => {
          const x = 40 + i * 60
          return (
            <g key={i} transform={`translate(${x}, 248)`}>
              <motion.circle
                r="7" fill="var(--ff-secondary)"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              />
              <path d="M-4,1 L0,-3 L4,1 M-3,0 V4 H3 V0" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        })}
        <text x="160" y="278" textAnchor="middle" className="ff-mono" fontSize="9" fill="var(--ff-ink-faint)" letterSpacing="0.05em">
          {householdCount} HOUSEHOLDS (MODELED)
        </text>

        {/* Flexibility readout */}
        <g transform={`translate(160, ${h - 28})`}>
          <rect x="-70" y="-16" width="140" height="30" rx="8" fill="var(--ff-surface)" stroke="var(--ff-line)" />
          <text x="0" y="-4" textAnchor="middle" className="ff-mono" fontSize="8.5" fill="var(--ff-ink-faint)" letterSpacing="0.05em">
            AVAILABLE FLEXIBILITY
          </text>
          <text x="0" y="10" textAnchor="middle" className="ff-mono" fontSize="11" fontWeight="700" fill="var(--ff-primary)">
            {flexibleW !== null ? `${flexibleW.toFixed(0)} W` : '—'}
          </text>
        </g>
      </svg>
    </div>
  )
}

function FlowLine({ x1, y1, x2, y2, color, thin }: { x1: number; y1: number; x2: number; y2: number; color: string; thin?: boolean }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={0.18} strokeWidth={thin ? 1.5 : 3} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={thin ? 1.2 : 2} className="ff-flow-line" strokeLinecap="round" />
    </g>
  )
}
