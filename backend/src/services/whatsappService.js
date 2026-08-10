const normalizeIndianPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '').slice(-10)
  return digits.length === 10 ? `91${digits}` : ''
}

const buildWhatsAppUrl = ({ phone, message }) => {
  const normalizedPhone = normalizeIndianPhone(phone)
  if (!normalizedPhone || !message) return ''
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}

const buildOrderWhatsAppUrl = ({ user, order, title, message }) => buildWhatsAppUrl({
  phone: user?.phone || order?.shippingAddress?.phone,
  message: [
    `Hi ${user?.name || order?.shippingAddress?.fullName || 'there'},`,
    message,
    order?.orderNumber ? `Order: ${order.orderNumber}` : '',
    order?.trackingUrl ? `Track: ${order.trackingUrl}` : '',
    'Team BabyCure',
  ].filter(Boolean).join('\n'),
})

module.exports = {
  buildOrderWhatsAppUrl,
  buildWhatsAppUrl,
}
