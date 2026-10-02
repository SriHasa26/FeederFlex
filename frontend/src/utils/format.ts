export function formatW(w: number | null | undefined, digits = 0): string {
  if (w === null || w === undefined || Number.isNaN(w)) return '—'
  if (Math.abs(w) >= 1000) return `${(w / 1000).toFixed(digits === 0 ? 2 : digits)} kW`
  return `${w.toFixed(digits)} W`
}

export function formatWh(wh: number | null | undefined, digits = 0): string {
  if (wh === null || wh === undefined || Number.isNaN(wh)) return '—'
  if (Math.abs(wh) >= 1_000_000) return `${(wh / 1_000_000).toFixed(2)} MWh`
  if (Math.abs(wh) >= 1000) return `${(wh / 1000).toFixed(digits === 0 ? 1 : digits)} kWh`
  return `${wh.toFixed(digits)} Wh`
}

export function formatPct(pct: number | null | undefined, digits = 1): string {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return 'N/A'
  return `${pct.toFixed(digits)}%`
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export function scenarioLabel(eligibility: string): string {
  const map: Record<string, string> = {
    baseline: 'Evidence-Backed Baseline',
    counterfactual_ac_enabled: 'Counterfactual: AC-Enabled',
    counterfactual_broad: 'Counterfactual: Broad',
  }
  return map[eligibility] ?? eligibility
}

export function capacityLabel(capacity: string): string {
  const map: Record<string, string> = {
    assumed_nameplate_capacity: 'Assumed Nameplate Capacity',
    assumed_stress_test: 'Assumed Stress-Test Capacity',
  }
  return map[capacity] ?? capacity
}
