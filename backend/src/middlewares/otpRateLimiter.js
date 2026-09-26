const rateLimit = require('express-rate-limit')

const sendPasswordResetOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
  },
})

const sendLoginOtpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many code requests. Please try again in a few minutes.' } })
const verifyLoginOtpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' } })

module.exports = {
  sendLoginOtpLimiter,
  verifyLoginOtpLimiter,
  sendPasswordResetOtpLimiter,
}
