import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { ScenarioState } from '../hooks/useScenario'

export function TransformerContributionChart({ scenario }: { scenario: ScenarioState }) {
  const [data, setData] = useState<{ transformer_id: string; curtailed_energy_wh: number }[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(null)
    api.transformers()
      .then((list) =>
        Promise.all(list.map((t) => api.transformer(t.transformer_id, scenario))),
      )
      .then((details) => {
        if (cancelled) return
        setData(details.map((d) => ({ transformer_id: d.transformer_id, curtailed_energy_wh: Math.round(d.curtailed_energy_wh) })))
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
    return () => {
      cancelled = true
    }
  }, [scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct])

  if (error) return <p className="py-6 text-sm" style={{ color: 'var(--ff-critical)' }}>Could not load transformer contribution: {error}</p>
  if (!data) return <p className="py-6 text-sm text-[var(--ff-ink-dim)]">Loading transformer contribution…</p>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#DEDACB" strokeDasharray="3 3" />
        <XAxis dataKey="transformer_id" stroke="#8B9A8E" fontSize={10} angle={-30} textAnchor="end" height={60} />
        <YAxis stroke="#8B9A8E" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={44} />
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #DEDACB', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(30,41,35,0.12)' }}
          formatter={(v: any) => [`${Number(v).toLocaleString()} Wh`, 'Curtailed energy']}
        />
        <Bar dataKey="curtailed_energy_wh" fill="#1F5C45" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
