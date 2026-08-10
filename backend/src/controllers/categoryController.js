const Category = require('../models/Category')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const slugify = require('../utils/slugify')

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive } = req.body

  if (!name) {
    throw new AppError('Category name is required.', 400)
  }

  const category = await Category.create({
    name,
    description,
    image,
    isActive,
  })

  res.status(201).json({
    success: true,
    message: 'Category created successfully.',
    category,
  })
})

const getAllCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'
  const filter = includeInactive ? {} : { isActive: true }

  const categories = await Category.find(filter).sort({ createdAt: -1 }).lean()

  res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  })
})

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)

  if (!category || (!category.isActive && req.user?.role !== 'admin')) {
    throw new AppError('Category not found.', 404)
  }

  res.status(200).json({
    success: true,
    category,
  })
})

const updateCategory = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'description', 'image', 'isActive']
  const updates = {}

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field]
    }
  })

  if (updates.name) {
    updates.slug = slugify(updates.name)
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })

  if (!category) {
    throw new AppError('Category not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully.',
    category,
  })
})

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)

  if (!category) {
    throw new AppError('Category not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully.',
  })
})

module.exports = {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
}
