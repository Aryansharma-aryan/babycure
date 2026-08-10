const { createNotification } = require('./notificationService')
const { getLogoHtml } = require('./emailService')
const { buildOrderWhatsAppUrl } = require('./whatsappService')
const { buildInvoicePdf } = require('../utils/invoicePdf')

const formatPrice = (value = 0) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatStatus = (value = '') => String(value || 'not_available').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not available')

const orderEventCopy = {
  order_placed: {
    title: 'Order placed successfully',
    message: (order) => `Your order ${order.orderNumber} has been placed.`,
  },
  payment_success: {
    title: 'Payment successful',
    message: (order) => `Payment for order ${order.orderNumber} was successful.`,
  },
  payment_failed: {
    title: 'Payment failed',
    message: (order) => `Payment for order ${order?.orderNumber || 'your checkout'} could not be completed.`,
  },
  order_shipped: {
    title: 'Your order has shipped',
    message: (order) => `Order ${order.orderNumber} is on the way.`,
  },
  order_tracking_update: {
    title: 'Order tracking updated',
    message: (order) => `Order ${order.orderNumber} is now ${formatStatus(order.deliveryStatus || order.shipmentStatus || order.orderStatus)}.`,
  },
  order_delivered: {
    title: 'Order delivered',
    message: (order) => `Order ${order.orderNumber} has been delivered.`,
  },
  refund_completed: {
    title: 'Refund completed',
    message: (order) => `Refund for order ${order.orderNumber} has been completed.`,
  },
}

const getAddress = (order) => order.shippingAddress || {}

const buildOrderText = ({ user, order, message, metadata }) => {
  const address = getAddress(order)
  const itemLines = (order.orderItems || [])
    .map((item) => `- ${item.name} x ${item.quantity} = ${formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}`)
    .join('\n')

  return [
    `Hi ${user?.name || address.fullName || 'there'},`,
    '',
    message,
    '',
    `Order: ${order.orderNumber}`,
    `Order status: ${formatStatus(order.orderStatus)}`,
    `Payment: ${order.paymentMethod || 'ONLINE'} - ${formatStatus(order.paymentStatus)}`,
    order.razorpayPaymentId ? `Razorpay Payment ID: ${order.razorpayPaymentId}` : '',
    order.razorpayOrderId ? `Razorpay Order ID: ${order.razorpayOrderId}` : '',
    `Total: ${formatPrice(order.totalPrice)}`,
    `Placed: ${formatDate(order.createdAt)}`,
    '',
    'Items:',
    itemLines || 'No items available',
    '',
    'Shipping address:',
    `${address.fullName || user?.name || 'Customer'}`,
    `${address.addressLine1 || ''}`,
    `${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}`,
    `Phone: ${address.phone || user?.phone || ''}`,
    '',
    'Tracking:',
    `Courier: ${order.courierName || 'Not assigned yet'}`,
    `AWB / Tracking ID: ${order.awbCode || order.trackingId || metadata.trackingId || 'Not assigned yet'}`,
    `Delivery status: ${formatStatus(order.deliveryStatus || order.shipmentStatus || order.orderStatus)}`,
    `Estimated delivery: ${formatDate(order.estimatedDeliveryDate)}`,
    order.trackingUrl ? `Track online: ${order.trackingUrl}` : '',
    '',
    'Invoice PDF is attached.',
    'Team BabyCure',
  ].filter((line) => line !== '').join('\n')
}

const buildOrderHtml = ({ user, order, title, message, metadata }) => {
  const address = getAddress(order)
  const itemRows = (order.orderItems || []).map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #E8F5FC">${item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #E8F5FC;text-align:center">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #E8F5FC;text-align:right">${formatPrice(item.price)}</td>
      <td style="padding:10px;border-bottom:1px solid #E8F5FC;text-align:right">${formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17324D;padding:20px;background:#F7FCFF">
      <div style="max-width:720px;margin:auto;background:#FFFFFF;border:1px solid #DCEFF8;border-radius:14px;padding:22px">
        ${getLogoHtml()}
        <h2 style="color:#4AA6D9;margin:0 0 12px">${title}</h2>
        <p>Hello ${user?.name || address.fullName || 'there'},</p>
        <p>${message}</p>

        <h3 style="margin:24px 0 8px;color:#17324D">Order Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748B">Order</td><td style="padding:6px 0;text-align:right;font-weight:700">${order.orderNumber}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Order Status</td><td style="padding:6px 0;text-align:right">${formatStatus(order.orderStatus)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Payment</td><td style="padding:6px 0;text-align:right">${order.paymentMethod || 'ONLINE'} - ${formatStatus(order.paymentStatus)}</td></tr>
          ${order.razorpayPaymentId ? `<tr><td style="padding:6px 0;color:#64748B">Razorpay Payment ID</td><td style="padding:6px 0;text-align:right">${order.razorpayPaymentId}</td></tr>` : ''}
          ${order.razorpayOrderId ? `<tr><td style="padding:6px 0;color:#64748B">Razorpay Order ID</td><td style="padding:6px 0;text-align:right">${order.razorpayOrderId}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#64748B">Placed</td><td style="padding:6px 0;text-align:right">${formatDate(order.createdAt)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Total</td><td style="padding:6px 0;text-align:right;font-weight:800;color:#4AA6D9">${formatPrice(order.totalPrice)}</td></tr>
        </table>

        <h3 style="margin:24px 0 8px;color:#17324D">Items</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#F3FBFF">
              <th style="padding:10px;text-align:left">Product</th>
              <th style="padding:10px;text-align:center">Qty</th>
              <th style="padding:10px;text-align:right">Price</th>
              <th style="padding:10px;text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <h3 style="margin:24px 0 8px;color:#17324D">Shipping Address</h3>
        <p style="margin:0;color:#475569">
          <strong>${address.fullName || user?.name || 'Customer'}</strong><br>
          ${address.addressLine1 || ''}<br>
          ${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}<br>
          Phone: ${address.phone || user?.phone || ''}
        </p>

        <h3 style="margin:24px 0 8px;color:#17324D">Tracking Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748B">Courier</td><td style="padding:6px 0;text-align:right">${order.courierName || 'Not assigned yet'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">AWB / Tracking ID</td><td style="padding:6px 0;text-align:right">${order.awbCode || order.trackingId || metadata.trackingId || 'Not assigned yet'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Delivery Status</td><td style="padding:6px 0;text-align:right">${formatStatus(order.deliveryStatus || order.shipmentStatus || order.orderStatus)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B">Estimated Delivery</td><td style="padding:6px 0;text-align:right">${formatDate(order.estimatedDeliveryDate)}</td></tr>
        </table>
        ${order.trackingUrl ? `<p><a href="${order.trackingUrl}" style="display:inline-block;margin-top:14px;background:#4AA6D9;color:white;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:700">Track Shipment</a></p>` : ''}
        <p style="margin-top:24px;color:#64748B">Invoice PDF is attached with this email.</p>
        <p style="margin-top:24px">Team BabyCure</p>
      </div>
    </div>
  `
}

const notifyOrderEvent = async ({ user, order, type, metadata = {} }) => {
  const copy = orderEventCopy[type] || orderEventCopy.order_placed
  const title = copy.title
  const message = copy.message(order)
  const whatsappUrl = buildOrderWhatsAppUrl({ user, order, title, message })
  const invoicePdf = await buildInvoicePdf(order)

  return createNotification({
    user: user?._id || order.user,
    type,
    title,
    message,
    metadata: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      whatsappUrl,
      ...metadata,
    },
    email: user?.email
      ? {
          to: user.email,
          subject: title,
          text: buildOrderText({ user, order, message, metadata }),
          html: buildOrderHtml({ user, order, title, message, metadata }),
          attachments: [
            {
              filename: `${order.orderNumber}-invoice.pdf`,
              content: invoicePdf,
              contentType: 'application/pdf',
            },
          ],
        }
      : undefined,
  })
}

module.exports = {
  notifyOrderEvent,
}
