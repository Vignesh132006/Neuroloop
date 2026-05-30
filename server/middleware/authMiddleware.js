const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" })
    }

    // Support both "Bearer <token>" and raw token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader

    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

module.exports = authMiddleware