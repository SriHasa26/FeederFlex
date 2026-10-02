import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RenewablePoint } from '../types/api'

function tickFormatter(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })
}

export function RenewableChart({ points }: { points: RenewablePoint[] }) {
  const data = points.map((p) => ({ timestamp: p.timestamp, 'PV availability (normalized)': p.pv_availability_normalized }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#DEDACB" strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={tickFormatter} stroke="#8B9A8E" fontSize={11} minTickGap={40} />
        <YAxis stroke="#8B9A8E" fontSize={11} domain={[0, 1]} width={40} />
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #DEDACB', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(30,41,35,0.12)' }}
          labelFormatter={(ts: any) => new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        />
        <Line type="monotone" dataKey="PV availability (normalized)" stroke="#D89B45" strokeWidth={1.75} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
