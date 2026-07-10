import axios from "axios"

const backendBase = import.meta.env.VITE_API_URL || "http://localhost:5000"
const api = axios.create({
  baseURL: `${backendBase}/api`,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isReportUrl = error.config?.url?.includes('/auth/report-error')
    const status = error.response?.status

    // Only report unexpected or server-side errors (exclude common client statuses: 400, 401, 403, 404)
    const isExpectedStatus = status && [400, 401, 403, 404].includes(status)

    if (!isReportUrl && !isExpectedStatus) {
      try {
        const storedUser = localStorage.getItem("user")
        let userEmail = "anonymous@example.com"
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            if (parsed && parsed.email) userEmail = parsed.email
          } catch (e) {}
        }
        
        const reportEndpoint = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/report-error`
        await axios.post(reportEndpoint, {
          email: userEmail,
          url: window.location.href,
          errorMessage: `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} | Status: ${status || 'Network Error'} | Message: ${error.response?.data?.message || error.message || 'Unknown'}`
        })
      } catch (reportErr) {
        console.error("Failed to automatically send error report to admin:", reportErr)
      }
    }

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Keep backend alive — ping every 14 minutes
// Prevents Render free tier cold start delay on login
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function keepAlive() {
  fetch(`${BACKEND_URL}/health`, { method: 'GET' })
    .then(() => console.log('[KeepAlive] Server pinged'))
    .catch(() => {}) // silent fail — never crash the app
}

// Start pinging after 5 seconds (let app load first)
setTimeout(() => {
  keepAlive()
  setInterval(keepAlive, 14 * 60 * 1000) // every 14 minutes
}, 5000)
