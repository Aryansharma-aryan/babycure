const ContactInquiry = require('../models/ContactInquiry')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const createContactInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body

  const inquiry = await ContactInquiry.create({
    name,
    email,
    phone,
    message,
  })

  res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully.',
    inquiry: {
      _id: inquiry._id,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    },
  })
})

const getContactInquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status } = req.query
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
  const filter = status ? { status } : {}

  const [inquiries, total] = await Promise.all([
    ContactInquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    ContactInquiry.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    count: inquiries.length,
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
    inquiries,
  })
})

const updateContactInquiry = asyncHandler(async (req, res) => {
  const { status } = req.body

  if (!['new', 'read', 'closed'].includes(status)) {
    throw new AppError('Valid inquiry status is required.', 400)
  }

  const inquiry = await ContactInquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  )

  if (!inquiry) {
    throw new AppError('Contact inquiry not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Contact inquiry updated successfully.',
    inquiry,
  })
})

const deleteContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id)

  if (!inquiry) {
    throw new AppError('Contact inquiry not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Contact inquiry deleted successfully.',
  })
})

module.exports = {
  createContactInquiry,
  deleteContactInquiry,
  getContactInquiries,
  updateContactInquiry,
}
