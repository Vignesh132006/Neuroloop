const jwt = require('jsonwebtoken')

const parseCookies = (cookieHeader) => {
  const list = {}
  if (!cookieHeader) return list
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=')
    name = name?.trim()
    if (!name) return
    const value = rest.join('=').trim()
    list[name] = decodeURIComponent(value)
  })
  return list
}

const adminMiddleware = (req, res, next) => {
  try {
    let token = null
    const authHeader = req.header('Authorization')

    if (authHeader) {
      token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken
    } else if (req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie)
      token = cookies.adminToken
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

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
