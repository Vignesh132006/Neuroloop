import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import PrivateRoute from "./components/PrivateRoute"
import "./index.css"

import Signup    from "./pages/Signup"
import Login     from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Journal   from "./pages/Journal"
import Notes     from "./pages/Notes"
import Quiz      from "./pages/Quiz"
import Revision  from "./pages/Revision"
import Chat      from "./pages/Chat"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/journal"   element={<PrivateRoute><Journal /></PrivateRoute>} />
          <Route path="/notes"     element={<PrivateRoute><Notes /></PrivateRoute>} />
          <Route path="/quiz"      element={<PrivateRoute><Quiz /></PrivateRoute>} />
          <Route path="/revision"  element={<PrivateRoute><Revision /></PrivateRoute>} />
          <Route path="/chat"      element={<PrivateRoute><Chat /></PrivateRoute>} />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}