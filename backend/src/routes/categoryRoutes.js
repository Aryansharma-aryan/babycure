const { Router } = require('express')

const {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} = require('../controllers/categoryController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.route('/').get(getAllCategories).post(protect, admin, createCategory)
router.route('/:id').get(getCategoryById).put(protect, admin, updateCategory).delete(protect, admin, deleteCategory)

module.exports = router
