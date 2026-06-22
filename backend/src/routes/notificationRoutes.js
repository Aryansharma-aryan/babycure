const { Router } = require('express')

const { getMyNotifications, markNotificationRead } = require('../controllers/notificationController')
const { protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect)

router.get('/', getMyNotifications)
router.patch('/:id/read', markNotificationRead)

module.exports = router
