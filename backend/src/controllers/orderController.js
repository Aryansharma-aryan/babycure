const mongoose = require('mongoose')
const Address = require('../models/Address')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const Product = require('../models/Product')
const StockHistory = require('../models/StockHistory')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { markCouponUsed, validateCoupon } = require('../utils/coupon')
const { notifyUser } = require('../services/notificationService')

const cancellableStatuses = ['placed', 'processing']
const orderStatuses = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
const deliveryStatuses = ['placed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed']

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `BC-${timestamp}-${random}`
}

const getShippingPrice = (itemsPrice) => (itemsPrice >= 499 ? 0 : 49)

const populateOrder = (query) =>
  query
    .populate('user', 'name email phone')
    .populate('shippingAddress')
    .populate('orderItems.product', 'name slug images price sku')

const restoreOrderStock = async (order, session) => {
  await Promise.all(
    order.orderItems.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
        { session },
      ),
    ),
  )
}

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'ONLINE', couponCode } = req.body

  if (!mongoose.isValidObjectId(shippingAddress)) {
    throw new AppError('Valid shipping address is required.', 400)
  }

  if (!['COD', 'ONLINE'].includes(paymentMethod)) {
    throw new AppError('Valid payment method is required.', 400)
  }

  if (paymentMethod === 'COD') {
    throw new AppError('COD is not available. Please use online payment.', 400)
  }

  if (paymentMethod === 'ONLINE') {
    throw new AppError('Please complete Razorpay payment first. Your order will be placed after payment succeeds.', 400)
  }

  const session = await mongoose.startSession()

  try {
    let order

    await session.withTransaction(async () => {
      const address = await Address.findOne({ _id: shippingAddress, user: req.user._id }).session(session)
      if (!address) {
        throw new AppError('Shipping address not found.', 404)
      }

      const cart = await Cart.findOne({ user: req.user._id }).session(session)
      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty.', 400)
      }

      const orderItems = []

      for (const item of cart.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.product,
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
              product: product._id,
              previousStock: product.stock + item.quantity,
              newStock: product.stock,
              change: -item.quantity,
              reason: 'order_placed',
              note: `Order stock deduction for ${item.quantity} item(s)`,
              changedBy: req.user._id,
            },
          ],
          { session },
        )

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          quantity: item.quantity,
          price: product.price,
        })
      }

      const itemsPrice = orderItems.reduce((total, item) => total + item.quantity * item.price, 0)
      const shippingPrice = getShippingPrice(itemsPrice)
      const taxPrice = 0
      const productIds = orderItems.map((item) => item.product)
      const productsForCoupon = await Product.find({ _id: { $in: productIds } }).select('category').session(session)
      const categoryIds = productsForCoupon.map((product) => product.category)
      let coupon
      let discountAmount = 0

      if (couponCode) {
        const couponResult = await validateCoupon(couponCode, itemsPrice, { productIds, categoryIds })
        coupon = couponResult.coupon
        discountAmount = couponResult.discountAmount
      }

      const totalPrice = Math.max(itemsPrice + shippingPrice + taxPrice - discountAmount, 0)

      const [createdOrder] = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            user: req.user._id,
            orderItems,
            shippingAddress,
            itemsPrice,
            shippingPrice,
            taxPrice,
            coupon: coupon?._id,
            couponCode: coupon?.code,
            discountAmount,
            totalPrice,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
            orderStatus: 'placed',
          },
        ],
        { session },
      )

      if (paymentMethod === 'COD') {
        cart.items = []
        cart.cartTotal = 0
        await cart.save({ session })
      }

      order = createdOrder
    })

    const populatedOrder = await populateOrder(Order.findById(order._id))

    notifyUser({
      userId: req.user._id,
      type: 'order_placed',
      title: 'Order placed successfully',
      message: `Your order ${order.orderNumber} has been placed.`,
      metadata: { orderId: order._id, orderNumber: order.orderNumber },
    }).catch(() => {})

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: populatedOrder,
    })
  } finally {
    session.endSession()
  }
})

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('orderNumber totalPrice paymentMethod paymentStatus orderStatus createdAt deliveredAt cancelledAt orderItems')
    .lean()

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  })
})

const getOrderById = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user._id }

  const order = await populateOrder(Order.findOne(filter))

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  res.status(200).json({
    success: true,
    order,
  })
})

const cancelOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()

  try {
    let order

    await session.withTransaction(async () => {
      order = await Order.findOne({ _id: req.params.id, user: req.user._id }).session(session)

      if (!order) {
        throw new AppError('Order not found.', 404)
      }

      if (!cancellableStatuses.includes(order.orderStatus)) {
        throw new AppError('This order cannot be cancelled now.', 400)
      }

      await restoreOrderStock(order, session)
      order.orderStatus = 'cancelled'
      order.cancelledAt = new Date()
      await order.save({ session })
    })

    const populatedOrder = await populateOrder(Order.findById(order._id))

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      order: populatedOrder,
    })
  } finally {
    session.endSession()
  }
})

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = status ? { orderStatus: status } : {}

  const [orders, total] = await Promise.all([
    populateOrder(Order.find(filter))
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Order.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
    orders,
  })
})

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body

  if (!orderStatuses.includes(orderStatus)) {
    throw new AppError('Valid order status is required.', 400)
  }

  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  order.orderStatus = orderStatus

  if (orderStatus === 'delivered') {
    order.deliveredAt = order.deliveredAt || new Date()
    if (order.paymentMethod === 'COD') {
      const wasPaid = order.paymentStatus === 'paid'
      order.paymentStatus = 'paid'
      if (!wasPaid) {
        await markCouponUsed(order)
      }
    }
  }

  if (orderStatus === 'cancelled') {
    order.cancelledAt = order.cancelledAt || new Date()
  }

  await order.save()
  const populatedOrder = await populateOrder(Order.findById(order._id))

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully.',
    order: populatedOrder,
  })
})

const getTrackingPayload = (order) => ({
  orderId: order._id,
  orderNumber: order.orderNumber,
  orderStatus: order.orderStatus,
  trackingId: order.trackingId,
  awbCode: order.awbCode,
  shiprocketOrderId: order.shiprocketOrderId,
  shiprocketShipmentId: order.shiprocketShipmentId,
  courierName: order.courierName,
  trackingUrl: order.trackingUrl,
  labelUrl: order.labelUrl,
  pickupStatus: order.pickupStatus,
  shipmentStatus: order.shipmentStatus,
  estimatedDeliveryDate: order.estimatedDeliveryDate,
  deliveryStatus: order.deliveryStatus,
  trackingHistory: order.trackingHistory,
})

const getOrderTracking = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user._id }

  const order = await Order.findOne(filter).select(
    'orderNumber orderStatus trackingId awbCode shiprocketOrderId shiprocketShipmentId courierName trackingUrl labelUrl pickupStatus shipmentStatus estimatedDeliveryDate deliveryStatus trackingHistory',
  )

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  res.status(200).json({
    success: true,
    tracking: getTrackingPayload(order),
  })
})

const updateDeliveryTracking = asyncHandler(async (req, res) => {
  const allowedFields = ['courierName', 'trackingId', 'awbCode', 'trackingUrl', 'estimatedDeliveryDate', 'deliveryStatus']
  const updates = {}

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field]
    }
  })

  if (updates.deliveryStatus && !deliveryStatuses.includes(updates.deliveryStatus)) {
    throw new AppError('Valid delivery status is required.', 400)
  }

  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  Object.assign(order, updates)
  if (updates.awbCode) {
    order.trackingId = updates.awbCode
  }

  if (updates.deliveryStatus) {
    order.trackingHistory.push({
      status: updates.deliveryStatus,
      message: req.body.message || `Delivery status updated to ${updates.deliveryStatus.replace(/_/g, ' ')}`,
      location: req.body.location,
      updatedAt: new Date(),
    })

    if (updates.deliveryStatus === 'delivered') {
      order.orderStatus = 'delivered'
      order.deliveredAt = order.deliveredAt || new Date()
      if (order.paymentMethod === 'COD') {
        order.paymentStatus = 'paid'
      }
    } else if (updates.deliveryStatus === 'shipped' || updates.deliveryStatus === 'in_transit') {
      order.orderStatus = 'shipped'
    } else if (updates.deliveryStatus === 'out_for_delivery') {
      order.orderStatus = 'out_for_delivery'
    }
  }

  await order.save()

  if (updates.deliveryStatus === 'shipped' || updates.deliveryStatus === 'in_transit') {
    notifyUser({
      userId: order.user,
      type: 'order_shipped',
      title: 'Your order has shipped',
      message: `Order ${order.orderNumber} is on the way.`,
      metadata: { orderId: order._id, trackingId: order.trackingId },
    }).catch(() => {})
  }

  if (updates.deliveryStatus === 'delivered') {
    notifyUser({
      userId: order.user,
      type: 'order_delivered',
      title: 'Order delivered',
      message: `Order ${order.orderNumber} has been delivered.`,
      metadata: { orderId: order._id },
    }).catch(() => {})
  }

  res.status(200).json({
    success: true,
    message: 'Delivery tracking updated successfully.',
    tracking: getTrackingPayload(order),
  })
})

module.exports = {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrderTracking,
  updateOrderStatus,
  updateDeliveryTracking,
}
