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
    console.log('[AuthContext] login called. Original params:', { tokenVal: typeof tokenVal, userData: typeof userData });
    let t = tokenVal
    let u = userData
    if (typeof tokenVal === 'object' && typeof userData === 'string') {
      t = userData
      u = tokenVal
    }
    console.log('[AuthContext] login final values:', { token: t ? 'Present' : 'Missing', user: u ? 'Present' : 'Missing' });
    localStorage.setItem("token", t)
    localStorage.setItem("user", JSON.stringify(u))
    setToken(t)
    setUser(u)
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
