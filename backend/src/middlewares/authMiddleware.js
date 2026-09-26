const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const Session = require('../models/Session')
const { createSession, hashSession, sessionExpiry } = require('../utils/session')
const { AUTH_COOKIE_NAME, getCookieOptions, verifyToken } = require('../utils/jwt')

// Cookie authentication is shared by all protected customer and admin routes.
const protect = asyncHandler(async (req, res, next) => {
  const legacyToken = req.cookies?.token
  const sessionToken = req.cookies?.[AUTH_COOKIE_NAME]
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null
  const candidates = [...new Set([sessionToken, legacyToken, bearerToken].filter(Boolean))]

  if (candidates.length === 0) {
    throw new AppError('Authentication required. Please login.', 401)
  }

  let user = null
  if (sessionToken?.startsWith('s_')) {
    const session = await Session.findOneAndUpdate(
      { tokenHash: hashSession(sessionToken), expiresAt: { $gt: new Date() } },
      { $set: { expiresAt: sessionExpiry() } }, { new: true },
    )
    if (session) user = await User.findById(session.user)
    if (user) res.cookie(AUTH_COOKIE_NAME, sessionToken, getCookieOptions())
  } else {
    // Migrate a valid older login into a revocable persistent browser session.
    for (const candidate of candidates) {
      let decoded
      try { decoded = verifyToken(candidate) } catch { continue }
      user = await User.findById(decoded.id)
      if (user) break
    }
    if (user && !user.isBlocked) {
      await createSession(user._id, res)
      res.clearCookie('token', getCookieOptions())
    }
  }
  if (!user) {
    res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions())
    throw new AppError('Your session has expired. Please login again.', 401)
  }
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Please contact support.', 403)
  }

  req.user = user
  next()
})

const admin = (req, res, next) => {
  if (!req.user || String(req.user.role || '').trim().toLowerCase() !== 'admin') {
    return next(new AppError('Admin access required.', 403))
  }

  next()
}

module.exports = {
  admin,
  protect,
}
