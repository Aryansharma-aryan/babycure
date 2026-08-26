const jwt = require('jsonwebtoken')

const AUTH_COOKIE_NAME = 'babycure_session'
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add it to your backend .env file.')
  }

  return process.env.JWT_SECRET
}

const signToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })
}

const verifyToken = (token, options = {}) => {
  return jwt.verify(token, getJwtSecret(), options)
}

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    partitioned: isProduction,
    maxAge: SESSION_MAX_AGE_MS,
  }
}

module.exports = {
  AUTH_COOKIE_NAME,
  getCookieOptions,
  signToken,
  verifyToken,
}
