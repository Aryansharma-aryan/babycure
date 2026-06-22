const { Router } = require('express')

const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController')
const { protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect)

router.post('/razorpay/order', createRazorpayOrder)
router.post('/razorpay/verify', verifyRazorpayPayment)

module.exports = router
