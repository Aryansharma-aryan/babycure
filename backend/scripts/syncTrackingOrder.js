require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
require('../src/models/Address')
const Order = require('../src/models/Order')
const { syncTrackingFromShiprocket } = require('../src/controllers/shiprocketController')
const {
  getCheapestCourier,
  getCourierEstimatedDeliveryDate,
  getOrderWeight,
  getServiceability,
  getShiprocketOrder,
  trackShipmentByAWB,
} = require('../src/services/shiprocket.service')

const orderId = process.argv[2]

async function run() {
  if (!mongoose.isValidObjectId(orderId)) throw new Error('A valid order ID is required.')
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  const order = await Order.findById(orderId).populate('shippingAddress')
  if (!order) throw new Error('Order not found.')
  const awb = order.awbCode || order.trackingId
  if (!awb) throw new Error('Order does not have an AWB.')
  const response = await trackShipmentByAWB(awb)
  syncTrackingFromShiprocket(order, response)
  let estimateDetails
  let pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE
  if (!pickupPostcode && order.shiprocketOrderId) {
    const shiprocketOrder = await getShiprocketOrder(order.shiprocketOrderId)
    const orderData = shiprocketOrder?.data || shiprocketOrder
    const shipment = orderData?.shipments?.[0]
    pickupPostcode = shipment?.pickup_postcode
      || shipment?.pickup_location?.pin_code
      || shipment?.pickup_location?.pincode
      || orderData?.pickup_address?.pin_code
      || orderData?.pickup_address?.pincode
      || orderData?.pickup_address?.pin
    const shiprocketEtd = orderData?.etd_date || shipment?.edd || shipment?.etd
    if (shiprocketEtd) {
      const parsedEtd = new Date(shiprocketEtd)
      if (!Number.isNaN(parsedEtd.getTime())) order.estimatedDeliveryDate = parsedEtd
    }
    estimateDetails = {
      pickupPostcode,
      shiprocketEtd,
      topLevelFields: Object.keys(shiprocketOrder || {}),
      dataFields: Object.keys(shiprocketOrder?.data || {}),
      shipmentFields: shipment && Object.keys(shipment).filter((key) => /pickup|edd|etd|deliver/i.test(key)),
    }
  }
  if (!order.estimatedDeliveryDate && pickupPostcode && order.shippingAddress?.postalCode) {
    const serviceability = await getServiceability({
      pickupPostcode,
      deliveryPostcode: order.shippingAddress.postalCode,
      weight: getOrderWeight(order),
      cod: order.paymentMethod === 'COD',
    })
    const data = serviceability?.data || serviceability?.response?.data || serviceability
    const couriers = data?.available_courier_companies || data?.courier_companies || []
    const assignedCourier = couriers.find((courier) => String(courier.courier_name || '').toLowerCase() === String(order.courierName || '').toLowerCase())
      || getCheapestCourier(serviceability)
    estimateDetails = assignedCourier && {
      courierName: assignedCourier.courier_name,
      etd: assignedCourier.etd,
      estimatedDeliveryDays: assignedCourier.estimated_delivery_days,
      deliveryDays: assignedCourier.delivery_days,
    }
    order.estimatedDeliveryDate = getCourierEstimatedDeliveryDate(assignedCourier)
  }
  order.trackingSyncedAt = new Date()
  await order.save()
  console.log(JSON.stringify({
    orderId: order.id,
    awb,
    courierName: order.courierName,
    deliveryStatus: order.deliveryStatus,
    orderStatus: order.orderStatus,
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    estimateDetails,
  }))
}

run()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
