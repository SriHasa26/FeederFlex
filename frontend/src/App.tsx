import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ScenarioProvider } from './hooks/useScenario'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Transformers } from './pages/Transformers'
import { Households } from './pages/Households'
import { Appliances } from './pages/Appliances'
import { ScenarioLab } from './pages/ScenarioLab'
import { Methodology } from './pages/Methodology'
import { Results } from './pages/Results'
import { Evidence } from './pages/Evidence'
import { Limitations } from './pages/Limitations'

export default function App() {
  return (
    <ScenarioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transformers" element={<Transformers />} />
            <Route path="/households" element={<Households />} />
            <Route path="/appliances" element={<Appliances />} />
            <Route path="/scenarios" element={<ScenarioLab />} />
            <Route path="/results" element={<Results />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/limitations" element={<Limitations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ScenarioProvider>
  )
}
