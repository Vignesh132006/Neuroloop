const jwt = require("jsonwebtoken")

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

const authMiddleware = (req, res, next) => {
  try {
    let token = null
    const authHeader = req.header("Authorization")

    if (authHeader) {
      token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    } else if (req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie)
      token = cookies.token
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

module.exports = authMiddleware