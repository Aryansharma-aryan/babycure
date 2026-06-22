const { Router } = require('express')

const { deleteReview, updateReview } = require('../controllers/reviewController')
const { protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect)

router.put('/:reviewId', updateReview)
router.delete('/:reviewId', deleteReview)

module.exports = router
