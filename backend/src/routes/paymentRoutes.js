const { Router } = require('express')

const { createRazorpayOrder, handleRazorpayWebhook, verifyRazorpayPayment } = require('../controllers/paymentController')
const { protect } = require('../middlewares/authMiddleware')

const router = Router()

router.post('/razorpay/webhook', handleRazorpayWebhook)

router.use(protect)

router.post('/razorpay/order', createRazorpayOrder)
router.post('/razorpay/verify', verifyRazorpayPayment)

module.exports = router
