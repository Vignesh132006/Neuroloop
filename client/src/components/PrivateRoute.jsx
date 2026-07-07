import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Loader from "./Loader"
import SupportPanel from "./SupportPanel"

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loader text="Loading NeuroLoop..." />
  }

  return isAuthenticated ? (
    <>
      {children}
      <SupportPanel />
    </>
  ) : <Navigate to="/login" replace />
}
