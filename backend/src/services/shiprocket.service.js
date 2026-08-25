const AppError = require('../utils/AppError')

const DEFAULT_BASE_URL = 'https://apiv2.shiprocket.in/v1/external'
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000

let tokenCache = {
  token: null,
  expiresAt: 0,
}

let authFailureCache = {
  message: '',
  retryAfter: 0,
}

const getBaseUrl = () => (process.env.SHIPROCKET_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')

const requireConfig = () => {
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new AppError('Shiprocket credentials are not configured.', 500)
  }
}

const parseResponse = async (response) => {
  const text = await response.text()
  let payload = {}

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch (error) {
      payload = { message: text }
    }
  }

  if (!response.ok) {
    const message = payload.message || payload.error || 'Shiprocket request failed.'
    throw new AppError(message, response.status)
  }

  return payload
}

const shiprocketFetch = async (path, options = {}, retry = true) => {
  const token = options.skipAuth ? null : await loginToShiprocket()
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401 && retry && !options.skipAuth) {
    tokenCache = { token: null, expiresAt: 0 }
    return shiprocketFetch(path, options, false)
  }

  return parseResponse(response)
}

const loginToShiprocket = async () => {
  requireConfig()

  if (authFailureCache.retryAfter > Date.now()) {
    throw new AppError(authFailureCache.message, 429)
  }

  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 60 * 1000) {
    return tokenCache.token
  }

  const response = await fetch(`${getBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  })

  let payload
  try {
    payload = await parseResponse(response)
  } catch (error) {
    const isAuthFailure = [400, 401, 403, 429].includes(error.statusCode || error.status)
    if (isAuthFailure) {
      const message = error.message?.toLowerCase().includes('blocked')
        ? 'Shiprocket API user is blocked because of failed login attempts. Unblock it in Shiprocket API Users, or create a new API user.'
        : error.message

      authFailureCache = {
        message,
        retryAfter: Date.now() + 5 * 60 * 1000,
      }
      throw new AppError(message, error.statusCode || error.status || 429)
    }

    throw error
  }
  const token = payload.token || payload.data?.token

  if (!token) {
    throw new AppError('Shiprocket login did not return a token.', 502)
  }

  authFailureCache = {
    message: '',
    retryAfter: 0,
  }

  tokenCache = {
    token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  }

  return token
}

const getCustomerNameParts = (fullName = 'BabyCure Customer') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || 'BabyCure',
    lastName: parts.slice(1).join(' ') || 'Customer',
  }
}

const getOrderWeight = (order) => {
  const defaultItemWeight = Number(process.env.SHIPROCKET_DEFAULT_ITEM_WEIGHT_KG || 0.25)
  const weight = order.orderItems.reduce((total, item) => total + item.quantity * defaultItemWeight, 0)
  return Math.max(Number(weight.toFixed(2)), 0.1)
}

const getServiceability = async ({ pickupPostcode, deliveryPostcode, weight, cod = false }) => {
  const params = new URLSearchParams({
    pickup_postcode: String(pickupPostcode),
    delivery_postcode: String(deliveryPostcode),
    weight: String(weight),
    cod: cod ? '1' : '0',
  })

  return shiprocketFetch(`/courier/serviceability/?${params.toString()}`)
}

const getCheapestCourier = (response) => {
  const data = response?.data || response?.response?.data || response
  const couriers = data?.available_courier_companies || data?.courier_companies || []

  return couriers
    .filter((courier) => courier?.courier_company_id && Number.isFinite(Number(courier.freight_charge ?? courier.rate)))
    .sort((left, right) => {
      const priceDifference = Number(left.freight_charge ?? left.rate) - Number(right.freight_charge ?? right.rate)
      if (priceDifference !== 0) return priceDifference
      return Number(left.etd ?? left.estimated_delivery_days ?? 999) - Number(right.etd ?? right.estimated_delivery_days ?? 999)
    })[0] || null
}

const getCourierEstimatedDeliveryDate = (courier, from = new Date()) => {
  if (!courier) return null
  const suppliedDate = courier.etd || courier.edd || courier.estimated_delivery_date
  if (suppliedDate) {
    const parsed = new Date(suppliedDate)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const days = Number(courier.estimated_delivery_days || courier.etd_days || courier.delivery_days)
  if (!Number.isFinite(days) || days < 0) return null
  const estimated = new Date(from)
  estimated.setDate(estimated.getDate() + Math.ceil(days))
  return estimated
}

const getShiprocketOrderEstimatedDeliveryDate = (response) => {
  const data = response?.data || response
  const shipment = data?.shipments?.[0] || {}
  const suppliedDate = data?.etd_date || shipment?.edd || shipment?.etd || shipment?.expected_delivery_date
  if (!suppliedDate) return null
  const parsed = new Date(suppliedDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const buildShiprocketOrderPayload = (order) => {
  const address = order.shippingAddress
  const { firstName, lastName } = getCustomerNameParts(address?.fullName || order.user?.name)
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date()
  const subTotal = Number(order.itemsPrice || order.totalPrice || 0)

  if (!address) {
    throw new AppError('Order shipping address is required before creating a shipment.', 400)
  }

  return {
    order_id: order.orderNumber || String(order._id),
    order_date: createdAt.toISOString().slice(0, 10),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: address.addressLine1,
    billing_address_2: [address.addressLine2, address.landmark].filter(Boolean).join(', '),
    billing_city: address.city,
    billing_pincode: address.postalCode,
    billing_state: address.state,
    billing_country: address.country || 'India',
    billing_email: order.user?.email || process.env.SHIPROCKET_FALLBACK_EMAIL || 'support@babycure.in',
    billing_phone: address.phone || order.user?.phone,
    shipping_is_billing: true,
    order_items: order.orderItems.map((item) => ({
      name: item.name,
      sku: item.product?.sku || String(item.product?._id || item.product || item.name).slice(0, 40),
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: subTotal,
    length: Number(process.env.SHIPROCKET_DEFAULT_LENGTH_CM || 20),
    breadth: Number(process.env.SHIPROCKET_DEFAULT_BREADTH_CM || 15),
    height: Number(process.env.SHIPROCKET_DEFAULT_HEIGHT_CM || 10),
    weight: getOrderWeight(order),
  }
}

const buildReturnOrderPayload = (order, request) => {
  const address = order.shippingAddress
  const { firstName, lastName } = getCustomerNameParts(address?.fullName || order.user?.name)

  if (!address) {
    throw new AppError('Order shipping address is required before creating a return pickup.', 400)
  }

  return {
    order_id: request.requestNumber,
    order_date: new Date().toISOString().slice(0, 10),
    channel_id: '',
    pickup_customer_name: firstName,
    pickup_last_name: lastName,
    pickup_address: address.addressLine1,
    pickup_address_2: [address.addressLine2, address.landmark].filter(Boolean).join(', '),
    pickup_city: address.city,
    pickup_state: address.state,
    pickup_country: address.country || 'India',
    pickup_pincode: address.postalCode,
    pickup_email: order.user?.email || process.env.SHIPROCKET_FALLBACK_EMAIL || 'support@babycure.in',
    pickup_phone: address.phone || order.user?.phone,
    shipping_customer_name: process.env.SHIPROCKET_RETURN_NAME || 'Baby Cure',
    shipping_address: process.env.SHIPROCKET_RETURN_ADDRESS || process.env.SHIPROCKET_PICKUP_ADDRESS || address.addressLine1,
    shipping_city: process.env.SHIPROCKET_RETURN_CITY || process.env.SHIPROCKET_PICKUP_CITY || address.city,
    shipping_state: process.env.SHIPROCKET_RETURN_STATE || process.env.SHIPROCKET_PICKUP_STATE || address.state,
    shipping_country: 'India',
    shipping_pincode: process.env.SHIPROCKET_RETURN_PINCODE || process.env.SHIPROCKET_PICKUP_PINCODE || address.postalCode,
    shipping_email: process.env.SHIPROCKET_FALLBACK_EMAIL || 'support@babycure.in',
    shipping_phone: process.env.SHIPROCKET_RETURN_PHONE || address.phone || order.user?.phone,
    order_items: request.items.map((item) => ({
      name: item.name,
      sku: String(item.product).slice(0, 40),
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: 'Prepaid',
    sub_total: request.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    length: Number(process.env.SHIPROCKET_DEFAULT_LENGTH_CM || 20),
    breadth: Number(process.env.SHIPROCKET_DEFAULT_BREADTH_CM || 15),
    height: Number(process.env.SHIPROCKET_DEFAULT_HEIGHT_CM || 10),
    weight: getOrderWeight({ orderItems: request.items }),
  }
}

const createShiprocketOrder = async (order) => {
  const payload = buildShiprocketOrderPayload(order)
  return shiprocketFetch('/orders/create/adhoc', {
    method: 'POST',
    body: payload,
  })
}

const createReturnPickup = async (order, request) => {
  const path = process.env.SHIPROCKET_RETURN_ORDER_PATH || '/orders/create/return'
  return shiprocketFetch(path, {
    method: 'POST',
    body: buildReturnOrderPayload(order, request),
  })
}

const createReplacementShipment = async (order, request) => {
  const sourceOrder = order.toObject?.() || order
  const replacementOrder = {
    ...sourceOrder,
    orderNumber: `${order.orderNumber}-REPL-${request.requestNumber}`,
    orderItems: request.items,
    paymentMethod: 'ONLINE',
    itemsPrice: request.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    totalPrice: 0,
  }

  return createShiprocketOrder(replacementOrder)
}

const assignAWB = async (shipmentId, courierCompanyId) =>
  shiprocketFetch('/courier/assign/awb', {
    method: 'POST',
    body: {
      shipment_id: shipmentId,
      ...(courierCompanyId ? { courier_id: courierCompanyId } : {}),
    },
  })

const generateLabel = async (shipmentId) =>
  shiprocketFetch('/courier/generate/label', {
    method: 'POST',
    body: { shipment_id: [shipmentId] },
  })

const schedulePickup = async (shipmentId) =>
  shiprocketFetch('/courier/generate/pickup', {
    method: 'POST',
    body: { shipment_id: [shipmentId] },
  })

const trackShipmentByAWB = async (awbCode) => shiprocketFetch(`/courier/track/awb/${awbCode}`)
const getShiprocketOrder = async (orderId) => shiprocketFetch(`/orders/show/${orderId}`)

module.exports = {
  assignAWB,
  createReplacementShipment,
  createReturnPickup,
  createShiprocketOrder,
  getCheapestCourier,
  getCourierEstimatedDeliveryDate,
  getOrderWeight,
  getServiceability,
  getShiprocketOrder,
  getShiprocketOrderEstimatedDeliveryDate,
  generateLabel,
  loginToShiprocket,
  schedulePickup,
  trackShipmentByAWB,
}
