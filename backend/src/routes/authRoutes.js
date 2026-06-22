const { Router } = require('express')

const {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  sendPhoneOtp,
  verifyPhoneOtp,
} = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleware')
const { sendPhoneOtpLimiter } = require('../middlewares/otpRateLimiter')

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/send-phone-otp', sendPhoneOtpLimiter, sendPhoneOtp)
router.post('/verify-phone-otp', verifyPhoneOtp)
router.get('/me', protect, getMe)

module.exports = router
