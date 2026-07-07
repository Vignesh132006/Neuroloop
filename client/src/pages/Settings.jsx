import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { FiSettings, FiUser, FiZap, FiSliders, FiLock, FiCheck } from "react-icons/fi"
import Loader from "../components/Loader"

export default function Settings() {
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
          <div className="page-eyebrow">User Management</div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiSettings /> Settings</h1>
          <p className="page-subtitle">Manage your account information, notification preferences, and security settings</p>
        </div>

        {loading ? (
          <Loader text="Loading settings..." />
        ) : (
          <div className="settings-grid">

            {/* Account Info */}
            <div className="card">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
                <FiUser style={{ color: 'var(--gold)' }} /> Account Info
              </h2>
              {user && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    { label: 'Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) },
                  ].map(item => (
                    <div key={item.label} className="detail-row">
                      <span className="detail-label">{item.label}</span>
                      <strong className="detail-value">{item.value}</strong>
                    </div>
                  ))}
                  <div className="detail-row">
                    <span className="detail-label">Current Streak</span>
                    <strong className="detail-value" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {user.streak} day{user.streak !== 1 ? "s" : ""} <FiZap fill="#d4af37" />
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Settings */}
            <div className="card">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
                <FiSliders style={{ color: 'var(--gold)' }} /> Profile Settings
              </h2>
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="form-label">GitHub Username</label>
                  <input
                    type="text" className="form-input"
                    placeholder="Enter your GitHub username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />
                  <p style={{ fontSize: "0.72rem", color: "var(--t2)", marginTop: "0.25rem" }}>
                    Used to fetch public commit data for your heatmap.
                  </p>
                </div>
                <div className="flex-between" style={{ margin: "0.5rem 0", paddingBottom: "0.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "var(--t1)" }}>Email Notifications</label>
                    <span style={{ fontSize: "0.72rem", color: "var(--t2)" }}>Receive daily email reminders for due revisions</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox" checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="flex-between" style={{ margin: "0.5rem 0", paddingBottom: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "var(--t1)" }}>Floating Support Panel</label>
                    <span style={{ fontSize: "0.72rem", color: "var(--t2)" }}>Show floating customer support slide-out panel on the left edge</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox" checked={showSupportButton}
                      onChange={(e) => handleToggleSupport(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <button type="submit" className="btn btn-gold">Save Settings</button>
                  {profileSuccess && (
                    <span style={{ color: "var(--em)", fontSize: "0.85rem", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <FiCheck /> {profileSuccess}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="card">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
                <FiLock style={{ color: 'var(--gold)' }} /> Change Password
              </h2>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
                  { label: "New Password", value: newPassword, setter: setNewPassword },
                  { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
                ].map(field => (
                  <div key={field.label}>
                    <label className="form-label">{field.label}</label>
                    <input
                      type="password" className="form-input"
                      placeholder="••••••••"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                    />
                  </div>
                ))}

                {passwordError && (
                  <p style={{ color: "var(--red)", fontSize: "0.85rem", fontWeight: 500 }}>{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p style={{ color: "var(--em)", fontSize: "0.85rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                    <FiCheck /> {passwordSuccess}
                  </p>
                )}

                <div>
                  <button type="submit" className="btn btn-gold">Update Password</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
