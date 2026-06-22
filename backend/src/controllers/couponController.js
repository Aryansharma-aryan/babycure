const Coupon = require('../models/Coupon')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { normalizeCouponCode, validateCoupon } = require('../utils/coupon')

const allowedFields = [
  'code',
  'description',
  'discountType',
  'discountValue',
  'minimumOrderAmount',
  'maximumDiscountAmount',
  'usageLimit',
  'startDate',
  'expiryDate',
  'isActive',
  'applicableCategories',
  'applicableProducts',
]

const buildCouponPayload = (body) => {
  const payload = {}

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field]
    }
  })

  if (payload.code) {
    payload.code = normalizeCouponCode(payload.code)
  }

  return payload
}

const createCoupon = asyncHandler(async (req, res) => {
  const payload = buildCouponPayload(req.body)

  if (!payload.code || !payload.discountType || payload.discountValue === undefined) {
    throw new AppError('Coupon code, discount type and discount value are required.', 400)
  }

  const coupon = await Coupon.create(payload)

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully.',
    coupon,
  })
})

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find()
    .populate('applicableCategories', 'name slug')
    .populate('applicableProducts', 'name slug sku')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: coupons.length,
    coupons,
  })
})

const updateCoupon = asyncHandler(async (req, res) => {
  const payload = buildCouponPayload(req.body)

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  })

  if (!coupon) {
    throw new AppError('Coupon not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully.',
    coupon,
  })
})

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)

  if (!coupon) {
    throw new AppError('Coupon not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully.',
  })
})

const applyCoupon = asyncHandler(async (req, res) => {
  const cartTotal = Number(req.body.cartTotal)

  if (!req.body.code || Number.isNaN(cartTotal) || cartTotal < 0) {
    throw new AppError('Coupon code and valid cart total are required.', 400)
  }

  const { coupon, discountAmount, payableAmount } = await validateCoupon(req.body.code, cartTotal)

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully.',
    coupon: {
      id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    cartTotal,
    discountAmount,
    payableAmount,
  })
})

module.exports = {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
}
