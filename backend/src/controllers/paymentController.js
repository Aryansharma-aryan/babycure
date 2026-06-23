const crypto = require('crypto')
const mongoose = require('mongoose')
const Address = require('../models/Address')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const PaymentSession = require('../models/PaymentSession')
const Product = require('../models/Product')
const StockHistory = require('../models/StockHistory')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { markCouponUsed, validateCoupon } = require('../utils/coupon')
const { getRazorpayClient } = require('../config/razorpay')
const { notifyUser } = require('../services/notificationService')

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `BC-${timestamp}-${random}`
}

const getShippingPrice = (itemsPrice) => (itemsPrice > 999 ? 0 : 40)

const getCartCheckoutTotals = async (cart, couponCode, session) => {
  const orderItems = []

  for (const item of cart.items) {
    const product = await Product.findOne({ _id: item.product, isActive: true }).session(session)

    if (!product) {
      throw new AppError('One or more products are unavailable.', 400)
    }

    if (product.stock < item.quantity) {
      throw new AppError('One or more products are out of stock.', 400)
    }

    orderItems.push({
      product,
      quantity: item.quantity,
      price: product.price,
      name: product.name,
      image: product.images?.[0]?.url || '',
    })
  }

  const itemsPrice = orderItems.reduce((total, item) => total + item.quantity * item.price, 0)
  const shippingPrice = getShippingPrice(itemsPrice)
  const taxPrice = 0
  const productIds = orderItems.map((item) => item.product._id)
  const categoryIds = orderItems.map((item) => item.product.category).filter(Boolean)
  let coupon
  let discountAmount = 0

  if (couponCode) {
    const couponResult = await validateCoupon(couponCode, itemsPrice, { productIds, categoryIds })
    coupon = couponResult.coupon
    discountAmount = couponResult.discountAmount
  }

  const totalPrice = Math.max(itemsPrice + shippingPrice + taxPrice - discountAmount, 0)

  return {
    coupon,
    discountAmount,
    itemsPrice,
    orderItems,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, couponCode } = req.body

  if (!mongoose.isValidObjectId(shippingAddress)) {
    throw new AppError('Valid shipping address is required.', 400)
  }

  const address = await Address.findOne({ _id: shippingAddress, user: req.user._id })

  if (!address) {
    throw new AppError('Shipping address not found.', 404)
  }

  const cart = await Cart.findOne({ user: req.user._id })

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty.', 400)
  }

  const totals = await getCartCheckoutTotals(cart, couponCode)
  const razorpay = getRazorpayClient()
  const amount = Math.round(totals.totalPrice * 100)
  const receipt = `BC-PAY-${Date.now().toString(36).toUpperCase()}`

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt,
    notes: {
      userId: req.user._id.toString(),
      shippingAddress: shippingAddress.toString(),
    },
  })

  await PaymentSession.create({
    user: req.user._id,
    shippingAddress,
    couponCode: couponCode || undefined,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: razorpayOrder.currency,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  })

  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    },
    checkout: {
      totalPrice: totals.totalPrice,
      itemsPrice: totals.itemsPrice,
      shippingPrice: totals.shippingPrice,
      discountAmount: totals.discountAmount,
    },
  })
})

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Invalid payment verification request.', 400)
  }

  const paymentSession = await PaymentSession.findOne({
    razorpayOrderId: razorpay_order_id,
    user: req.user._id,
    status: 'pending',
  })

  if (!paymentSession) {
    throw new AppError('Invalid payment verification request.', 400)
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    paymentSession.status = 'failed'
    await paymentSession.save()
    throw new AppError('Payment verification failed.', 400)
  }

  const session = await mongoose.startSession()
  let order

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.user._id }).session(session)

      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty.', 400)
      }

      const totals = await getCartCheckoutTotals(cart, paymentSession.couponCode, session)

      if (Math.round(totals.totalPrice * 100) !== paymentSession.amount) {
        throw new AppError('Cart total changed. Please retry checkout.', 409)
      }

      for (const item of totals.orderItems) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.product._id,
            isActive: true,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { new: true, session },
        )

        if (!product) {
          throw new AppError('One or more products are unavailable or out of stock.', 400)
        }

        await StockHistory.create(
          [
            {
              product: item.product._id,
              previousStock: product.stock + item.quantity,
              newStock: product.stock,
              change: -item.quantity,
              reason: 'order_placed',
              note: `Paid order stock deduction for ${item.quantity} item(s)`,
              changedBy: req.user._id,
            },
          ],
          { session },
        )
      }

      const [createdOrder] = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            user: req.user._id,
            orderItems: totals.orderItems.map((item) => ({
              product: item.product._id,
              name: item.name,
              image: item.image,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingAddress: paymentSession.shippingAddress,
            itemsPrice: totals.itemsPrice,
            shippingPrice: totals.shippingPrice,
            taxPrice: totals.taxPrice,
            coupon: totals.coupon?._id,
            couponCode: totals.coupon?.code,
            discountAmount: totals.discountAmount,
            totalPrice: totals.totalPrice,
            paymentMethod: 'ONLINE',
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            orderStatus: 'placed',
          },
        ],
        { session },
      )

      await markCouponUsed(createdOrder, session)
      await createdOrder.save({ session })

      cart.items = []
      cart.cartTotal = 0
      await cart.save({ session })

      paymentSession.status = 'paid'
      paymentSession.order = createdOrder._id
      await paymentSession.save({ session })

      order = createdOrder
    })
  } finally {
    session.endSession()
  }

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
