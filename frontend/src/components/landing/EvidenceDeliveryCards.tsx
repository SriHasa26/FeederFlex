import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Eye, FileSearch, PlayCircle, ShieldCheck } from 'lucide-react'
import type { LimitationItem } from '../../types/api'

const CARDS = [
  { title: 'Simulation', icon: PlayCircle, body: 'End-to-end feeder flexibility simulation — from household appliances to feeder-level dispatch.' },
  { title: 'Evidence', icon: FileSearch, body: 'Built from real and derived open datasets, with every figure traced to its source.' },
  { title: 'Explainability', icon: Eye, body: 'Every flexibility decision the controller makes can be inspected, hour by hour.' },
  { title: 'Transparency', icon: ShieldCheck, body: 'Limitations and assumptions are explicitly reported, not buried in an appendix.' },
]

/** Replaces a plain "what this is not" bullet list with a positive framing of what the system
 *  delivers, plus a drawer holding the same factual limitations (fetched from /api/limitations,
 *  never re-typed by hand) so the transparency content is preserved without dominating the
 *  visual story. */
export function EvidenceDeliveryCards({ items }: { items: LimitationItem[] | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="ff-card flex flex-col gap-3 p-5 transition-transform hover:-translate-y-1.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-primary)' }}>
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <h3 className="ff-display text-[15px] font-bold text-[var(--ff-ink)]">{c.title}</h3>
              <p className="text-[12.5px] leading-relaxed text-[var(--ff-ink-dim)]">{c.body}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <p className="ff-display text-[16px] font-bold text-[var(--ff-ink)]">Know exactly what is modeled.</p>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ff-mono mt-3 inline-flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-[11.5px] font-semibold"
          style={{ borderColor: 'var(--ff-line-strong)', color: 'var(--ff-ink-dim)' }}
        >
          Scope & limitations
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 w-full max-w-2xl overflow-hidden"
            >
              {!items ? (
                <p className="text-center text-[12.5px] text-[var(--ff-ink-faint)]">Loading limitations…</p>
              ) : (
                <ul className="ff-surface flex flex-col divide-y p-1" style={{ borderColor: 'var(--ff-line)' }}>
                  {items.map((it, i) => (
                    <li key={i} className="flex items-start gap-3 px-3.5 py-2.5" style={{ borderColor: 'var(--ff-line)' }}>
                      <span className="ff-mono mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--ff-ink-faint)]" style={{ borderColor: 'var(--ff-line-strong)' }}>
                        {it.category}
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-[var(--ff-ink-dim)]">{it.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
