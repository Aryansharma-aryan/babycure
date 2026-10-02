const { Router } = require('express')

const {
  addToCart,
  mergeGuestCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} = require('../controllers/cartController')
const { protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect)

router.post('/add', addToCart)
router.post('/merge', mergeGuestCart)
router.get('/', getCart)
router.put('/update/:productId', updateCartItem)
router.delete('/remove/:productId', removeCartItem)
router.delete('/clear', clearCart)

module.exports = router
