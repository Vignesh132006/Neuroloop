import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import PrivateRoute from "./components/PrivateRoute"
import "./index.css"

import Login     from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Journal   from "./pages/Journal"
import Notes     from "./pages/Notes"
import Quiz      from "./pages/Quiz"
import Revision  from "./pages/Revision"
import Chat      from "./pages/Chat"
import Leaderboard from "./pages/Leaderboard"
import StudyPlans from "./pages/StudyPlans"
import Settings   from "./pages/Settings"
import AuthSuccessPage from "./pages/AuthSuccessPage"

import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTickets from './pages/admin/AdminTickets'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/auth/success" element={<AuthSuccessPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/journal"   element={<PrivateRoute><Journal /></PrivateRoute>} />
          <Route path="/notes"     element={<PrivateRoute><Notes /></PrivateRoute>} />
          <Route path="/quiz"      element={<PrivateRoute><Quiz /></PrivateRoute>} />
          <Route path="/revision"  element={<PrivateRoute><Revision /></PrivateRoute>} />
          <Route path="/chat"      element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/study-plans" element={<PrivateRoute><StudyPlans /></PrivateRoute>} />
          <Route path="/settings"    element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/support"     element={<Navigate to="/dashboard" replace />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tickets" element={<AdminTickets />} />
          </Route>

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}