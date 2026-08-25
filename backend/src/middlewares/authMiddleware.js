const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { AUTH_COOKIE_NAME, getCookieOptions, signToken, verifyToken } = require('../utils/jwt')

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

  let activeToken = null
  let user = null

  // A stale cookie with the new name must not hide a still-valid legacy
  // BabyCure session. Try each available credential and migrate the first
  // valid one. This also recovers browsers that retained an older cookie.
  for (const candidate of candidates) {
    try {
      const decoded = verifyToken(candidate)
      const candidateUser = await User.findById(decoded.id)
      if (candidateUser) {
        activeToken = candidate
        user = candidateUser
        break
      }
    } catch {
      // Continue to the next available credential.
    }
  }

  // BabyCure uses persistent login: if a cookie is authentic but only its
  // timestamp expired, renew it for the same existing user. Bearer tokens are
  // intentionally excluded from this browser-session renewal path.
  if (!user) {
    const cookieCandidates = [...new Set([sessionToken, legacyToken].filter(Boolean))]
    for (const candidate of cookieCandidates) {
      try {
        const decoded = verifyToken(candidate, { ignoreExpiration: true })
        const candidateUser = await User.findById(decoded.id)
        if (candidateUser) {
          user = candidateUser
          activeToken = signToken(candidateUser._id)
          break
        }
      } catch {
        // Invalid signatures are never renewed.
      }
    }
  }

  if (!user) {
    res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions())
    throw new AppError('Your session has expired. Please login again.', 401)
  }

  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Please contact support.', 403)
  }

  // Seamlessly move sessions created before the cookie was given an
  // application-specific name. This avoids logging out existing customers.
  if (activeToken !== sessionToken) {
    res.cookie(AUTH_COOKIE_NAME, activeToken, getCookieOptions())
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
