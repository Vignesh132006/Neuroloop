import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { FiUser, FiSettings, FiLock, FiCheck } from "react-icons/fi"

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
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put("/auth/profile", {
        githubUsername,
        emailNotifications,
      })
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
      setPasswordError("All password fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    try {
      await api.put("/auth/profile", {
        currentPassword,
        newPassword,
      })
      setPasswordSuccess("Password updated!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password")
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account information, notification preferences, and security settings</p>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Loading settings...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "600px" }}>
            
            {/* SECTION 1 — Account Info */}
            <div className="card">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                <FiUser size={18} style={{ color: "var(--accent-blue)" }} />
                Account Info
              </h2>
              {user && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  <div className="flex-between" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                    <span>Name</span>
                    <strong style={{ color: "var(--text-primary)" }}>{user.name}</strong>
                  </div>
                  <div className="flex-between" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                    <span>Email</span>
                    <strong style={{ color: "var(--text-primary)" }}>{user.email}</strong>
                  </div>
                  <div className="flex-between" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                    <span>Member Since</span>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </strong>
                  </div>
                  <div className="flex-between">
                    <span>Current Streak</span>
                    <strong style={{ color: "var(--accent-orange)" }}>{user.streak} day{user.streak !== 1 ? "s" : ""} 🔥</strong>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2 — Profile Settings */}
            <div className="card">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                <FiSettings size={18} style={{ color: "var(--accent-purple)" }} />
                Profile Settings
              </h2>
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>GitHub Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your GitHub username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Used to fetch public commit data for your heatmap.</p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.5rem 0" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-primary)" }}>Email Notifications</label>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Receive daily email reminders for due revisions</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "var(--accent-blue)",
                      cursor: "pointer"
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem 1.5rem" }}>
                    Save Settings
                  </button>
                  {profileSuccess && (
                    <span style={{ color: "var(--accent-green)", fontSize: "0.9rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <FiCheck /> {profileSuccess}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* SECTION 3 — Change Password */}
            <div className="card">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                <FiLock size={18} style={{ color: "var(--accent-pink)" }} />
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {passwordError && (
                  <p style={{ color: "var(--accent-pink)", fontSize: "0.85rem", fontWeight: "500" }}>{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p style={{ color: "var(--accent-green)", fontSize: "0.85rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <FiCheck /> {passwordSuccess}
                  </p>
                )}

                <div>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem 1.5rem" }}>
                    Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
