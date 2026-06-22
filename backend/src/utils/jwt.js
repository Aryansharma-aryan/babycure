const jwt = require('jsonwebtoken')

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add it to your backend .env file.')
  }

  return process.env.JWT_SECRET
}

const signToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret())
}

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

module.exports = {
  getCookieOptions,
  signToken,
  verifyToken,
}
