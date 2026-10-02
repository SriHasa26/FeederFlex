import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface ScenarioState {
  capacity_scenario: string
  eligibility_scenario: string
  participation_pct: number
}

interface ScenarioContextValue {
  scenario: ScenarioState
  setScenario: (s: Partial<ScenarioState>) => void
  isEvidenceBacked: boolean
}

const DEFAULT_SCENARIO: ScenarioState = {
  capacity_scenario: 'assumed_stress_test',
  eligibility_scenario: 'counterfactual_broad',
  participation_pct: 90,
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null)

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenarioState] = useState<ScenarioState>(DEFAULT_SCENARIO)

  const setScenario = (patch: Partial<ScenarioState>) =>
    setScenarioState((prev) => ({ ...prev, ...patch }))

  const value = useMemo<ScenarioContextValue>(
    () => ({ scenario, setScenario, isEvidenceBacked: scenario.eligibility_scenario === 'baseline' }),
    [scenario],
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenario(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario must be used within a ScenarioProvider')
  return ctx
}
