const mongoose = require('mongoose')
const Order = require('../models/Order')
const ReturnRequest = require('../models/ReturnRequest')
const {
  assignAWB,
  createReplacementShipment,
  createReturnPickup,
  trackShipmentByAWB,
} = require('../services/shiprocket.service')
const { refundRazorpayPayment } = require('./paymentController')
const { notifyUser } = require('../services/notificationService')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const returnStatuses = ReturnRequest.statuses

const requestPopulate = (query) =>
  query
    .populate('user', 'name email phone')
    .populate({
      path: 'order',
      populate: [
        { path: 'shippingAddress' },
        { path: 'user', select: 'name email phone' },
        { path: 'orderItems.product', select: 'name sku images price' },
      ],
    })
    .populate('items.product', 'name sku images price')

const generateRequestNumber = (type) => {
  const prefix = type === 'replacement' ? 'REP' : 'RET'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BC-${prefix}-${timestamp}-${random}`
}

const pushHistory = (request, status, message, userId, location) => {
  request.status = status
  request.statusHistory.push({
    status,
    message,
    location,
    updatedBy: userId,
    updatedAt: new Date(),
  })
  if (status === 'closed') request.closedAt = new Date()
}

const findFirstValue = (source, keys) => {
  if (!source || typeof source !== 'object') return ''

  for (const key of keys) {
    if (source[key]) return source[key]
  }

  for (const value of Object.values(source)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findFirstValue(item, keys)
        if (found) return found
      }
    } else if (value && typeof value === 'object') {
      const found = findFirstValue(value, keys)
      if (found) return found
    }
  }

  return ''
}

const applyReturnShipmentData = (request, payload = {}) => {
  request.returnShiprocketOrderId = String(findFirstValue(payload, ['order_id', 'shiprocket_order_id']) || request.returnShiprocketOrderId || '')
  request.returnShiprocketShipmentId = String(findFirstValue(payload, ['shipment_id', 'shiprocket_shipment_id']) || request.returnShiprocketShipmentId || '')
  request.returnAwbCode = String(findFirstValue(payload, ['awb_code', 'awb', 'awb_number']) || request.returnAwbCode || '')
  request.returnCourierName = findFirstValue(payload, ['courier_name', 'assigned_courier_name', 'courier_company_name']) || request.returnCourierName
  request.returnTrackingUrl = findFirstValue(payload, ['tracking_url', 'track_url']) || request.returnTrackingUrl
  request.returnPickupStatus = findFirstValue(payload, ['pickup_status', 'pickup_scheduled_date']) || payload.message || request.returnPickupStatus
  request.returnShipmentStatus = findFirstValue(payload, ['current_status', 'shipment_status', 'status']) || request.returnShipmentStatus
}

const getRequest = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid request ID.', 400)
  }

  const request = await requestPopulate(ReturnRequest.findById(id))
  if (!request) throw new AppError('Return or replacement request not found.', 404)
  return request
}

const getUserOrder = async (orderId, userId) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new AppError('Invalid order ID.', 400)
  }

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate('shippingAddress')
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name sku images price')

  if (!order) throw new AppError('Order not found.', 404)
  if (order.orderStatus !== 'delivered' && order.deliveryStatus !== 'delivered') {
    throw new AppError('Return or replacement can be requested only after delivery.', 400)
  }

  return order
}

const normalizeItems = (order, itemIds = []) => {
  const requestedIds = Array.isArray(itemIds) ? itemIds.map(String) : [String(itemIds)].filter(Boolean)
  const allItems = order.orderItems || []
  const chosen = requestedIds.length
    ? allItems.filter((item) => requestedIds.includes(String(item.product?._id || item.product)))
    : allItems

  if (chosen.length === 0) {
    throw new AppError('Select at least one valid product from this order.', 400)
  }

  return chosen.map((item) => ({
    product: item.product?._id || item.product,
    name: item.name,
    image: item.image,
    quantity: item.quantity,
    price: item.price,
  }))
}

const parseItemIds = (value) => {
  if (!value) return undefined
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch (error) {
    return [value]
  }
}

const createRequest = (type) => asyncHandler(async (req, res) => {
  const { reason, details } = req.body
  const itemIds = parseItemIds(req.body.items)

  if (!reason) {
    throw new AppError('Please select a reason.', 400)
  }

  const order = await getUserOrder(req.params.orderId, req.user._id)
  const existing = await ReturnRequest.findOne({
    order: order._id,
    user: req.user._id,
    type,
    status: { $nin: ['rejected', 'closed'] },
  })

  if (existing) {
    throw new AppError(`A ${type} request is already active for this order.`, 409)
  }

  const images = (req.files || []).map((file) => ({
    url: file.path?.startsWith('http') ? file.path : `/uploads/return-requests/${file.filename}`,
    publicId: file.filename,
  }))

  if (['damaged', 'wrong_product', 'missing_items', 'expired_or_defective'].includes(reason) && images.length === 0) {
    throw new AppError('Please upload product/package images for this reason.', 400)
  }

  const request = await ReturnRequest.create({
    requestNumber: generateRequestNumber(type),
    order: order._id,
    user: req.user._id,
    type,
    items: normalizeItems(order, itemIds),
    reason,
    details,
    images,
    statusHistory: [{
      status: 'requested',
      message: `${type === 'return' ? 'Return' : 'Replacement'} request submitted by customer.`,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    }],
  })

  res.status(201).json({
    success: true,
    message: `${type === 'return' ? 'Return' : 'Replacement'} request submitted.`,
    request: await requestPopulate(ReturnRequest.findById(request._id)),
  })
})

const getMyRequests = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id }
  if (req.query.orderId) filter.order = req.query.orderId
  const requests = await requestPopulate(ReturnRequest.find(filter).sort('-createdAt'))
  res.status(200).json({ success: true, requests })
})

const getAllRequests = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.type) filter.type = req.query.type
  const requests = await requestPopulate(ReturnRequest.find(filter).sort('-createdAt'))
  res.status(200).json({ success: true, requests })
})

const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, message, rejectionReason } = req.body
  if (!returnStatuses.includes(status)) {
    throw new AppError('Invalid request status.', 400)
  }

  const request = await getRequest(req.params.id)
  if (status === 'rejected') request.rejectionReason = rejectionReason || message
  pushHistory(request, status, message || `Request ${status.replace(/_/g, ' ')}.`, req.user._id)
  await request.save()

  notifyUser({
    userId: request.user._id || request.user,
    type: 'return_request_update',
    title: `${request.type === 'return' ? 'Return' : 'Replacement'} ${status.replace(/_/g, ' ')}`,
    message: message || `Your ${request.type} request is now ${status.replace(/_/g, ' ')}.`,
    metadata: { requestId: request._id, orderId: request.order?._id || request.order },
  }).catch(() => {})

  res.status(200).json({ success: true, message: 'Request updated.', request })
})

const createReturnPickupForRequest = asyncHandler(async (req, res) => {
  const request = await getRequest(req.params.id)
  if (!['approved', 'pickup_scheduled'].includes(request.status)) {
    throw new AppError('Approve the request before creating return pickup.', 400)
  }

  let response = { message: 'Existing return shipment found.' }

  if (!request.returnShiprocketShipmentId) {
    response = await createReturnPickup(request.order, request)
    applyReturnShipmentData(request, response)
    if (!request.returnPickupStatus) request.returnPickupStatus = 'Requested'
  }

  if (request.returnShiprocketShipmentId && !request.returnAwbCode) {
    const awbResponse = await assignAWB(request.returnShiprocketShipmentId)
    applyReturnShipmentData(request, awbResponse)
  }

  if (!request.returnAwbCode) {
    pushHistory(request, 'pickup_scheduled', 'Return pickup created, AWB is still pending from Shiprocket.', req.user._id)
    await request.save()
    throw new AppError('Return pickup was created, but Shiprocket did not assign an AWB yet. Check courier availability, pickup address, wallet balance, and try Create Return Pickup again.', 502)
  }

  pushHistory(request, 'pickup_scheduled', request.returnAwbCode ? 'Return pickup created and AWB assigned.' : 'Return pickup created with Shiprocket.', req.user._id)
  await request.save()

  res.status(200).json({ success: true, message: 'Return pickup created.', request, shiprocket: response })
})

const trackReturnShipment = asyncHandler(async (req, res) => {
  const request = await getRequest(req.params.id)
  if (!request.returnAwbCode) throw new AppError('Return AWB is not available yet.', 400)
  const response = await trackShipmentByAWB(request.returnAwbCode)
  const data = response.tracking_data || response.data || response.response?.data || response
  const shipment = data.shipment_track?.[0] || data.shipment_track || data

  request.returnCourierName = shipment.courier_name || data.courier_name || request.returnCourierName
  request.returnTrackingUrl = data.track_url || data.tracking_url || shipment.track_url || request.returnTrackingUrl
  request.returnShipmentStatus = shipment.current_status || data.current_status || data.status || request.returnShipmentStatus
  await request.save()
  res.status(200).json({ success: true, message: 'Return tracking synced.', request, shiprocket: response })
})

const initiateRefund = asyncHandler(async (req, res) => {
  const request = await getRequest(req.params.id)
  if (request.type !== 'return') throw new AppError('Refund is available only for return requests.', 400)
  if (request.status !== 'received_by_seller' && request.status !== 'refund_initiated') {
    throw new AppError('Mark product received before initiating refund.', 400)
  }

  const amount = Number(req.body.amount || request.order.totalPrice || 0)
  request.refundAmount = amount

  if (request.order.paymentMethod === 'ONLINE') {
    const refund = await refundRazorpayPayment({
      paymentId: request.order.razorpayPaymentId,
      amount,
      notes: { requestId: request.requestNumber, orderId: request.order.orderNumber },
    })
    request.refundMethod = 'razorpay'
    request.razorpayRefundId = refund.id
    request.order.paymentStatus = 'refunded'
    await request.order.save()
  } else {
    request.refundMethod = req.body.refundMethod || 'manual_upi'
  }

  pushHistory(request, 'refund_initiated', 'Refund initiated.', req.user._id)
  await request.save()
  res.status(200).json({ success: true, message: 'Refund initiated.', request })
})

const createReplacementShipmentForRequest = asyncHandler(async (req, res) => {
  const request = await getRequest(req.params.id)
  if (request.type !== 'replacement') throw new AppError('Replacement shipment is available only for replacement requests.', 400)
  if (request.status !== 'received_by_seller' && request.status !== 'replacement_shipped') {
    throw new AppError('Mark old product received before creating replacement shipment.', 400)
  }

  const response = await createReplacementShipment(request.order, request)
  const data = response.response?.data || response.data || response
  request.replacementOrderId = String(data.order_id || data.shiprocket_order_id || request.replacementOrderId || '')
  request.replacementShipmentId = String(data.shipment_id || data.shiprocket_shipment_id || request.replacementShipmentId || '')

  if (request.replacementShipmentId) {
    const awbResponse = await assignAWB(request.replacementShipmentId)
    const awbData = awbResponse.response?.data || awbResponse.data || awbResponse
    request.replacementAwbCode = String(awbData.awb_code || awbData.awb || request.replacementAwbCode || '')
    request.replacementCourierName = awbData.courier_name || awbData.assigned_courier_name || request.replacementCourierName
    request.replacementTrackingUrl = awbData.tracking_url || awbData.track_url || request.replacementTrackingUrl
    request.replacementShipmentStatus = awbData.status || awbResponse.message || request.replacementShipmentStatus
  }

  pushHistory(request, 'replacement_shipped', 'Replacement shipment created.', req.user._id)
  await request.save()
  res.status(200).json({ success: true, message: 'Replacement shipment created.', request, shiprocket: response })
})

module.exports = {
  approveRequest: (req, res, next) => {
    req.body.status = 'approved'
    return updateRequestStatus(req, res, next)
  },
  closeRequest: (req, res, next) => {
    req.body.status = 'closed'
    return updateRequestStatus(req, res, next)
  },
  createReplacementRequest: createRequest('replacement'),
  createReplacementShipmentForRequest,
  createReturnPickupForRequest,
  createReturnRequest: createRequest('return'),
  getAllRequests,
  getMyRequests,
  initiateRefund,
  rejectRequest: (req, res, next) => {
    req.body.status = 'rejected'
    return updateRequestStatus(req, res, next)
  },
  trackReturnShipment,
  updateRequestStatus,
}
