import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FeederTimeseriesPoint } from '../types/api'

function tickFormatter(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })
}

export function LoadChart({ points }: { points: FeederTimeseriesPoint[] }) {
  const data = points.map((p) => ({
    timestamp: p.timestamp,
    'Baseline (modeled)': Math.round(p.net_demand_w),
    'Controlled': Math.round(p.controlled_load_w),
  }))

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#DEDACB" strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={tickFormatter} stroke="#8B9A8E" fontSize={11} minTickGap={40} />
        <YAxis stroke="#8B9A8E" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(1)}kW`} width={56} />
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #DEDACB', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(30,41,35,0.12)' }}
          labelFormatter={(ts: any) => new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          formatter={(v: any) => [`${Number(v).toLocaleString()} W`, '']}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Baseline (modeled)" stroke="#6E8F78" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="Controlled" stroke="#1F5C45" strokeWidth={2.25} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
