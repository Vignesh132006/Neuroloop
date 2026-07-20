import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser  = localStorage.getItem("user")
    if (storedToken && storedUser && storedToken !== 'undefined' && storedUser !== 'undefined') {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (e) {
        // Corrupted localStorage — clear it
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = (tokenVal, userData) => {
    console.log('[AuthContext] login called. Original params:', { tokenVal: typeof tokenVal, userData: typeof userData });
    let t = tokenVal
    let u = userData
    if (typeof tokenVal === 'object' && typeof userData === 'string') {
      t = userData
      u = tokenVal
    }
    console.log('[AuthContext] login final values:', { token: t ? 'Present' : 'Missing', user: u ? 'Present' : 'Missing' });
    // Only persist valid values — never write undefined/null to localStorage
    if (t && t !== 'undefined') {
      localStorage.setItem("token", t)
      setToken(t)
    }
    if (u && u !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(u))
      setUser(u)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token || !!localStorage.getItem("token") }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
