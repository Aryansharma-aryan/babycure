const Order = require('../models/Order')
const ReturnRequest = require('../models/ReturnRequest')
const {
  assignAWB,
  createShiprocketOrder,
  generateLabel,
  schedulePickup,
  trackShipmentByAWB,
} = require('../services/shiprocket.service')
const { notifyUser } = require('../services/notificationService')
const { notifyOrderEvent } = require('../services/orderNotificationService')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const shiprocketStatusMap = {
  shipped: 'shipped',
  'in transit': 'in_transit',
  'out for delivery': 'out_for_delivery',
  delivered: 'delivered',
  returned: 'returned',
  rto: 'returned',
  cancelled: 'failed',
  failed: 'failed',
}

const populateOrder = (query) =>
  query
    .populate('user', 'name email phone')
    .populate('shippingAddress')
    .populate('orderItems.product', 'name slug images price sku')

const extractFirst = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const getShiprocketData = (response) => {
  const data = response.response?.data || response.data || response
  return Array.isArray(data) ? data[0] || {} : data
}

const normalizeDeliveryStatus = (status = '') => {
  const value = String(status).trim().toLowerCase().replace(/_/g, ' ')
  return shiprocketStatusMap[value] || value.replace(/\s+/g, '_') || 'processing'
}

const syncOrderStatus = (order) => {
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

  if (['shipped', 'in_transit'].includes(order.deliveryStatus)) {
    order.orderStatus = 'shipped'
    return
  }

  if (['processing', 'packed'].includes(order.deliveryStatus)) {
    order.orderStatus = 'processing'
  }
}

const pushTrackingHistory = (order, update = {}) => {
  const status = normalizeDeliveryStatus(update.status || update.current_status || update.shipment_status)
  const supported = ['placed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed']
  const safeStatus = supported.includes(status) ? status : 'processing'
  const updatedAt = update.updatedAt || update.updated_at || update.date || update.activity_date || new Date()
  const last = order.trackingHistory[order.trackingHistory.length - 1]

  if (last && last.status === safeStatus && String(last.updatedAt) === String(new Date(updatedAt))) {
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

const returnStatusMap = {
  shipped: 'picked_up',
  'in transit': 'picked_up',
  'out for delivery': 'picked_up',
  delivered: 'received_by_seller',
  returned: 'received_by_seller',
  rto: 'received_by_seller',
}

const replacementStatusMap = {
  shipped: 'replacement_shipped',
  'in transit': 'replacement_shipped',
  'out for delivery': 'replacement_shipped',
  delivered: 'replacement_delivered',
}

const normalizeRequestShipmentStatus = (status = '', type = 'return') => {
  const value = String(status).trim().toLowerCase().replace(/_/g, ' ')
  const map = type === 'replacement' ? replacementStatusMap : returnStatusMap
  return map[value] || (type === 'replacement' ? 'replacement_shipped' : 'picked_up')
}

const pushRequestHistory = (request, status, body = {}) => {
  const last = request.statusHistory[request.statusHistory.length - 1]
  const updatedAt = body.updated_at || body.status_date || new Date()

  if (last && last.status === status && String(last.updatedAt) === String(new Date(updatedAt))) {
    return
  }

  request.status = status
  request.statusHistory.push({
    status,
    message: body.message || body.activity || body.current_status || body.status || `Shipment ${status.replace(/_/g, ' ')}`,
    location: body.location || body.current_location,
    updatedAt,
  })
}

const getOrderForShipment = async (orderId) => {
  const order = await populateOrder(Order.findById(orderId))

  if (!order) {
    throw new AppError('Order not found.', 404)
  }

  return order
}

const getShipmentId = (order) => {
  if (!order.shiprocketShipmentId) {
    throw new AppError('Create a Shiprocket shipment first.', 400)
  }

  return order.shiprocketShipmentId
}

const getTrackingPayload = (order) => ({
  shiprocketOrderId: order.shiprocketOrderId,
  shiprocketShipmentId: order.shiprocketShipmentId,
  awbCode: order.awbCode,
  courierName: order.courierName,
  trackingUrl: order.trackingUrl,
  labelUrl: order.labelUrl,
  pickupStatus: order.pickupStatus,
  shipmentStatus: order.shipmentStatus,
  deliveryStatus: order.deliveryStatus,
  estimatedDeliveryDate: order.estimatedDeliveryDate,
  trackingHistory: order.trackingHistory,
})

const createShipment = asyncHandler(async (req, res) => {
  const order = await getOrderForShipment(req.params.orderId)

  if (order.shiprocketShipmentId) {
    throw new AppError('Shiprocket shipment already exists for this order.', 409)
  }

  const response = await createShiprocketOrder(order)
  const data = getShiprocketData(response)

  order.shiprocketOrderId = String(extractFirst(
    data.order_id,
    data.shiprocket_order_id,
    data.channel_order_id,
    response.order_id,
    response.shiprocket_order_id,
    response.order?.id,
  ) || '')
  order.shiprocketShipmentId = String(extractFirst(
    data.shipment_id,
    data.shiprocket_shipment_id,
    data.shipment?.id,
    response.shipment_id,
    response.shipment?.id,
  ) || '')

  if (!order.shiprocketShipmentId) {
    const message = extractFirst(data.message, response.message, data.error, response.error)
    throw new AppError(message || 'Shiprocket did not return a shipment ID.', 502)
  }

  order.shipmentStatus = extractFirst(data.status, response.status, 'Created')
  order.deliveryStatus = 'processing'
  pushTrackingHistory(order, {
    status: 'processing',
    message: 'Shipment created in Shiprocket.',
    location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Pickup location',
  })
  syncOrderStatus(order)
  await order.save()

  res.status(201).json({
    success: true,
    message: 'Shiprocket shipment created successfully.',
    order: await populateOrder(Order.findById(order._id)),
    shiprocket: response,
  })
})

const assignAwbToOrder = asyncHandler(async (req, res) => {
  const order = await getOrderForShipment(req.params.orderId)
  const response = await assignAWB(getShipmentId(order))
  const data = response.response?.data || response.data || response

  if (response.awb_assign_status === 0 || data.awb_assign_error) {
    throw new AppError(data.awb_assign_error || response.message || 'Shiprocket could not assign an AWB.', 400)
  }

  order.awbCode = String(extractFirst(data.awb_code, data.awb, data.awbCode, order.awbCode) || '')

  if (!order.awbCode) {
    throw new AppError('Shiprocket did not return an AWB number.', 502)
  }

  order.trackingId = order.awbCode || order.trackingId
  order.courierName = extractFirst(data.courier_name, data.courier_company_id, data.assigned_courier_name, order.courierName)
  order.trackingUrl = extractFirst(data.tracking_url, data.track_url, order.trackingUrl)
  order.shipmentStatus = extractFirst(data.status, response.message, order.shipmentStatus)
  order.deliveryStatus = order.deliveryStatus === 'placed' ? 'processing' : order.deliveryStatus
  pushTrackingHistory(order, {
    status: order.deliveryStatus,
    message: `AWB assigned${order.courierName ? ` with ${order.courierName}` : ''}.`,
  })
  await order.save()

  res.status(200).json({
    success: true,
    message: 'AWB assigned successfully.',
    order: await populateOrder(Order.findById(order._id)),
    shiprocket: response,
  })
})

const generateOrderLabel = asyncHandler(async (req, res) => {
  const order = await getOrderForShipment(req.params.orderId)
  const response = await generateLabel(getShipmentId(order))
  const data = response.response?.data || response.data || response

  order.labelUrl = extractFirst(data.label_url, data.labelUrl, response.label_url, response.labelUrl)

  if (!order.labelUrl) {
    throw new AppError('Shiprocket did not return a label URL.', 502)
  }

  order.shipmentStatus = extractFirst(response.message, data.status, order.shipmentStatus)
  await order.save()

  res.status(200).json({
    success: true,
    message: 'Shipping label generated successfully.',
    order: await populateOrder(Order.findById(order._id)),
    shiprocket: response,
  })
})

const scheduleOrderPickup = asyncHandler(async (req, res) => {
  const order = await getOrderForShipment(req.params.orderId)
  const response = await schedulePickup(getShipmentId(order))

  order.pickupStatus = extractFirst(response.pickup_status, response.status, response.message, 'Requested')
  order.shipmentStatus = extractFirst(response.shipment_status, response.status, order.shipmentStatus)
  pushTrackingHistory(order, {
    status: order.deliveryStatus === 'placed' ? 'processing' : order.deliveryStatus,
    message: 'Pickup requested with Shiprocket.',
    location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Pickup location',
  })
  syncOrderStatus(order)
  await order.save()

  res.status(200).json({
    success: true,
    message: 'Pickup scheduled successfully.',
    order: await populateOrder(Order.findById(order._id)),
    shiprocket: response,
  })
})

const syncTrackingFromShiprocket = (order, response) => {
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

  syncOrderStatus(order)
}

const trackOrder = asyncHandler(async (req, res) => {
  const order = await getOrderForShipment(req.params.orderId)

  if (!order.awbCode) {
    throw new AppError('AWB is not assigned for this order yet.', 400)
  }

  const response = await trackShipmentByAWB(order.awbCode)
  syncTrackingFromShiprocket(order, response)
  await order.save()
  const populatedOrder = await populateOrder(Order.findById(order._id))

  notifyOrderEvent({
    user: populatedOrder.user,
    order: populatedOrder,
    type: order.deliveryStatus === 'delivered' ? 'order_delivered' : 'order_tracking_update',
    metadata: { trackingId: order.awbCode || order.trackingId, source: 'shiprocket_manual_sync' },
  }).catch(() => {})

  res.status(200).json({
    success: true,
    message: 'Tracking synced successfully.',
    tracking: getTrackingPayload(order),
    order: populatedOrder,
    shiprocket: response,
  })
})

const shiprocketWebhook = asyncHandler(async (req, res) => {
  const token = process.env.SHIPROCKET_WEBHOOK_TOKEN
  if (token && req.get('x-shiprocket-webhook-token') !== token) {
    throw new AppError('Invalid Shiprocket webhook token.', 401)
  }

  const body = req.body || {}
  const awbCode = extractFirst(body.awb, body.awb_code, body.awbCode)
  const shipmentId = extractFirst(body.shipment_id, body.shipmentId)

  if (!awbCode && !shipmentId) {
    throw new AppError('Shiprocket webhook must include AWB or shipment ID.', 400)
  }

  const order = await Order.findOne({
    $or: [
      ...(awbCode ? [{ awbCode: String(awbCode) }, { trackingId: String(awbCode) }] : []),
      ...(shipmentId ? [{ shiprocketShipmentId: String(shipmentId) }] : []),
    ],
  })

  if (!order) {
    const request = await ReturnRequest.findOne({
      $or: [
        ...(awbCode ? [{ returnAwbCode: String(awbCode) }, { replacementAwbCode: String(awbCode) }] : []),
        ...(shipmentId ? [{ returnShiprocketShipmentId: String(shipmentId) }, { replacementShipmentId: String(shipmentId) }] : []),
      ],
    }).populate('user', 'name email phone')

    if (!request) {
      throw new AppError('Order or return request not found for Shiprocket webhook.', 404)
    }

    const isReplacementShipment = Boolean(
      (awbCode && String(request.replacementAwbCode || '') === String(awbCode)) ||
      (shipmentId && String(request.replacementShipmentId || '') === String(shipmentId)),
    )
    const status = normalizeRequestShipmentStatus(body.current_status || body.shipment_status || body.status, isReplacementShipment ? 'replacement' : 'return')

    if (isReplacementShipment) {
      request.replacementAwbCode = String(awbCode || request.replacementAwbCode || '')
      request.replacementCourierName = extractFirst(body.courier_name, body.courier, request.replacementCourierName)
      request.replacementTrackingUrl = extractFirst(body.tracking_url, body.track_url, request.replacementTrackingUrl)
      request.replacementShipmentStatus = extractFirst(body.current_status, body.shipment_status, body.status, request.replacementShipmentStatus)
    } else {
      request.returnAwbCode = String(awbCode || request.returnAwbCode || '')
      request.returnCourierName = extractFirst(body.courier_name, body.courier, request.returnCourierName)
      request.returnTrackingUrl = extractFirst(body.tracking_url, body.track_url, request.returnTrackingUrl)
      request.returnShipmentStatus = extractFirst(body.current_status, body.shipment_status, body.status, request.returnShipmentStatus)
    }

    pushRequestHistory(request, status, body)
    await request.save()

    notifyUser({
      userId: request.user?._id || request.user,
      type: 'return_tracking_update',
      title: `${isReplacementShipment ? 'Replacement' : 'Return'} tracking updated`,
      message: `${request.requestNumber} is now ${status.replace(/_/g, ' ')}.`,
      metadata: { requestId: request._id, awbCode: awbCode || request.returnAwbCode || request.replacementAwbCode },
    }).catch(() => {})

    return res.status(200).json({
      success: true,
      message: 'Shiprocket return/replacement webhook processed.',
    })
  }

  order.awbCode = String(awbCode || order.awbCode || '')
  order.trackingId = order.awbCode || order.trackingId
  order.courierName = extractFirst(body.courier_name, body.courier, order.courierName)
  order.trackingUrl = extractFirst(body.tracking_url, body.track_url, order.trackingUrl)
  order.shipmentStatus = extractFirst(body.current_status, body.shipment_status, body.status, order.shipmentStatus)
  order.estimatedDeliveryDate = extractFirst(body.edd, body.etd, body.expected_delivery_date, order.estimatedDeliveryDate)
  order.deliveryStatus = pushTrackingHistory(order, {
    status: body.current_status || body.shipment_status || body.status,
    message: body.message || body.activity || body.current_status || body.status,
    location: body.location || body.current_location,
    updatedAt: body.updated_at || body.status_date || new Date(),
  })
  syncOrderStatus(order)
  await order.save()

  const populatedOrder = await populateOrder(Order.findById(order._id))
  const notificationType = order.deliveryStatus === 'delivered'
    ? 'order_delivered'
    : ['shipped', 'in_transit'].includes(order.deliveryStatus)
      ? 'order_shipped'
      : 'order_tracking_update'

  notifyOrderEvent({
    user: populatedOrder.user,
    order: populatedOrder,
    type: notificationType,
    metadata: { trackingId: order.awbCode || order.trackingId, source: 'shiprocket_webhook' },
  }).catch(() => {})

  res.status(200).json({
    success: true,
    message: 'Shiprocket webhook processed.',
  })
})

module.exports = {
  assignAwbToOrder,
  createShipment,
  generateOrderLabel,
  scheduleOrderPickup,
  shiprocketWebhook,
  trackOrder,
}
