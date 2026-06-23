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

const createShiprocketOrder = async (order) => {
  const payload = buildShiprocketOrderPayload(order)
  return shiprocketFetch('/orders/create/adhoc', {
    method: 'POST',
    body: payload,
  })
}

const assignAWB = async (shipmentId) =>
  shiprocketFetch('/courier/assign/awb', {
    method: 'POST',
    body: { shipment_id: shipmentId },
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

module.exports = {
  assignAWB,
  createShiprocketOrder,
  generateLabel,
  loginToShiprocket,
  schedulePickup,
  trackShipmentByAWB,
}
