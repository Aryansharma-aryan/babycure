const Coupon = require('../models/Coupon')
const AppError = require('./AppError')

const normalizeCouponCode = (code = '') => String(code).trim().toUpperCase()

const calculateCouponDiscount = (coupon, cartTotal) => {
  let discountAmount =
    coupon.discountType === 'percentage'
      ? (cartTotal * coupon.discountValue) / 100
      : coupon.discountValue

  if (coupon.maximumDiscountAmount !== undefined && coupon.maximumDiscountAmount !== null) {
    discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount)
  }

  discountAmount = Math.min(discountAmount, cartTotal)
  return Math.round(discountAmount * 100) / 100
}

const validateCoupon = async (code, cartTotal, options = {}) => {
  const normalizedCode = normalizeCouponCode(code)

  if (!normalizedCode) {
    throw new AppError('Valid coupon code is required.', 400)
  }

  const coupon = await Coupon.findOne({ code: normalizedCode })

  if (!coupon || !coupon.isActive) {
    throw new AppError('Invalid coupon.', 400)
  }

  const now = new Date()

  if (coupon.startDate && coupon.startDate > now) {
    throw new AppError('Invalid coupon.', 400)
  }

  if (coupon.expiryDate && coupon.expiryDate < now) {
    throw new AppError('Invalid coupon.', 400)
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Invalid coupon.', 400)
  }

  if (cartTotal < (coupon.minimumOrderAmount || 0)) {
    throw new AppError(`Minimum order amount for this coupon is ${coupon.minimumOrderAmount}.`, 400)
  }

  if (options.productIds?.length && coupon.applicableProducts?.length) {
    const allowedProducts = coupon.applicableProducts.map((id) => id.toString())
    const hasProduct = options.productIds.some((id) => allowedProducts.includes(id.toString()))
    if (!hasProduct) {
      throw new AppError('Coupon is not applicable on these products.', 400)
    }
  }

  if (options.categoryIds?.length && coupon.applicableCategories?.length) {
    const allowedCategories = coupon.applicableCategories.map((id) => id.toString())
    const hasCategory = options.categoryIds.some((id) => allowedCategories.includes(id.toString()))
    if (!hasCategory) {
      throw new AppError('Coupon is not applicable on these categories.', 400)
    }
  }

  const discountAmount = calculateCouponDiscount(coupon, cartTotal)

  return {
    coupon,
    discountAmount,
    payableAmount: Math.max(Math.round((cartTotal - discountAmount) * 100) / 100, 0),
  }
}

const markCouponUsed = async (order, session) => {
  if (!order.coupon || order.couponUsedAt) {
    return
  }

  const update = await Coupon.updateOne(
    {
      _id: order.coupon,
      $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    },
    { $inc: { usedCount: 1 } },
    { session },
  )

  if (update.modifiedCount > 0) {
    order.couponUsedAt = new Date()
  }
}

module.exports = {
  calculateCouponDiscount,
  markCouponUsed,
  normalizeCouponCode,
  validateCoupon,
}
