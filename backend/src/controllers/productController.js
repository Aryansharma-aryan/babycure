const mongoose = require('mongoose')
const Category = require('../models/Category')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const slugify = require('../utils/slugify')

const productFields = [
  'name',
  'description',
  'shortDescription',
  'price',
  'mrp',
  'category',
  'stock',
  'sku',
  'brand',
  'isFeatured',
  'isActive',
]

const numberFields = ['price', 'mrp', 'stock']
const booleanFields = ['isFeatured', 'isActive']

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}

const normalizeImages = (files = [], bodyImages) => {
  if (files.length > 0) {
    return files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }))
  }

  if (!bodyImages) return undefined

  const images = Array.isArray(bodyImages) ? bodyImages : [bodyImages]
  return images
    .map((image) => {
      if (typeof image === 'string') {
        return { url: image }
      }

      return image
    })
    .filter((image) => image?.url)
    .slice(0, 5)
}

const buildProductPayload = (body, files = []) => {
  const payload = {}

  productFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field]
    }
  })

  numberFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      payload[field] = Number(payload[field])
    }
  })

  booleanFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      payload[field] = toBoolean(payload[field])
    }
  })

  if (payload.name) {
    payload.slug = slugify(payload.name)
  }

  const images = normalizeImages(files, body.images)
  if (images) {
    payload.images = images
  }

  return payload
}

const ensureCategoryExists = async (categoryId) => {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new AppError('Valid category is required.', 400)
  }

  const category = await Category.findById(categoryId)
  if (!category) {
    throw new AppError('Valid category is required.', 400)
  }
}

const createProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body, req.files)

  if (!payload.name || !payload.description || payload.price === undefined || !payload.category || !payload.sku) {
    throw new AppError('Name, description, price, category and SKU are required.', 400)
  }

  await ensureCategoryExists(payload.category)

  const product = await Product.create(payload)
  await product.populate('category', 'name slug')

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    product,
  })
})

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    search = '',
    category,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query

  const filter = { isActive: true }

  if (search) {
    filter.$text = { $search: search }
  }

  if (category) {
    filter.category = category
  }

  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50)
  const skip = (safePage - 1) * safeLimit
  const sortBy = String(sort).split(',').join(' ')

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Product.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
    products,
  })
})

const getProductById = asyncHandler(async (req, res) => {
  const query = mongoose.isValidObjectId(req.params.id)
    ? { _id: req.params.id }
    : { slug: req.params.id }

  const product = await Product.findOne({ ...query, isActive: true })
    .populate('category', 'name slug')
    .lean()

  if (!product) {
    throw new AppError('Product not found.', 404)
  }

  res.status(200).json({
    success: true,
    product,
  })
})

const updateProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body, req.files)

  if (payload.category) {
    await ensureCategoryExists(payload.category)
  }

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug')

  if (!product) {
    throw new AppError('Product not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    product,
  })
})

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)

  if (!product) {
    throw new AppError('Product not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully.',
  })
})

module.exports = {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
}
