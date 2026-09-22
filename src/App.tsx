import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { LeadDetailPage } from './pages/LeadDetailPage'
import { LeadsPage } from './pages/LeadsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PipelinePage } from './pages/PipelinePage'
import { PromptGeneratorPage } from './pages/PromptGeneratorPage'
import { RadarPage } from './pages/RadarPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/radar" element={<RadarPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/prompt-generator" element={<PromptGeneratorPage />} />
          <Route path="/lead/:id" element={<LeadDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  )
}
