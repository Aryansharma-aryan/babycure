const { Router } = require('express')

const {
  assignAwbToOrder,
  createShipment,
  generateOrderLabel,
  scheduleOrderPickup,
  shiprocketWebhook,
  trackOrder,
} = require('../controllers/shiprocketController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.post('/webhook', shiprocketWebhook)

router.use(protect, admin)

router.post('/create-shipment/:orderId', createShipment)
router.post('/assign-awb/:orderId', assignAwbToOrder)
router.post('/generate-label/:orderId', generateOrderLabel)
router.post('/schedule-pickup/:orderId', scheduleOrderPickup)
router.get('/track/:orderId', trackOrder)

module.exports = router
