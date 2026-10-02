import { useState } from 'react'
import { motion } from 'framer-motion'

export interface WhyItMattersCardProps {
  /** Renewable availability as a fraction of demand-scale headroom, [0,1] or null if unavailable. */
  renewableRatio: number | null
  /** Delivered/available flexibility as a fraction of modeled peak demand, [0,1] or null. */
  flexibilityRatio: number | null
}

/** A floating explanatory card: demand is always the full-width reference bar; renewable and
 *  flexibility are shown as real, derived fractions of it -- never invented proportions. */
export function WhyItMattersCard({ renewableRatio, flexibilityRatio }: WhyItMattersCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="ff-glass relative max-w-sm p-5"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="ff-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--ff-secondary)' }}>
        Why it matters
      </span>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--ff-ink-dim)]">
        When renewable availability falls while demand stays high, the feeder has less operating margin.
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        <Bar label="Demand" ratio={1} color="var(--ff-critical)" hovered={hovered} />
        <Bar label="Renewable" ratio={renewableRatio} color="var(--ff-energy)" hovered={hovered} />
        <Bar label="Flexibility" ratio={flexibilityRatio} color="var(--ff-primary)" hovered={hovered} />
      </div>
    </motion.div>
  )
}

function Bar({ label, ratio, color, hovered }: { label: string; ratio: number | null; color: string; hovered: boolean }) {
  const pct = ratio === null ? 0 : Math.max(2, Math.min(100, ratio * 100))
  return (
    <div className="flex items-center gap-3">
      <span className="ff-mono w-[74px] shrink-0 text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">{label}</span>
      <div className="ff-neu-inset h-2.5 flex-1 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: ratio === null ? '0%' : `${hovered ? Math.min(100, pct * 1.06) : pct}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="ff-mono w-9 shrink-0 text-right text-[10.5px] font-medium text-[var(--ff-ink-dim)]">
        {ratio === null ? '—' : `${Math.round(pct)}%`}
      </span>
    </div>
  )
}
