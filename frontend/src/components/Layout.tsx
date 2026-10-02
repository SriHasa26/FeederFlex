import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../services/api'
import { GridMark } from './GridMark'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/scenarios', label: 'Simulation' },
  { to: '/transformers', label: 'Grid' },
  { to: '/households', label: 'Households' },
  { to: '/appliances', label: 'Appliances' },
  { to: '/results', label: 'Results' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/evidence', label: 'Evidence' },
  { to: '/limitations', label: 'Limitations' },
]

function SystemStatus() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    let cancelled = false
    api.health().then((r) => !cancelled && setOk(r.status === 'ok')).catch(() => !cancelled && setOk(false))
    return () => { cancelled = true }
  }, [])
  return (
    <span className="ff-mono hidden items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-medium lg:flex"
      style={{ borderColor: 'var(--ff-line)', color: 'var(--ff-ink-dim)' }}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${ok ? 'ff-pulse' : ''}`}
        style={{ background: ok === null ? 'var(--ff-ink-faint)' : ok ? 'var(--ff-primary)' : 'var(--ff-critical)' }}
      />
      System {ok === null ? 'Checking' : ok ? 'Operational' : 'Unavailable'}
    </span>
  )
}

export function Layout() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--ff-bg)' }}>
      <header className={`sticky top-0 z-40 transition-colors ${scrolled ? 'ff-nav-blur border-b' : 'border-b border-transparent'}`}
        style={{ borderColor: scrolled ? 'var(--ff-line)' : 'transparent' }}>
        <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-3">
          <NavLink to="/" className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ff-ink)] ff-display">
            <GridMark size={26} />
            FeederFlex
          </NavLink>
          <nav className="flex flex-1 flex-wrap items-center gap-0.5 overflow-x-auto text-[13px]">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                    isActive ? 'text-[var(--ff-primary)]' : 'text-[var(--ff-ink-dim)] hover:text-[var(--ff-ink)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-[13px] h-[2px] rounded-full" style={{ background: 'var(--ff-primary)' }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <SystemStatus />
          <NavLink
            to="/dashboard"
            className="ff-mono rounded-md px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--ff-primary)' }}
          >
            Open Simulation
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-xs text-[var(--ff-ink-faint)]" style={{ borderColor: 'var(--ff-line)' }}>
        FeederFlex is a research simulation. It does not control real appliances, integrate with
        any DISCOM/SCADA system, or represent field-validated results. See{' '}
        <NavLink to="/limitations" style={{ color: 'var(--ff-primary)' }} className="hover:underline">Limitations</NavLink>.
      </footer>
    </div>
  )
}
