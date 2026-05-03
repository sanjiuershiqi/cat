import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import Overview from '@/pages/Overview'
import PullRequestsLayout from '@/pages/PullRequestsLayout'
import PullRequestsEmpty from '@/pages/PullRequestsEmpty'
import PullRequestDetail from '@/pages/PullRequestDetail'
import HistoryLayout from '@/pages/HistoryLayout'
import HistoryEmpty from '@/pages/HistoryEmpty'
import CommitDetail from '@/pages/CommitDetail'
import CommitRedirect from '@/pages/CommitRedirect'
import Gallery from '@/pages/Gallery'
import Stats from '@/pages/Stats'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/prs" element={<PullRequestsLayout />}>
            <Route index element={<PullRequestsEmpty />} />
            <Route path=":number" element={<PullRequestDetail />} />
          </Route>
          <Route path="/history" element={<HistoryLayout />}>
            <Route index element={<HistoryEmpty />} />
            <Route path=":sha" element={<CommitDetail />} />
          </Route>
          <Route path="/commit/:sha" element={<CommitRedirect />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}
