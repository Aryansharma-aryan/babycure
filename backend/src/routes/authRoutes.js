const { Router } = require('express')

const {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordWithOtp,
  sendPasswordResetOtp,
  updateMe,
} = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleware')
const { sendPasswordResetOtpLimiter } = require('../middlewares/otpRateLimiter')

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/password/forgot', sendPasswordResetOtpLimiter, sendPasswordResetOtp)
router.post('/password/reset', resetPasswordWithOtp)
router.post('/forgot-password', sendPasswordResetOtpLimiter, sendPasswordResetOtp)
router.post('/reset-password', resetPasswordWithOtp)
router.get('/me', protect, getMe)
router.patch('/me', protect, updateMe)

module.exports = router
