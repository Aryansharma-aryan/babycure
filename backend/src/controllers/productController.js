const mongoose = require('mongoose')
const Category = require('../models/Category')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const slugify = require('../utils/slugify')
const { allowedCategoryNames } = require('../utils/allowedCategories')

const productFields = [
  'name',
  'description',
  'shortDescription',
  'keyFeatures',
  'specifications',
  'benefits',
  'howToUse',
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

const normalizeImages = (files = [], body = {}) => {
  // Support up to 4 explicit slots named imageFile0..3 or imageUrl0..3 (preserves order)
  const slots = []
  for (let i = 0; i < 4; i += 1) {
    // look for a file uploaded in field `imageFile{i}`
    const file = files.find((f) => f.fieldname === `imageFile${i}`)
    if (file) {
      slots.push({ url: file.path || file.filename || file.location, publicId: file.filename || file.publicId || null })
      continue
    }

    const url = body[`imageUrl${i}`]
    if (url) {
      slots.push({ url, publicId: null })
      continue
    }
  }

  if (slots.length > 0) return slots.slice(0, 4)

  // If explicit slots not provided but files exist (e.g., multi-file input named `images`), use arrival order
  if (files && files.length > 0) {
    return files.slice(0, 4).map((f) => ({ url: f.path || f.filename || f.location, publicId: f.filename || f.publicId || null }))
  }

  // Fallback: support legacy `images` field (string or array)
  const bodyImages = body.images
  if (!bodyImages) return undefined

  const images = Array.isArray(bodyImages) ? bodyImages : [bodyImages]
  return images
    .map((image) => {
      if (typeof image === 'string') {
        return { url: image, publicId: null }
      }

      return image
    })
    .filter((image) => image?.url)
    .slice(0, 4)
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

  // multer.fields() yields an object like { imageFile0: [file], images: [file, ...] }
  // normalize into a flat array of file objects for backward compatibility with normalizeImages
  let fileList = files
  if (files && !Array.isArray(files) && typeof files === 'object') {
    fileList = Object.values(files).flat()
  }

  const images = normalizeImages(fileList, body)
  if (images) {
    payload.images = images
    // If primaryIndex provided, move that image to index 0
    if (typeof body.primaryIndex !== 'undefined') {
      const idx = Number(body.primaryIndex)
      if (!Number.isNaN(idx) && idx >= 0 && idx < payload.images.length) {
        const primary = payload.images.splice(idx, 1)[0]
        payload.images.unshift(primary)
      }
    }
  }

  return payload
}

const ensureCategoryExists = async (categoryId) => {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new AppError('Valid category is required.', 400)
  }

  const category = await Category.findById(categoryId)
  if (!category || !allowedCategoryNames.includes(category.name)) {
    throw new AppError('Valid category is required.', 400)
  }
}

const createProduct = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('createProduct: req.files keys:', Array.isArray(req.files) ? req.files.map(f => f.fieldname) : Object.keys(req.files || {}))
    // eslint-disable-next-line no-console
    console.log('createProduct: req.body keys:', Object.keys(req.body || {}))
  }
  const payload = buildProductPayload(req.body, req.files)

  if (!payload.name || !payload.description || payload.price === undefined || !payload.category || !payload.sku) {
    throw new AppError('Name, description, price, category and SKU are required.', 400)
  }

  await ensureCategoryExists(payload.category)

  const product = await Product.create(payload)
  await product.populate('category', 'name slug')

  const responseBody = {
    success: true,
    message: 'Product created successfully.',
    product,
  }
  if (req.uploadWarning) responseBody.uploadWarning = req.uploadWarning
  res.status(201).json(responseBody)
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

  const allowedCategories = await Category.find({ name: { $in: allowedCategoryNames } }).distinct('_id')
  const filter = { isActive: true, category: { $in: allowedCategories } }

  if (search) {
    filter.$text = { $search: search }
  }

  if (category) {
    if (!allowedCategories.some((id) => id.toString() === String(category))) {
      return res.status(200).json({ success: true, count: 0, total: 0, page: 1, pages: 0, products: [] })
    }
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

  const allowedCategories = await Category.find({ name: { $in: allowedCategoryNames } }).distinct('_id')
  const product = await Product.findOne({ ...query, isActive: true, category: { $in: allowedCategories } })
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
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('updateProduct: req.files keys:', Array.isArray(req.files) ? req.files.map(f => f.fieldname) : Object.keys(req.files || {}))
    // eslint-disable-next-line no-console
    console.log('updateProduct: req.body keys:', Object.keys(req.body || {}))
  }
  const payload = buildProductPayload(req.body, req.files)

  if (req.body.imageOrder) {
    try {
      const existingImages = JSON.parse(req.body.imageOrder)
      const newImages = payload.images || []
      payload.images = [...existingImages, ...newImages].slice(0, 4)
    } catch {
      throw new AppError('Invalid image order.', 400)
    }
  }

  // Apply primaryIndex after merging images (if provided)
  if (typeof req.body.primaryIndex !== 'undefined' && payload.images && payload.images.length > 0) {
    const idx = Number(req.body.primaryIndex)
    if (!Number.isNaN(idx) && idx >= 0 && idx < payload.images.length) {
      const primary = payload.images.splice(idx, 1)[0]
      payload.images.unshift(primary)
    }
  }

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
  const responseBody = {
    success: true,
    message: 'Product updated successfully.',
    product,
  }
  if (req.uploadWarning) responseBody.uploadWarning = req.uploadWarning
  res.status(200).json(responseBody)
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
