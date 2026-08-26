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

module.exports = {
  sendPasswordResetOtpLimiter,
}
