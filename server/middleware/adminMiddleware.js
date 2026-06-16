const jwt = require('jsonwebtoken')

const adminMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    if (!authHeader) return res.status(401).json({ error: 'No token provided' })

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7) : authHeader

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    req.admin = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired admin token' })
  }
}

module.exports = adminMiddleware
