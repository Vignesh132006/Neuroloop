import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import MotivationBanner from "../components/MotivationBanner"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { FiFileText, FiCheckSquare, FiRefreshCw, FiAward, FiSmile } from "react-icons/fi"

function ActivityHeatmap({ heatmapData }) {
  const today = new Date()
  const days = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }

  const countMap = {}
  if (Array.isArray(heatmapData)) {
    heatmapData.forEach((item) => { countMap[item.date] = item.count })
  }

  const getLevel = (count) => {
    if (!count) return ""
    if (count === 1) return "level-1"
    if (count <= 3) return "level-2"
    if (count <= 5) return "level-3"
    return "level-4"
  }

  return (
    <div>
      <div className="heatmap-grid">
        {days.map((date) => (
          <div
            key={date}
            className={`heatmap-cell ${getLevel(countMap[date])}`}
            title={`${date}: ${countMap[date] || 0} contribution${countMap[date] !== 1 ? 's' : ''}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--t2)' }}>
        <span>Less</span>
        {['', 'level-1', 'level-2', 'level-3', 'level-4'].map((l, i) => (
          <div key={i} className={`heatmap-cell ${l}`} style={{ width: '12px', height: '12px' }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [dueRevisions, setDueRevisions] = useState([])
  const [quizHistory, setQuizHistory] = useState([])
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [notesRes, revRes, quizRes, weeklyRes, heatmapRes] = await Promise.all([
        api.get("/notes"),
        api.get("/revision"),
        api.get("/quiz/history"),
        api.get("/notes/stats/weekly"),
        api.get("/notes/stats/heatmap"),
      ])
      setNotes(notesRes.data)
      setDueRevisions(revRes.data)
      setQuizHistory(quizRes.data)
      setWeeklyStats(weeklyRes.data)
      setHeatmapData(heatmapRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const calcStreak = () => {
    if (!notes.length) return 0
    const dates = [...new Set(notes.map((n) => new Date(n.createdAt).toDateString()))]
    return dates.length
  }

  const avgQuizScore = quizHistory.length
    ? Math.round(quizHistory.reduce((s, q) => s + q.percentage, 0) / quizHistory.length)
    : 0

  const streak = user?.streak || calcStreak()

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="page-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Skeleton loaders */}
            <div className="skeleton" style={{ height: '32px', width: '250px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '14px', width: '40%' }} />
            <div className="stat-grid" style={{ marginTop: '1rem' }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
            </div>
            <div className="skeleton" style={{ height: '160px', marginTop: '0.5rem' }} />
            <div className="grid-2" style={{ marginTop: '0.5rem' }}>
              <div className="skeleton" style={{ height: '200px' }} />
              <div className="skeleton" style={{ height: '200px' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalRevisions = notes.reduce((sum, n) => sum + (n.revisionCount || 0), 0)
  const masteryScore = notes.length
    ? Math.round(notes.reduce((sum, n) => sum + (n.masteryScore || 0), 0) / notes.length)
    : 0

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-wrap">
        {/* Motivation Banner */}
        <MotivationBanner streak={streak} />

        {/* Header */}
        <div className="page-header">
          <div className="page-eyebrow">Your Learning Command Centre</div>
          <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Keep your streak alive today
          </p>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          {[
            {ic:<FiFileText size={18} style={{ color: '#d4af37' }} />,bg:'rgba(212,175,55,0.1)',bar:'linear-gradient(90deg,#d4af37,#f0d060)',
             v:notes.length,l:'Notes Written',s:'Your knowledge base is growing'},
            {ic:<FiCheckSquare size={18} style={{ color: '#10b981' }} />,bg:'rgba(16,185,129,0.1)',bar:'linear-gradient(90deg,#10b981,#34d399)',
             v:quizHistory.length,l:'Quizzes Taken',s:`Avg score: ${avgQuizScore}%`},
            {ic:<FiRefreshCw size={18} style={{ color: '#3b82f6' }} />,bg:'rgba(59,130,246,0.1)',bar:'linear-gradient(90deg,#3b82f6,#60a5fa)',
             v:totalRevisions,l:'Revisions Done',s:'Spaced repetition mastery'},
            {ic:<FiAward size={18} style={{ color: '#d4af37' }} />,bg:'rgba(212,175,55,0.08)',bar:'linear-gradient(90deg,#d4af37,#10b981)',
             v:`${masteryScore}%`,l:'Overall Mastery',
             s:masteryScore>=80?'You are a knowledge champion!':'Keep reviewing to boost this!'},
          ].map((s,i)=>(
            <div key={i} className="stat-card anim-card" style={{'--i': i}}>
              <div className="stat-card-accent" style={{position:'absolute',bottom:0,left:0,right:0,height:'2px',
                           background:s.bar,borderRadius:'0 0 16px 16px','--i':i}}/>
              <div className="stat-icon" style={{background:s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{s.ic}</div>
              <div className="stat-val" style={{'--i': i}}>{s.v}</div>
              <div className="stat-label">{s.l}</div>
              <div className="stat-sub">{s.s}</div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="section" style={{ marginTop: '20px' }}>
          <div className="section-head">
            <div className="section-title">
              <div className="section-title-dot"/>
              Activity Heatmap
            </div>
            <span className="badge badge-neutral">Last 90 Days</span>
          </div>
          <ActivityHeatmap heatmapData={heatmapData} />
        </div>

        {/* Weekly Report */}
        {weeklyStats && (
          <div className="section mb-6">
            <div className="section-head">
              <div className="section-title">
                <div className="section-title-dot"/>
                Weekly Progress Report
              </div>
              <span className="badge badge-em">Last 7 Days</span>
            </div>
            <p style={{ color: 'var(--t2)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              You wrote <strong style={{ color: 'var(--t1)' }}>{weeklyStats.notesCount}</strong> notes, finished{' '}
              <strong style={{ color: 'var(--t1)' }}>{weeklyStats.revisionsCount}</strong> revisions, and took{' '}
              <strong style={{ color: 'var(--t1)' }}>{weeklyStats.quizzesCount}</strong> quizzes with an average of{' '}
              <strong style={{ color: 'var(--t1)' }}>{weeklyStats.averagePercentage}%</strong>.
            </p>

            {/* Bar chart */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', borderBottom: '1px solid var(--bd)', paddingBottom: '0.5rem' }}>
              {weeklyStats.dailyStats.map((day, idx) => {
                const maxVal = Math.max(...weeklyStats.dailyStats.map(d => d.notes + d.quizzes)) || 1
                const notesH = (day.notes / maxVal) * 100
                const quizzesH = (day.quizzes / maxVal) * 100
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', gap: '3px', width: '100%', height: '90px', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: `${notesH}%`, background: 'var(--gold)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease', minHeight: day.notes > 0 ? '4px' : '0' }} title={`Notes: ${day.notes}`} />
                      <div style={{ width: '8px', height: `${quizzesH}%`, background: 'var(--em)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease', minHeight: day.quizzes > 0 ? '4px' : '0' }} title={`Quizzes: ${day.quizzes}`} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--t2)' }}>{day.day}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.72rem', color: 'var(--t2)', justifyContent: 'center', marginTop: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%' }} /> Notes
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--em)', borderRadius: '50%' }} /> Quizzes
              </span>
            </div>
          </div>
        )}

        {/* Due Revisions + Recent Notes */}
        <div className="grid-2">
          {/* Due Revisions */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1.05rem', color: 'var(--t1)' }}>
                <FiRefreshCw style={{ color: 'var(--gold)' }} /> Due for Revision
              </h3>
              <span className="badge badge-gold">{dueRevisions.length} due</span>
            </div>
            {dueRevisions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--em)' }}><FiSmile /></div>
                <h3 className="empty-title">All caught up!</h3>
                <p className="empty-sub">No revisions due today. Keep learning!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {dueRevisions.slice(0, 5).map((n) => (
                  <div key={n._id} style={{
                    padding: '12px 14px',
                    background: 'var(--s2)',
                    borderRadius: '10px',
                    border: '1px solid var(--bd)',
                    borderLeft: '3px solid var(--gold)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--t1)' }}>{n.topic}</span>
                      <span className="badge badge-gold">Rev #{n.revisionCount + 1}</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', marginTop: '8px' }}>
                      <div style={{ height: '100%', background: 'var(--gold)', width: `${n.masteryScore}%`, transition: 'width 0.4s' }} />
                    </div>
                    <p style={{ color: 'var(--t2)', fontSize: '0.72rem', marginTop: '4px' }}>
                      Mastery: {n.masteryScore}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1.05rem', color: 'var(--t1)' }}>
                <FiFileText style={{ color: 'var(--em)' }} /> Recent Notes
              </h3>
              <span className="badge badge-em">{notes.length} total</span>
            </div>
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiFileText /></div>
                <h3 className="empty-title">Your learning journey starts here!</h3>
                <p className="empty-sub">Write your first journal entry to begin</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {notes.slice(0, 5).map((n) => (
                  <div key={n._id} style={{
                    padding: '12px 14px',
                    background: 'var(--s2)',
                    borderRadius: '10px',
                    border: '1px solid var(--bd)',
                    borderLeft: '3px solid var(--em)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--t1)' }}>{n.topic}</span>
                      <span className={`badge ${n.difficulty === 'easy' ? 'badge-em' : n.difficulty === 'hard' ? 'badge-red' : 'badge-gold'}`}>
                        {n.difficulty}
                      </span>
                    </div>
                    <p style={{ color: 'var(--t2)', fontSize: '0.72rem', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quiz History */}
        {quizHistory.length > 0 && (
          <div className="card" style={{ marginTop: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1.05rem', marginBottom: '16px', color: 'var(--t1)' }}>
              <FiCheckSquare style={{ color: 'var(--gold)' }} /> Recent Quiz Performance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {quizHistory.slice(0, 5).map((q) => (
                <div key={q._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem', color: 'var(--t1)' }}>{q.topic}</span>
                  <div style={{ flex: 2, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${q.percentage}%`,
                        background: q.percentage >= 80 ? 'var(--em)' : q.percentage >= 60 ? 'var(--gold)' : 'var(--red)',
                        transition: 'width 0.4s'
                      }}
                    />
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.85rem', minWidth: '45px', textAlign: 'right',
                    color: q.percentage >= 80 ? 'var(--em)' : q.percentage >= 60 ? 'var(--gold)' : 'var(--red)',
                  }}>
                    {q.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}