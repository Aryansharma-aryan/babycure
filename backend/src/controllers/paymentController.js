const crypto = require('crypto')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { markCouponUsed } = require('../utils/coupon')
const { getRazorpayClient } = require('../config/razorpay')
const { notifyUser } = require('../services/notificationService')

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  const order = await Order.findOne({ _id: orderId, user: req.user._id })

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  if (order.paymentMethod !== 'ONLINE') {
    throw new AppError('Online payment is not enabled for this order.', 400)
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError('Order is already paid.', 400)
  }

  const razorpay = getRazorpayClient()
  const amount = Math.round(order.totalPrice * 100)

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
  })

  order.razorpayOrderId = razorpayOrder.id
  await order.save()

  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    },
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
    },
  })
})

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Invalid payment verification request.', 400)
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id })

  if (!order || order.razorpayOrderId !== razorpay_order_id) {
    throw new AppError('Invalid payment verification request.', 400)
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    order.paymentStatus = 'failed'
    await order.save()
    throw new AppError('Payment verification failed.', 400)
  }

  const wasPaid = order.paymentStatus === 'paid'
  order.paymentStatus = 'paid'
  order.razorpayPaymentId = razorpay_payment_id
  order.razorpaySignature = razorpay_signature
  if (!wasPaid) {
    await markCouponUsed(order)
  }
  await order.save()
  await Cart.updateOne({ user: order.user }, { $set: { items: [], cartTotal: 0 } })

  notifyUser({
    userId: order.user,
    type: 'payment_success',
    title: 'Payment successful',
    message: `Payment for order ${order.orderNumber} was successful.`,
    metadata: { orderId: order._id, paymentId: razorpay_payment_id },
  }).catch(() => {})

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully.',
    order,
  })
})

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
}
