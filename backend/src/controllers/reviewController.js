const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const Review = require('../models/Review')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const recalculateProductRating = require('../utils/recalculateProductRating')

const hasPurchasedProduct = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    orderStatus: 'delivered',
    'orderItems.product': productId,
  }).select('_id')

  return order
}

const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { rating, comment, order } = req.body

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError('Valid product is required.', 400)
  }

  const product = await Product.findOne({ _id: productId, isActive: true })
  if (!product) {
    throw new AppError('Product not found.', 404)
  }

  const existingReview = await Review.findOne({ user: req.user._id, product: productId })
  if (existingReview) {
    throw new AppError('You have already reviewed this product.', 409)
  }

  let purchasedOrderId = order

  if (!purchasedOrderId) {
    const purchasedOrder = await hasPurchasedProduct(req.user._id, productId)
    purchasedOrderId = purchasedOrder?._id
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    order: purchasedOrderId,
    rating,
    comment,
  })

  await recalculateProductRating(product._id)

  res.status(201).json({
    success: true,
    message: 'Review created successfully.',
    review,
  })
})

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  })
})

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId)

  if (!review) {
    throw new AppError('Review not found.', 404)
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You are not allowed to update this review.', 403)
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'rating')) {
    review.rating = req.body.rating
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'comment')) {
    review.comment = req.body.comment
  }

  await review.save()
  await recalculateProductRating(review.product)

  res.status(200).json({
    success: true,
    message: 'Review updated successfully.',
    review,
  })
})

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId)

  if (!review) {
    throw new AppError('Review not found.', 404)
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You are not allowed to delete this review.', 403)
  }

  const productId = review.product
  await review.deleteOne()
  await recalculateProductRating(productId)

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
  })
})

module.exports = {
  createReview,
  deleteReview,
  getProductReviews,
  updateReview,
}
