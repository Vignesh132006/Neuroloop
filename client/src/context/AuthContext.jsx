import { createContext, useContext, useState, useEffect } from "react"

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const setCookie = (name, value, days = 1) => {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || getCookie("token")
    const storedUser  = localStorage.getItem("user")
    if (storedToken && storedUser && storedToken !== 'undefined' && storedUser !== 'undefined') {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (e) {
        // Corrupted localStorage — clear it
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        deleteCookie("token")
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
    // Only persist valid values — store in localStorage and temporary cookies
    if (t && t !== 'undefined') {
      localStorage.setItem("token", t)
      setCookie("token", t, 1)
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
    deleteCookie("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token || !!localStorage.getItem("token") || !!getCookie("token") }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
