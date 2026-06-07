import { useEffect, useState } from "react"
import api from "../api/axios"
import { FiCheckCircle, FiBookOpen } from "react-icons/fi"

function RevisionPanel() {
  const [revisions, setRevisions] = useState([])

  useEffect(() => {
    fetchRevisions()
  }, [])

  const fetchRevisions = async () => {
    try {
      const response = await api.get("/revision")
      setRevisions(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const markRevised = async (id) => {
    try {
      await api.put(`/revision/${id}`)
      fetchRevisions()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="card" style={{ marginTop: "2rem" }}>
      <h2 style={{ fontWeight: 600, fontSize: "1.15rem", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
        Topics To Revise Today
      </h2>

      {revisions.length === 0 ? (
        <div className="empty-state" style={{ padding: "2rem" }}>
          <div className="empty-state-icon"><FiCheckCircle size={32} /></div>
          <p>No topics need revision today!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {revisions.map((journal) => (
            <div
              key={journal._id}
              className="revision-card"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                  {journal.topic}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Revisions: {journal.revisionCount}
                </p>
              </div>

              <button
                onClick={() => markRevised(journal._id)}
                className="btn btn-success"
              >
                Mark Revised
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RevisionPanel