const phoneRegex = /^[6-9]\d{9}$/

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '').slice(-10)

const isValidPhone = (phone = '') => phoneRegex.test(normalizePhone(phone))

module.exports = {
  isValidPhone,
  normalizePhone,
}
