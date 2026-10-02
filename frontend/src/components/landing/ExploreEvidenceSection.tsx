import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Database, GitBranch, ListChecks, ShieldAlert } from 'lucide-react'

const CARDS = [
  { title: 'Data', body: 'Explore source datasets and their evidence class.', to: '/evidence', icon: Database },
  { title: 'Model', body: 'See the forecasting and flexibility-dispatch logic.', to: '/methodology', icon: GitBranch },
  { title: 'Results', body: 'Inspect baseline vs. counterfactual results.', to: '/results', icon: ListChecks },
  { title: 'Limitations', body: "Understand what is and isn't established.", to: '/limitations', icon: ShieldAlert },
]

/** Closing "trust" section: replaces a generic roadmap/future-scope block with direct links into
 *  the evidence, methodology, results, and limitations pages -- the actual mechanism by which a
 *  reader verifies the project's claims. */
export function ExploreEvidenceSection() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <div>
        <span className="ff-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--ff-secondary)' }}>Explore the evidence</span>
        <h2 className="ff-display mt-2 text-[26px] font-bold leading-tight text-[var(--ff-ink)] md:text-[30px]">
          See how FeederFlex reaches its conclusions.
        </h2>
        <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--ff-ink-dim)]">
          Explore the data, assumptions, simulation results, and limitations behind the model —
          nothing here is asserted without a page you can check it against.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={c.to} className="ff-card group flex flex-col gap-2.5 p-5 transition-transform hover:-translate-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-primary)' }}>
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                  <ArrowUpRight size={15} strokeWidth={2} className="text-[var(--ff-ink-faint)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--ff-primary)]" />
                </div>
                <h3 className="ff-display text-[14.5px] font-bold text-[var(--ff-ink)]">{c.title}</h3>
                <p className="text-[12.5px] leading-relaxed text-[var(--ff-ink-dim)]">{c.body}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
