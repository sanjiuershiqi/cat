import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import Overview from '@/pages/Overview'
import PullRequests from '@/pages/PullRequests'
import PullRequestDetail from '@/pages/PullRequestDetail'
import History from '@/pages/History'
import Gallery from '@/pages/Gallery'
import Stats from '@/pages/Stats'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/prs" element={<PullRequests />} />
          <Route path="/prs/:number" element={<PullRequestDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}
