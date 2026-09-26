const { randomBytes, createHash } = require('crypto')
const Session = require('../models/Session')
const { AUTH_COOKIE_NAME, getCookieOptions } = require('./jwt')

const hashSession = (token) => createHash('sha256').update(token).digest('hex')
const sessionExpiry = () => new Date(Date.now() + getCookieOptions().maxAge)
const createSession = async (userId, res) => {
  const token = `s_${randomBytes(32).toString('hex')}`
  await Session.create({ tokenHash: hashSession(token), user: userId, expiresAt: sessionExpiry() })
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions())
}

module.exports = { createSession, hashSession, sessionExpiry }
