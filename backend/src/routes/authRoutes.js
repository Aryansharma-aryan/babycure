const { Router } = require('express')

const {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordWithOtp,
  sendPasswordResetOtp,
  sendPhoneOtp,
  updateMe,
  verifyPhoneOtp,
} = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleware')
const { sendPasswordResetOtpLimiter, sendPhoneOtpLimiter } = require('../middlewares/otpRateLimiter')

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/send-phone-otp', sendPhoneOtpLimiter, sendPhoneOtp)
router.post('/verify-phone-otp', verifyPhoneOtp)
router.post('/password/forgot', sendPasswordResetOtpLimiter, sendPasswordResetOtp)
router.post('/password/reset', resetPasswordWithOtp)
router.post('/forgot-password', sendPasswordResetOtpLimiter, sendPasswordResetOtp)
router.post('/reset-password', resetPasswordWithOtp)
router.get('/me', protect, getMe)
router.patch('/me', protect, updateMe)

module.exports = router
