import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FeederTimeseriesPoint } from '../types/api'

function tickFormatter(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })
}

export function FlexibilityChart({ points }: { points: FeederTimeseriesPoint[] }) {
  const data = points.map((p) => ({
    timestamp: p.timestamp,
    'Available': Math.round(p.available_flexibility_w),
    'Delivered': Math.round(p.delivered_flexibility_w),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="avail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B9A8E" stopOpacity={0.32} />
            <stop offset="95%" stopColor="#8B9A8E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="deliv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1F5C45" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#1F5C45" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#DEDACB" strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={tickFormatter} stroke="#8B9A8E" fontSize={11} minTickGap={40} />
        <YAxis stroke="#8B9A8E" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(1)}kW`} width={56} />
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #DEDACB', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(30,41,35,0.12)' }}
          labelFormatter={(ts: any) => new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="Available" stroke="#6E8F78" fill="url(#avail)" isAnimationActive={false} />
        <Area type="monotone" dataKey="Delivered" stroke="#1F5C45" fill="url(#deliv)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
