const { Router } = require('express')

const {
  sendLoginOtp,
  verifyLoginOtp,
  getMe,
  logoutUser,
  resetPasswordWithOtp,
  sendPasswordResetOtp,
  updateMe,
} = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleware')
const { sendLoginOtpLimiter, verifyLoginOtpLimiter, sendPasswordResetOtpLimiter } = require('../middlewares/otpRateLimiter')

const router = Router()

router.post('/otp/send', sendLoginOtpLimiter, sendLoginOtp)
router.post('/otp/verify', verifyLoginOtpLimiter, verifyLoginOtp)
router.post('/register', sendLoginOtpLimiter, sendLoginOtp)
router.post('/login', sendLoginOtpLimiter, sendLoginOtp)
router.post('/logout', logoutUser)
router.post('/password/forgot', sendPasswordResetOtpLimiter, sendPasswordResetOtp)
router.post('/password/reset', resetPasswordWithOtp)
router.post('/forgot-password', sendPasswordResetOtpLimiter, sendPasswordResetOtp)
router.post('/reset-password', resetPasswordWithOtp)
router.get('/me', protect, getMe)
router.patch('/me', protect, updateMe)

module.exports = router
