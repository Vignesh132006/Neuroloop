const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// Full admin only
const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token   = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7) : authHeader
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Full admin access required'
      })
    }

    // Verify in database
    const user = await User.findById(decoded.id).select('role')
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access revoked' })
    }

    req.admin = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' })
    }
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Admin OR SubAdmin access
const staffMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token   = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7) : authHeader
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!['admin', 'subadmin'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Staff access required' })
    }

    // Verify in database
    const user = await User.findById(decoded.id).select('role')
    if (!user || !['admin', 'subadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Staff access revoked' })
    }

    req.admin = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { adminMiddleware, staffMiddleware }
