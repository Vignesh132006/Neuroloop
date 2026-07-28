const express = require('express')
const router = express.Router()
const { adminMiddleware, staffMiddleware } = require('../middleware/adminMiddleware')
const User = require('../models/User')
const Note = require('../models/Note')
const QuizResult = require('../models/QuizResult')
const RevisionLog = require('../models/RevisionLog')
const StudyPlan = require('../models/StudyPlan')
const SupportTicket = require('../models/SupportTicket')

// ── DASHBOARD STATS ──────────────────────────────────
router.get('/stats', staffMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalNotes,
      totalQuizzes,
      totalRevisions,
      totalStudyPlans,
      totalSupportTickets,
      openTickets,
      todayUsers,
      activeUsers
    ] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      QuizResult.countDocuments(),
      RevisionLog.countDocuments(),
      StudyPlan.countDocuments(),
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: 'open' }),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      }),
      User.countDocuments({
        lastActiveDate: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    ])

    // Quiz average score
    const quizAgg = await QuizResult.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
    ])
    const avgQuizScore = quizAgg[0]?.avgScore?.toFixed(1) || 0

    // New users last 7 days
    const newUsersWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })

    res.json({
      totalUsers,
      totalNotes,
      totalQuizzes,
      totalRevisions,
      totalStudyPlans,
      totalSupportTickets,
      openTickets,
      todayUsers,
      activeUsers,
      avgQuizScore,
      newUsersWeek
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── ALL USERS ────────────────────────────────────────
router.get('/users', staffMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const search = req.query.search || ''

    const query = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {}

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -resetOtp -resetOtpExpiry')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query)
    ])

    // Get note and quiz count per user
    const userIds = users.map(u => u._id)
    const [noteCounts, quizCounts] = await Promise.all([
      Note.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', count: { $sum: 1 } } }
      ]),
      QuizResult.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', count: { $sum: 1 } } }
      ])
    ])

    const noteMap = Object.fromEntries(noteCounts.map(n => [n._id.toString(), n.count]))
    const quizMap = Object.fromEntries(quizCounts.map(q => [q._id.toString(), q.count]))

    const enriched = users.map(u => ({
      ...u.toObject(),
      noteCount: noteMap[u._id.toString()] || 0,
      quizCount: quizMap[u._id.toString()] || 0
    }))

    res.json({ users: enriched, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── SINGLE USER DETAIL ───────────────────────────────
router.get('/users/:id', staffMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetOtp -resetOtpExpiry')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const [notes, quizzes, revisions, studyPlans] = await Promise.all([
      Note.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
      QuizResult.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
      RevisionLog.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
      StudyPlan.find({ user: user._id }).sort({ createdAt: -1 }).limit(3)
    ])

    res.json({ user, notes, quizzes, revisions, studyPlans })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE USER ──────────────────────────────────────
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Delete all user data
    await Promise.all([
      Note.deleteMany({ user: req.params.id }),
      QuizResult.deleteMany({ user: req.params.id }),
      RevisionLog.deleteMany({ user: req.params.id }),
      StudyPlan.deleteMany({ user: req.params.id }),
      SupportTicket.deleteMany({ user: req.params.id }),
      User.findByIdAndDelete(req.params.id)
    ])

    res.json({ message: `User ${user.email} and all their data deleted successfully` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── CHANGE USER ROLE ─────────────────────────────────
router.put('/users/:id/role', adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body

    if (!['user', 'subadmin'].includes(role)) {
      return res.status(400).json({
        error: 'You can only assign user or subadmin roles'
      })
    }

    // Admin cannot demote themselves
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ error: 'Cannot change your own role' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('name email role')

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ message: `Role updated to ${role}`, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── ALL SUPPORT TICKETS ──────────────────────────────
router.get('/tickets', staffMiddleware, async (req, res) => {
  try {
    const status = req.query.status || ''
    const query = status ? { status } : {}

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(tickets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── UPDATE TICKET STATUS ─────────────────────────────
router.put('/tickets/:id', staffMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    )
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' })
    res.json({ message: 'Ticket updated', ticket })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE TICKET ────────────────────────────────────
router.delete('/tickets/:id', adminMiddleware, async (req, res) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id)
    res.json({ message: 'Ticket deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── RECENT ACTIVITY ──────────────────────────────────
router.get('/activity', staffMiddleware, async (req, res) => {
  try {
    const [recentUsers, recentNotes, recentQuizzes, recentTickets] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt streak'),
      Note.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').select('topic createdAt user'),
      QuizResult.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').select('topic score totalQuestions createdAt user'),
      SupportTicket.find({ status: 'open' }).sort({ createdAt: -1 }).limit(5).select('ticketId subject category createdAt userName')
    ])

    res.json({ recentUsers, recentNotes, recentQuizzes, recentTickets })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
