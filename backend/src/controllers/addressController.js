const Address = require('../models/Address')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { isValidPhone, normalizePhone } = require('../utils/phone')

const postalCodeRegex = /^\d{6}$/
const allowedFields = [
  'fullName',
  'phone',
  'alternatePhone',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'landmark',
  'addressType',
  'isDefault',
]

const buildAddressPayload = (body) => {
  const payload = {}

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field]
    }
  })

  if (payload.phone) payload.phone = normalizePhone(payload.phone)
  if (payload.alternatePhone) payload.alternatePhone = normalizePhone(payload.alternatePhone)

  return payload
}

const validateAddressPayload = (payload, partial = false) => {
  const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode']

  if (!partial) {
    const missingField = requiredFields.find((field) => !payload[field])
    if (missingField) {
      throw new AppError('Please provide all required address fields.', 400)
    }
  }

  if (payload.phone && !isValidPhone(payload.phone)) {
    throw new AppError('Please provide a valid phone number.', 400)
  }

  if (payload.alternatePhone && !isValidPhone(payload.alternatePhone)) {
    throw new AppError('Please provide a valid alternate phone number.', 400)
  }

  if (payload.postalCode && !postalCodeRegex.test(String(payload.postalCode))) {
    throw new AppError('Please provide a valid 6 digit postal code.', 400)
  }
}

const createAddress = asyncHandler(async (req, res) => {
  const payload = buildAddressPayload(req.body)
  validateAddressPayload(payload)

  if (payload.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false })
  }

  const address = await Address.create({
    ...payload,
    user: req.user._id,
  })

  res.status(201).json({
    success: true,
    message: 'Address created successfully.',
    address,
  })
})

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 })

  res.status(200).json({
    success: true,
    count: addresses.length,
    addresses,
  })
})

const getAddressById = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id })

  if (!address) {
    throw new AppError('Address not found.', 404)
  }

  res.status(200).json({
    success: true,
    address,
  })
})

const updateAddress = asyncHandler(async (req, res) => {
  const payload = buildAddressPayload(req.body)
  validateAddressPayload(payload, true)

  if (payload.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false })
  }

  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    payload,
    { new: true, runValidators: true },
  )

  if (!address) {
    throw new AppError('Address not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Address updated successfully.',
    address,
  })
})

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id })

  if (!address) {
    throw new AppError('Address not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully.',
  })
})

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id })

  if (!address) {
    throw new AppError('Address not found.', 404)
  }

  await Address.updateMany({ user: req.user._id }, { isDefault: false })
  address.isDefault = true
  await address.save()

  res.status(200).json({
    success: true,
    message: 'Default address updated successfully.',
    address,
  })
})

module.exports = {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  setDefaultAddress,
  updateAddress,
}
