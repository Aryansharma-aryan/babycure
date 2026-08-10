const { Router } = require('express')

const {
  approveRequest,
  closeRequest,
  createReplacementRequest,
  createReplacementShipmentForRequest,
  createReturnPickupForRequest,
  createReturnRequest,
  getAllRequests,
  getMyRequests,
  initiateRefund,
  rejectRequest,
  trackReturnShipment,
  updateRequestStatus,
} = require('../controllers/returnRequestController')
const { admin, protect } = require('../middlewares/authMiddleware')
const { uploadReturnImages } = require('../middlewares/uploadMiddleware')

const router = Router()

router.use(protect)

router.get('/my-requests', getMyRequests)
router.post('/orders/:orderId/return', uploadReturnImages, createReturnRequest)
router.post('/orders/:orderId/replacement', uploadReturnImages, createReplacementRequest)

router.get('/admin/all', admin, getAllRequests)
router.patch('/admin/:id/status', admin, updateRequestStatus)
router.patch('/admin/:id/approve', admin, approveRequest)
router.patch('/admin/:id/reject', admin, rejectRequest)
router.patch('/admin/:id/close', admin, closeRequest)
router.post('/admin/:id/return-pickup', admin, createReturnPickupForRequest)
router.get('/admin/:id/track-return', admin, trackReturnShipment)
router.post('/admin/:id/refund', admin, initiateRefund)
router.post('/admin/:id/replacement-shipment', admin, createReplacementShipmentForRequest)

module.exports = router
