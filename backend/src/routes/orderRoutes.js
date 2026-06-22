const { Router } = require('express')

const {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrderTracking,
  updateDeliveryTracking,
  updateOrderStatus,
} = require('../controllers/orderController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect)

router.post('/', createOrder)
router.get('/my-orders', getMyOrders)
router.get('/admin/all', admin, getAllOrders)
router.get('/admin/:id/tracking', admin, getOrderTracking)
router.patch('/admin/:id/delivery', admin, updateDeliveryTracking)
router.patch('/admin/:id/status', admin, updateOrderStatus)
router.get('/:id/tracking', getOrderTracking)
router.get('/:id', getOrderById)
router.patch('/:id/cancel', cancelOrder)

module.exports = router
