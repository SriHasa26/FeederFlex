import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, Network, Sun, Sliders, Radio } from 'lucide-react'

const NODES = [
  { title: 'Households', icon: Home, body: 'Real appliance-level metering grounds a synthetic low-income population — the source of every load profile.' },
  { title: 'Feeder', icon: Network, body: '100 households aggregate onto 11 transformers, anchored to a real CEA transformer-capacity range.' },
  { title: 'Renewable Availability', icon: Sun, body: 'Normalized solar availability, derived from real weather data — never treated as measured generation.' },
  { title: 'Flexibility Engine', icon: Sliders, body: 'Appliance-level eligibility and available-now flexibility, estimated under an evidence-backed taxonomy.' },
  { title: 'Grid Response', icon: Radio, body: 'A constrained dispatch controller responds to modeled shortfall, transparently reporting what it cannot cover.' },
]

const LEGEND = [
  { label: 'Load', color: 'var(--ff-critical)' },
  { label: 'Renewable', color: 'var(--ff-energy)' },
  { label: 'Flexibility', color: 'var(--ff-primary)' },
  { label: 'Stress', color: 'var(--ff-warn)' },
]

/** An interactive, node-and-flow retelling of the pipeline -- households through to grid
 *  response -- with animated flow particles and an expand-on-hover explanation, so the whole
 *  process reads in a few seconds without needing electrical-engineering background. */
export function EnergyFlowDiagram() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div>
      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-3">
        {NODES.map((node, i) => {
          const Icon = node.icon
          const isActive = active === i
          return (
            <div key={node.title} className="relative flex flex-col items-center">
              {i > 0 && (
                <div className="pointer-events-none absolute right-full top-12 hidden h-px w-3 md:block lg:w-6" aria-hidden />
              )}
              <motion.button
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="ff-card flex h-24 w-24 flex-col items-center justify-center gap-1"
                animate={{ scale: isActive ? 1.1 : 1, boxShadow: isActive ? '0 16px 40px rgba(31,92,69,0.22)' : undefined }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ borderColor: isActive ? 'var(--ff-primary)' : undefined, zIndex: isActive ? 2 : 1 }}
              >
                <span className="ff-mono text-[9.5px] font-semibold text-[var(--ff-ink-faint)]">0{i + 1}</span>
                <Icon size={28} strokeWidth={1.7} style={{ color: isActive ? 'var(--ff-primary)' : 'var(--ff-secondary)' }} />
              </motion.button>

              <span className="ff-display mt-4 text-center text-[14px] font-bold leading-tight text-[var(--ff-ink)]">{node.title}</span>

              <AnimatePresence>
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-[168px] overflow-hidden text-center text-[11.5px] leading-relaxed text-[var(--ff-ink-dim)]"
                  >
                    {node.body}
                  </motion.p>
                )}
              </AnimatePresence>

              {i < NODES.length - 1 && <FlowConnector active={active === i || active === i + 1} />}
            </div>
          )
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t pt-5" style={{ borderColor: 'var(--ff-line)' }}>
        {LEGEND.map((l) => (
          <span key={l.label} className="ff-mono inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ff-ink-faint)]">
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function FlowConnector({ active }: { active: boolean }) {
  return (
    <div className="relative my-3 h-3 w-full md:absolute md:left-full md:top-12 md:my-0 md:h-px md:w-6 lg:w-12">
      <div className="absolute inset-0 md:top-0" style={{ background: active ? 'var(--ff-primary)' : 'var(--ff-line-strong)', height: 2, opacity: active ? 0.6 : 0.4, transition: 'background 0.2s ease' }} />
      {[0, 0.5].map((delay) => (
        <motion.span
          key={delay}
          className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
          style={{ background: 'var(--ff-primary)' }}
          animate={{ left: ['0%', '96%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay, ease: 'linear' }}
        />
      ))}
    </div>
  )
}
