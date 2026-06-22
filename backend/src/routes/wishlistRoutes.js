const { Router } = require('express')

const {
  addToWishlist,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController')
const { protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect)

router.post('/:productId', addToWishlist)
router.get('/', getWishlist)
router.delete('/:productId', removeFromWishlist)
router.delete('/', clearWishlist)

module.exports = router
