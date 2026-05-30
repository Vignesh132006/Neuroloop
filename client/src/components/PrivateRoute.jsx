import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading NeuroLoop...</p>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}
