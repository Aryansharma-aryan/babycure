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

const router = Router()

router.route('/').get(getAllProducts).post(protect, admin, uploadProductImages, createProduct)
router.route('/:productId/reviews').post(protect, createReview).get(getProductReviews)
router.route('/:id').get(getProductById).put(protect, admin, uploadProductImages, updateProduct).delete(protect, admin, deleteProduct)

module.exports = router
