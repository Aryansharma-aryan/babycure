const { Router } = require('express')

const {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} = require('../controllers/couponController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.post('/apply', protect, applyCoupon)
router.route('/').post(protect, admin, createCoupon).get(protect, admin, getCoupons)
router.route('/:id').put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon)

module.exports = router
