const mongoose = require('mongoose')
const Product = require('../models/Product')
const Wishlist = require('../models/Wishlist')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId })

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] })
  }

  return wishlist
}

const sendWishlist = async (res, wishlist, message = 'Wishlist fetched successfully.') => {
  const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
    'products',
    'name slug price mrp images stock brand ratingsAverage ratingsQuantity isActive',
  )

  res.status(200).json({
    success: true,
    message,
    wishlist: populatedWishlist,
  })
}

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError('Valid product is required.', 400)
  }

  const product = await Product.findOne({ _id: productId, isActive: true })
  if (!product) {
    throw new AppError('Product not found.', 404)
  }

  const wishlist = await getOrCreateWishlist(req.user._id)
  const exists = wishlist.products.some((id) => id.toString() === productId)

  if (!exists) {
    wishlist.products.push(productId)
    await wishlist.save()
  }

  await sendWishlist(res, wishlist, exists ? 'Product already in wishlist.' : 'Product added to wishlist.')
})

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id)
  await sendWishlist(res, wishlist)
})

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id)
  wishlist.products = wishlist.products.filter((id) => id.toString() !== req.params.productId)
  await wishlist.save()

  await sendWishlist(res, wishlist, 'Product removed from wishlist.')
})

const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id)
  wishlist.products = []
  await wishlist.save()

  await sendWishlist(res, wishlist, 'Wishlist cleared successfully.')
})

module.exports = {
  addToWishlist,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
}
