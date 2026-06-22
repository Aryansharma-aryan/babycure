const rateLimit = require('express-rate-limit')

const sendPhoneOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
  },
})

module.exports = {
  sendPhoneOtpLimiter,
}
