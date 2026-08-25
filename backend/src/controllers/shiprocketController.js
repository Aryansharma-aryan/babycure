const Order = require('../models/Order')
const ReturnRequest = require('../models/ReturnRequest')
const logger = require('../config/logger')
const {
  assignAWB,
  createShiprocketOrder,
  generateLabel,
  getCheapestCourier,
  getCourierEstimatedDeliveryDate,
  getOrderWeight,
  getServiceability,
  getShiprocketOrder,
  getShiprocketOrderEstimatedDeliveryDate,
  schedulePickup,
  trackShipmentByAWB,
} = require('../services/shiprocket.service')
const { notifyUser } = require('../services/notificationService')
const { notifyOrderEvent } = require('../services/orderNotificationService')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const shiprocketStatusMap = {
  shipped: 'shipped',
  'pickup scheduled': 'pickup_scheduled',
  'pickup requested': 'pickup_scheduled',
  'picked up': 'picked_up',
  'pickup done': 'picked_up',
  'in transit': 'in_transit',
  'out for delivery': 'out_for_delivery',
  delivered: 'delivered',
  returned: 'returned',
  rto: 'returned',
  cancelled: 'failed',
  failed: 'failed',
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
  if (/picked|pickup complete|shipment pickup complete/.test(value)) return 'picked_up'
  if (/pickup (scheduled|requested|booked|queued|generated)|out for pickup/.test(value)) return 'pickup_scheduled'
  if (/out for delivery/.test(value)) return 'out_for_delivery'
  if (/in[ -]?transit|reached.*hub/.test(value)) return 'in_transit'
  return shiprocketStatusMap[value] || value.replace(/\s+/g, '_') || 'processing'
}

const normalizeWebhookStatus = (body = {}) => {
  const label = extractFirst(body.current_status, body.shipment_status, body.status)
  if (label) return normalizeDeliveryStatus(label)

  const currentId = Number(body.current_status_id)
  const shipmentId = Number(body.shipment_status_id)
  if (currentId === 51 || shipmentId === 42) return 'picked_up'
  if ([4, 12, 34].includes(currentId) || [3, 4, 19, 27].includes(shipmentId)) return 'pickup_scheduled'
  if (currentId === 20 || shipmentId === 18) return 'in_transit'
  if (currentId === 19 || shipmentId === 17) return 'out_for_delivery'
  if (currentId === 7 || shipmentId === 7) return 'delivered'
  if (currentId === 6 || shipmentId === 6) return 'shipped'
  return 'processing'
}

const advanceDeliveryStatus = (currentStatus, nextStatus) => {
  if (['returned', 'failed'].includes(nextStatus)) return nextStatus
  const currentRank = deliveryStatusRank[currentStatus] ?? -1
  const nextRank = deliveryStatusRank[nextStatus] ?? -1
  return nextRank >= currentRank ? nextStatus : currentStatus
}

const parseShiprocketTimestamp = (value) => {
  if (!value) return new Date()
  const match = String(value).match(/^(\d{2})[\s-](\d{2})[\s-](\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)
  if (match) {
    const [, day, month, year, hours, minutes, seconds] = match
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
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

  if (['picked_up', 'shipped', 'in_transit'].includes(order.deliveryStatus)) {
    order.orderStatus = 'shipped'
    return
  }

  if (['processing', 'packed', 'pickup_scheduled'].includes(order.deliveryStatus)) {
    order.orderStatus = 'processing'
  }
}

const pushTrackingHistory = (order, update = {}) => {
  const status = normalizeDeliveryStatus(update.status || update.current_status || update.shipment_status)
  const supported = ['placed', 'processing', 'packed', 'pickup_scheduled', 'picked_up', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed']
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

const assignOrderAwb = async (order, courierCompanyId) => {
  const response = await assignAWB(order.shiprocketShipmentId, courierCompanyId)
  const data = response.response?.data || response.data || response

  if (response.awb_assign_status === 0 || data.awb_assign_error) {
    throw new AppError(data.awb_assign_error || response.message || 'Shiprocket could not assign an AWB.', 400)
  }

  order.awbCode = String(extractFirst(data.awb_code, data.awb, data.awbCode, order.awbCode) || '')
  if (!order.awbCode) throw new AppError('Shiprocket did not return an AWB number.', 502)

  order.trackingId = order.awbCode
  order.courierName = extractFirst(data.courier_name, data.assigned_courier_name, order.courierName)
  order.trackingUrl = extractFirst(data.tracking_url, data.track_url, order.trackingUrl)
  order.shipmentStatus = extractFirst(data.status, response.message, order.shipmentStatus)
  order.deliveryStatus = order.deliveryStatus === 'placed' ? 'processing' : order.deliveryStatus
  pushTrackingHistory(order, {
    status: order.deliveryStatus,
    message: `AWB assigned${order.courierName ? ` with ${order.courierName}` : ''}.`,
  })
  return response
}

const scheduleOrderPickupForOrder = async (order) => {
  const response = await schedulePickup(order.shiprocketShipmentId)
  order.pickupStatus = extractFirst(response.pickup_status, response.status, response.message, 'Requested')
  order.shipmentStatus = extractFirst(response.shipment_status, response.status, order.shipmentStatus)
  pushTrackingHistory(order, {
    status: 'pickup_scheduled',
    message: 'Pickup requested with Shiprocket.',
    location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Pickup location',
  })
  order.deliveryStatus = 'pickup_scheduled'
  syncOrderStatus(order)
  return response
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
  if (!['packed', 'pickup_scheduled'].includes(order.deliveryStatus)) order.deliveryStatus = 'processing'
  pushTrackingHistory(order, {
    status: order.deliveryStatus,
    message: 'Shipment created in Shiprocket.',
    location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Pickup location',
  })
  syncOrderStatus(order)
  let autoCourier = null
  let autoPickup = null

  if (process.env.SHIPROCKET_AUTO_PICKUP !== 'false') {
    const weight = Number(getOrderWeight(order).toFixed(2))
    const maxWeight = Number(process.env.SHIPROCKET_AUTO_MAX_WEIGHT_KG || 0.5)
    const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE
    const serviceability = pickupPostcode && weight <= maxWeight
      ? await getServiceability({
        pickupPostcode,
        deliveryPostcode: order.shippingAddress.postalCode,
        weight,
        cod: order.paymentMethod === 'COD',
      })
      : null
    autoCourier = getCheapestCourier(serviceability)
    order.estimatedDeliveryDate = getCourierEstimatedDeliveryDate(autoCourier) || order.estimatedDeliveryDate
    await assignOrderAwb(order, autoCourier?.courier_company_id)
    autoPickup = await scheduleOrderPickupForOrder(order)
  }

  await order.save()
  const populatedOrder = await populateOrder(Order.findById(order._id))

  notifyOrderEvent({
    user: populatedOrder.user,
    order: populatedOrder,
    type: 'order_tracking_update',
    metadata: { trackingId: order.awbCode || order.trackingId, source: 'shiprocket_shipment_created' },
  }).catch(() => {})

  res.status(201).json({
    success: true,
    message: autoPickup ? `Shipment created, ${autoCourier?.courier_name || 'lowest-cost courier'} assigned and pickup requested.` : 'Shiprocket shipment created successfully.',
    order: populatedOrder,
    shiprocket: response,
  })
})

const assignAwbToOrder = asyncHandler(async (req, res) => {
  const order = await getOrderForShipment(req.params.orderId)
  const response = await assignOrderAwb(order)
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
  const response = await scheduleOrderPickupForOrder(order)
  await order.save()

  res.status(200).json({
    success: true,
    message: 'Pickup scheduled successfully.',
    order: await populateOrder(Order.findById(order._id)),
    shiprocket: response,
  })
})

const syncTrackingFromShiprocket = (order, response) => {
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

  // Courier activity arrays are not consistently ordered. The explicit
  // current status is authoritative and prevents the UI moving backwards.
  if (currentStatus) {
    const normalizedCurrent = normalizeDeliveryStatus(currentStatus)
    order.deliveryStatus = ['placed', 'processing', 'packed', 'pickup_scheduled', 'picked_up', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed'].includes(normalizedCurrent)
      ? normalizedCurrent
      : order.deliveryStatus
  }

  order.deliveryStatus = advanceDeliveryStatus(previousDeliveryStatus, order.deliveryStatus)

  syncOrderStatus(order)
}

const trackOrder = asyncHandler(async (req, res) => {
  const order = await getOrderForShipment(req.params.orderId)

  if (!order.awbCode) {
    throw new AppError('AWB is not assigned for this order yet.', 400)
  }

  const response = await trackShipmentByAWB(order.awbCode)
  syncTrackingFromShiprocket(order, response)
  if (order.shiprocketOrderId) {
    try {
      const shiprocketOrder = await getShiprocketOrder(order.shiprocketOrderId)
      order.estimatedDeliveryDate = getShiprocketOrderEstimatedDeliveryDate(shiprocketOrder) || order.estimatedDeliveryDate
      order.estimatedDeliverySyncedAt = new Date()
    } catch (error) {
      // Tracking status is more important than an optional EDD refresh.
    }
  }
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
  const suppliedToken = req.get('x-api-key') || req.get('x-shiprocket-webhook-token')
  if (token && suppliedToken !== token) {
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

  const previousDeliveryStatus = order.deliveryStatus
  order.awbCode = String(awbCode || order.awbCode || '')
  order.trackingId = order.awbCode || order.trackingId
  order.courierName = extractFirst(body.courier_name, body.courier, order.courierName)
  order.trackingUrl = extractFirst(body.tracking_url, body.track_url, order.trackingUrl)
  order.shipmentStatus = extractFirst(body.current_status, body.shipment_status, body.status, order.shipmentStatus)
  order.estimatedDeliveryDate = extractFirst(body.edd, body.etd, body.expected_delivery_date, order.estimatedDeliveryDate)
  const webhookDeliveryStatus = pushTrackingHistory(order, {
    status: normalizeWebhookStatus(body),
    message: body.message || body.activity || body.current_status || body.status,
    location: body.location || body.current_location,
    updatedAt: parseShiprocketTimestamp(body.current_timestamp || body.updated_at || body.status_date),
  })
  order.deliveryStatus = advanceDeliveryStatus(order.deliveryStatus, webhookDeliveryStatus)
  syncOrderStatus(order)
  await order.save()

  const populatedOrder = await populateOrder(Order.findById(order._id))
  const notificationType = order.deliveryStatus === 'delivered'
    ? 'order_delivered'
    : 'order_tracking_update'

  if (order.deliveryStatus !== previousDeliveryStatus) {
    notifyOrderEvent({
      user: populatedOrder.user,
      order: populatedOrder,
      type: notificationType,
      metadata: { trackingId: order.awbCode || order.trackingId, source: 'shiprocket_webhook' },
    }).catch((error) => {
      logger.error({ error: error.message, orderId: order._id }, 'Unable to send Shiprocket tracking email')
    })
  }

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
  syncTrackingFromShiprocket,
}
