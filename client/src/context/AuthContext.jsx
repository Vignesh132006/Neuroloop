import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (tokenVal, userData) => {
    localStorage.setItem("token", tokenVal)
    localStorage.setItem("user", JSON.stringify(userData))
    setToken(tokenVal)
    setUser(userData)

    // Prefetch dashboard data in background immediately after login
    // This way data is ready when dashboard mounts
    setTimeout(() => {
      const headers = { Authorization: `Bearer ${tokenVal}` }
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      fetch(`${base}/api/auth/me`, { headers }).catch(() => {})
      fetch(`${base}/api/notes/stats/weekly`, { headers }).catch(() => {})
    }, 100)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
