import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import SendEmail from './pages/SendEmail'
import EmailLogs from './pages/EmailLogs'
import Settings from './pages/Settings'
import Guide    from './pages/Guide'
import AccessControl from './pages/AccessControl'
import AuditLogs from './pages/AuditLogs'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard />} />
            <Route path="clients"        element={<Clients />} />
            <Route path="send-email"     element={<SendEmail />} />
            <Route path="email-logs"     element={<EmailLogs />} />
            <Route path="access-control" element={<AccessControl />} />
            <Route path="audit-logs"     element={<AuditLogs />} />
            <Route path="settings"       element={<Settings />} />
            <Route path="guide"          element={<Guide />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
