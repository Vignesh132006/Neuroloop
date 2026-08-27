import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { useTheme } from "../context/ThemeContext"
import { FiSettings, FiUser, FiZap, FiSliders, FiLock, FiCheck, FiSun, FiMoon } from "react-icons/fi"
import Loader from "../components/Loader"

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [githubUsername, setGithubUsername] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showSupportButton, setShowSupportButton] = useState(true)

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me")
      setUser(res.data)
      setGithubUsername(res.data.githubUsername || "")
      setEmailNotifications(res.data.emailNotifications !== false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    const stored = localStorage.getItem("showSupportPanel")
    setShowSupportButton(stored !== "false")
  }, [])

  const handleToggleSupport = (checked) => {
    setShowSupportButton(checked)
    localStorage.setItem("showSupportPanel", checked ? "true" : "false")
    window.dispatchEvent(new Event("support-setting-changed"))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put("/auth/profile", { githubUsername, emailNotifications })
      setUser(res.data.user)
      setProfileSuccess("Settings saved!")
      setTimeout(() => setProfileSuccess(""), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required"); return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match"); return
    }
    try {
      await api.put("/auth/profile", { currentPassword, newPassword })
      setPasswordSuccess("Password updated!")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password")
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-wrap fade-in">
        <div className="page-header">
          <div className="page-eyebrow" style={{ color: "#E91E8C", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>User Management</div>
          <h1 className="page-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#1A1A2E", display: 'flex', alignItems: 'center', gap: '10px', margin: "4px 0" }}><FiSettings style={{ color: "#E91E8C" }} /> Settings</h1>
          <p className="page-subtitle" style={{ color: "#4A4A6A", fontSize: "14px" }}>Manage your account information, notification preferences, and security settings</p>
        </div>

        {loading ? (
          <Loader text="Loading settings..." />
        ) : (
          <div className="settings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>

            {/* Account Info */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", fontWeight: 700, color: "#1A1A2E", marginBottom: "1.25rem" }}>
                <FiUser style={{ color: '#E91E8C' }} /> Account Info
              </h2>
              {user && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    { label: 'Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F9C0D8" }}>
                      <span style={{ color: "#8888AA", fontSize: "0.88rem", fontWeight: 600 }}>{item.label}</span>
                      <strong style={{ color: "#1A1A2E", fontSize: "0.88rem", fontWeight: 600 }}>{item.value}</strong>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                    <span style={{ color: "#8888AA", fontSize: "0.88rem", fontWeight: 600 }}>Current Streak</span>
                    <strong style={{ color: '#E91E8C', fontSize: "0.88rem", display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      {user.streak} day{user.streak !== 1 ? "s" : ""} <FiZap fill="#FF6B9D" />
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Settings */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", fontWeight: 700, color: "#1A1A2E", marginBottom: "1.25rem" }}>
                <FiSliders style={{ color: '#E91E8C' }} /> Profile Settings
              </h2>
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1A1A2E", marginBottom: "6px" }}>GitHub Username</label>
                  <input
                    type="text"
                    placeholder="Enter your GitHub username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #F9C0D8", borderRadius: "12px", background: "#FFFFFF", color: "#1A1A2E", fontSize: "0.9rem", outline: "none" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "#8888AA", marginTop: "0.25rem", fontWeight: 500 }}>
                    Used to fetch public commit data for your heatmap.
                  </p>
                </div>
                <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.5rem 0", paddingBottom: "0.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#1A1A2E" }}>Email Notifications</label>
                    <span style={{ fontSize: "0.75rem", color: "#8888AA" }}>Receive daily email reminders for due revisions</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox" checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.5rem 0", paddingBottom: "0.5rem", borderTop: "1px solid #F9C0D8", paddingTop: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#1A1A2E" }}>Floating Support Panel</label>
                    <span style={{ fontSize: "0.75rem", color: "#8888AA" }}>Show customer support slide-out panel on left edge</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox" checked={showSupportButton}
                      onChange={(e) => handleToggleSupport(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "4px" }}>
                  <button type="submit" style={{ padding: "10px 24px", borderRadius: "50px", background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(233, 30, 140, 0.25)" }}>Save Settings</button>
                  {profileSuccess && (
                    <span style={{ color: "#10B981", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <FiCheck /> {profileSuccess}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Appearance & Theme */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", fontWeight: 700, color: "#1A1A2E", marginBottom: "1.25rem" }}>
                {theme === 'dark' ? <FiMoon style={{ color: '#E91E8C' }} /> : <FiSun style={{ color: '#E91E8C' }} />} Appearance Theme
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#4A4A6A', marginBottom: '1rem' }}>
                Select your preferred color theme across all NeuroLoop tools and pages.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: theme === 'dark' ? '#FCE4F0' : '#FFFFFF',
                    border: theme === 'dark' ? '2px solid #E91E8C' : '1.5px solid #F9C0D8',
                    color: '#1A1A2E',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiMoon size={22} color="#E91E8C" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dark Theme</span>
                  <span style={{ fontSize: '0.75rem', color: '#8888AA' }}>Sleek dark theme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: theme === 'light' ? '#FCE4F0' : '#FFFFFF',
                    border: theme === 'light' ? '2px solid #E91E8C' : '1.5px solid #F9C0D8',
                    color: '#1A1A2E',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiSun size={22} color="#E91E8C" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Light Theme</span>
                  <span style={{ fontSize: '0.75rem', color: '#8888AA' }}>Soft pink portfolio</span>
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", fontWeight: 700, color: "#1A1A2E", marginBottom: "1.25rem" }}>
                <FiLock style={{ color: '#E91E8C' }} /> Change Password
              </h2>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
                  { label: "New Password", value: newPassword, setter: setNewPassword },
                  { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1A1A2E", marginBottom: "6px" }}>{field.label}</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #F9C0D8", borderRadius: "12px", background: "#FFFFFF", color: "#1A1A2E", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                ))}

                {passwordError && (
                  <p style={{ color: "#EF4444", fontSize: "0.85rem", fontWeight: 600 }}>{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p style={{ color: "#10B981", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <FiCheck /> {passwordSuccess}
                  </p>
                )}

                <div style={{ marginTop: "4px" }}>
                  <button type="submit" style={{ padding: "10px 24px", borderRadius: "50px", background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(233, 30, 140, 0.25)" }}>Update Password</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
