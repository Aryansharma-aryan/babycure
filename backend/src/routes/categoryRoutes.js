const { Router } = require('express')

const {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} = require('../controllers/categoryController')
const { admin, protect } = require('../middlewares/authMiddleware')
const cache = require('../middlewares/cacheMiddleware')

const router = Router()

router.route('/').get(cache('categories:active', 120), getAllCategories).post(protect, admin, createCategory)
router.route('/:id').get(getCategoryById).put(protect, admin, updateCategory).delete(protect, admin, deleteCategory)

module.exports = router
