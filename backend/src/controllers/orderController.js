const mongoose = require('mongoose')
const Address = require('../models/Address')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const Product = require('../models/Product')
const StockHistory = require('../models/StockHistory')
const logger = require('../config/logger')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { markCouponUsed, validateCoupon } = require('../utils/coupon')
const { buildInvoicePdf } = require('../utils/invoicePdf')
const { notifyOrderEvent } = require('../services/orderNotificationService')
const {
  getShiprocketOrder,
  getShiprocketOrderEstimatedDeliveryDate,
  trackShipmentByAWB,
} = require('../services/shiprocket.service')

const cancellableStatuses = ['placed', 'processing']
const cancellableDeliveryStatuses = ['placed', 'processing']
const orderStatuses = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
const deliveryStatuses = ['placed', 'processing', 'packed', 'pickup_scheduled', 'picked_up', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed']
const shiprocketStatusMap = {
  shipped: 'shipped',
  'in transit': 'in_transit',
  'out for delivery': 'out_for_delivery',
  delivered: 'delivered',
  returned: 'returned',
  rto: 'returned',
  cancelled: 'failed',
  failed: 'failed',
  packed: 'packed',
  manifest: 'packed',
  'pickup scheduled': 'pickup_scheduled',
  'pickup requested': 'pickup_scheduled',
  'picked up': 'picked_up',
  'pickup done': 'picked_up',
}
const deliveryStatusRank = {
  placed: 0,
  processing: 1,
  packed: 2,
  pickup_scheduled: 3,
  picked_up: 4,
  shipped: 5,
  in_transit: 6,
  out_for_delivery: 7,
  delivered: 8,
}

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `BC-${timestamp}-${random}`
}

const getShippingPrice = (itemsPrice) => (itemsPrice > 799 ? 0 : 60)

const populateOrder = (query) =>
  query
    .populate('user', 'name email phone')
    .populate('shippingAddress')
    .populate('orderItems.product', 'name slug images price sku')

const extractFirst = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const normalizeDeliveryStatus = (status = '') => {
  const value = String(status).trim().toLowerCase().replace(/_/g, ' ')
  if (/picked|pickup complete|shipment pickup complete/.test(value)) return 'picked_up'
  if (/pickup (scheduled|requested|booked|queued|generated)|out for pickup/.test(value)) return 'pickup_scheduled'
  if (/out for delivery/.test(value)) return 'out_for_delivery'
  if (/in[ -]?transit|reached.*hub/.test(value)) return 'in_transit'
  return shiprocketStatusMap[value] || value.replace(/\s+/g, '_') || 'processing'
}

const advanceDeliveryStatus = (currentStatus, nextStatus) => {
  if (['returned', 'failed'].includes(nextStatus)) return nextStatus
  return (deliveryStatusRank[nextStatus] ?? -1) >= (deliveryStatusRank[currentStatus] ?? -1)
    ? nextStatus
    : currentStatus
}

const syncOrderStatusFromDelivery = (order) => {
  if (order.deliveryStatus === 'delivered') {
    order.orderStatus = 'delivered'
    order.deliveredAt = order.deliveredAt || new Date()
    if (order.paymentMethod === 'COD') order.paymentStatus = 'paid'
    return
  }

  if (order.deliveryStatus === 'out_for_delivery') {
    order.orderStatus = 'out_for_delivery'
    return
  }

  if (['picked_up', 'shipped', 'in_transit'].includes(order.deliveryStatus)) {
    order.orderStatus = 'shipped'
    return
  }

  if (['processing', 'packed', 'pickup_scheduled'].includes(order.deliveryStatus)) {
    order.orderStatus = 'processing'
  }
}

const pushTrackingHistory = (order, update = {}) => {
  const normalized = normalizeDeliveryStatus(update.status || update.current_status || update.shipment_status)
  const safeStatus = deliveryStatuses.includes(normalized) ? normalized : 'processing'
  const updatedAt = update.updatedAt || update.updated_at || update.date || update.activity_date || new Date()
  const last = order.trackingHistory[order.trackingHistory.length - 1]

  if (last && last.status === safeStatus && String(new Date(last.updatedAt)) === String(new Date(updatedAt))) {
    return safeStatus
  }

  order.trackingHistory.push({
    status: safeStatus,
    message: update.message || update.activity || update.status || update.current_status || `Shipment ${safeStatus.replace(/_/g, ' ')}`,
    location: update.location || update.current_location || update.scan_location,
    updatedAt,
  })

  return safeStatus
}

const syncTrackingFromShiprocketResponse = (order, response) => {
  const previousDeliveryStatus = order.deliveryStatus
  const data = response.tracking_data || response.data || response.response?.data || response
  const shipment = data.shipment_track?.[0] || data.shipment_track || data
  const activities = data.shipment_track_activities || data.activities || data.scans || []

  order.courierName = extractFirst(shipment.courier_name, data.courier_name, order.courierName)
  order.awbCode = String(extractFirst(shipment.awb_code, data.awb_code, order.awbCode) || '')
  order.trackingId = order.awbCode || order.trackingId
  order.trackingUrl = extractFirst(data.track_url, data.tracking_url, shipment.track_url, order.trackingUrl)
  order.estimatedDeliveryDate = extractFirst(data.etd, shipment.edd, shipment.expected_delivery_date, order.estimatedDeliveryDate)
  order.shipmentStatus = extractFirst(shipment.current_status, data.current_status, data.status, order.shipmentStatus)

  const currentStatus = extractFirst(shipment.current_status, data.current_status, data.status)
  if (currentStatus) {
    order.deliveryStatus = pushTrackingHistory(order, {
      status: currentStatus,
      message: shipment.current_status || currentStatus,
      location: shipment.current_location || data.current_location,
      updatedAt: shipment.status_date || data.updated_at || new Date(),
    })
  }

  activities.forEach((activity) => {
    const status = pushTrackingHistory(order, {
      status: activity['sr-status-label'] || activity.status || activity.activity,
      message: activity.activity || activity.message || activity.status,
      location: activity.location,
      updatedAt: activity.date || activity.activity_date,
    })
    order.deliveryStatus = status
  })

  if (currentStatus) {
    const normalizedCurrent = normalizeDeliveryStatus(currentStatus)
    order.deliveryStatus = deliveryStatuses.includes(normalizedCurrent) ? normalizedCurrent : order.deliveryStatus
  }

  order.deliveryStatus = advanceDeliveryStatus(previousDeliveryStatus, order.deliveryStatus)

  syncOrderStatusFromDelivery(order)
}

const autoSyncTrackingIfReady = async (order, { force = false } = {}) => {
  const awbCode = order?.awbCode || order?.trackingId
  if (!awbCode || order.deliveryStatus === 'delivered' || order.orderStatus === 'cancelled') return false

  const lastSync = order.trackingSyncedAt ? new Date(order.trackingSyncedAt).getTime() : 0
  const syncAgeMs = Date.now() - lastSync
  const minimumSyncInterval = Math.max(Number(process.env.TRACKING_SYNC_MIN_INTERVAL_MS || 15000), 5000)
  if (!force && syncAgeMs < minimumSyncInterval) return false

  try {
    const response = await trackShipmentByAWB(awbCode)
    syncTrackingFromShiprocketResponse(order, response)
    const estimateAge = order.estimatedDeliverySyncedAt ? Date.now() - new Date(order.estimatedDeliverySyncedAt).getTime() : Infinity
    if (order.shiprocketOrderId && (!order.estimatedDeliveryDate || estimateAge >= 15 * 60 * 1000)) {
      try {
        const shiprocketOrder = await getShiprocketOrder(order.shiprocketOrderId)
        order.estimatedDeliveryDate = getShiprocketOrderEstimatedDeliveryDate(shiprocketOrder) || order.estimatedDeliveryDate
        order.estimatedDeliverySyncedAt = new Date()
      } catch (estimateError) {
        logger.warn({ error: estimateError.message, orderId: order._id }, 'Shiprocket EDD refresh failed')
      }
    }
    order.trackingSyncedAt = new Date()
    await order.save()
    return true
  } catch (error) {
    logger.error({ error: error.message, orderId: order._id, awbCode }, 'Automatic Shiprocket tracking sync failed')
    return false
  }
}

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
            paymentStatus: 'pending',
            orderStatus: 'placed',
          },
        ],
        { session },
      )

      if (paymentMethod === 'COD') {
        await markCouponUsed(createdOrder, session)
        await createdOrder.save({ session })
        cart.items = []
        cart.cartTotal = 0
        await cart.save({ session })
      }

      order = createdOrder
    })

    const populatedOrder = await populateOrder(Order.findById(order._id))

    await notifyOrderEvent({
      user: populatedOrder.user,
      order: populatedOrder,
      type: 'order_placed',
    }).catch((error) => {
      logger.error({ error: error.message, orderId: order._id }, 'Unable to send order invoice email')
    })

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

  await autoSyncTrackingIfReady(order)

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

      if (!cancellableStatuses.includes(order.orderStatus) || !cancellableDeliveryStatuses.includes(order.deliveryStatus || 'placed')) {
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
  trackingSyncedAt: order.trackingSyncedAt,
})

const getOrderTracking = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user._id }

  const order = await Order.findOne(filter).select(
    'orderNumber orderStatus trackingId awbCode shiprocketOrderId shiprocketShipmentId courierName trackingUrl labelUrl pickupStatus shipmentStatus estimatedDeliveryDate deliveryStatus trackingHistory trackingSyncedAt',
  )

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  await autoSyncTrackingIfReady(order)

  res.status(200).json({
    success: true,
    tracking: getTrackingPayload(order),
  })
})

const downloadInvoice = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user._id }

  const order = await populateOrder(Order.findOne(filter))

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  const pdf = await buildInvoicePdf(order)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${order.orderNumber}-invoice.pdf"`)
  res.setHeader('Content-Length', pdf.length)
  res.status(200).send(pdf)
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
    } else if (['picked_up', 'shipped', 'in_transit'].includes(updates.deliveryStatus)) {
      order.orderStatus = 'shipped'
    } else if (updates.deliveryStatus === 'out_for_delivery') {
      order.orderStatus = 'out_for_delivery'
    }
  }

  await order.save()
  const populatedOrder = await populateOrder(Order.findById(order._id))

  if (updates.deliveryStatus) {
    await notifyOrderEvent({
      user: populatedOrder.user,
      order: populatedOrder,
      type: updates.deliveryStatus === 'delivered'
        ? 'order_delivered'
        : 'order_tracking_update',
      metadata: { trackingId: order.trackingId },
    }).catch((error) => {
      logger.error({ error: error.message, orderId: order._id }, 'Unable to send tracking email')
    })
  }

  res.status(200).json({
    success: true,
    message: 'Delivery tracking updated successfully.',
    tracking: getTrackingPayload(order),
    order: populatedOrder,
  })
})

module.exports = {
  cancelOrder,
  createOrder,
  downloadInvoice,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrderTracking,
  updateOrderStatus,
  updateDeliveryTracking,
}
