const { Router } = require('express')

const {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} = require('../controllers/productController')
const { createReview, getProductReviews } = require('../controllers/reviewController')
const { admin, protect } = require('../middlewares/authMiddleware')
const { uploadProductImages } = require('../middlewares/uploadMiddleware')
const cache = require('../middlewares/cacheMiddleware')

const router = Router()

router.route('/').get(cache((req) => `products:${req.originalUrl}`, 30), getAllProducts).post(protect, admin, uploadProductImages, createProduct)
router.route('/:productId/reviews').post(protect, createReview).get(getProductReviews)
router.route('/:id').get(getProductById).put(protect, admin, uploadProductImages, updateProduct).delete(protect, admin, deleteProduct)

module.exports = router
