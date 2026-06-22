const bcrypt = require('bcryptjs')

const Otp = require('../models/Otp')
const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { getCookieOptions, signToken } = require('../utils/jwt')
const { isValidPhone, normalizePhone } = require('../utils/phone')
const { notifyUser } = require('../services/notificationService')

const sendAuthResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id)

  res.cookie('token', token, getCookieOptions())

  res.status(statusCode).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isBlocked: user.isBlocked,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
    },
  })
}

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name || !email || !phone || !password) {
    throw new AppError('Name, email, phone and password are required.', 400)
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400)
  }

  const normalizedEmail = normalizeEmail(email)
  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409)
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    phone: normalizePhone(phone),
    password,
  })

  notifyUser({
    userId: user._id,
    type: 'email_confirmation',
    title: 'Welcome to BabyCure',
    message: 'Your BabyCure account has been created successfully.',
  }).catch(() => {})

  sendAuthResponse(user, 201, res, 'Account created successfully.')
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400)
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401)
  }

  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Please contact support.', 403)
  }

  sendAuthResponse(user, 200, res, 'Logged in successfully.')
})

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    maxAge: 0,
  })

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  })
})

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      isBlocked: req.user.isBlocked,
      isPhoneVerified: req.user.isPhoneVerified,
      createdAt: req.user.createdAt,
    },
  })
})

const sendPhoneOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body

  if (!isValidPhone(phone)) {
    throw new AppError('Please provide a valid phone number.', 400)
  }

  const normalizedPhone = normalizePhone(phone)
  const otp = generateOtp()
  const otpHash = await bcrypt.hash(otp, 12)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await Otp.deleteMany({
    phone: normalizedPhone,
    purpose: 'phone_signup',
  })

  await Otp.create({
    phone: normalizedPhone,
    otpHash,
    expiresAt,
    purpose: 'phone_signup',
  })

  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    console.log(`BabyCure phone OTP for ${normalizedPhone}: ${otp}`)
  }

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully.',
    ...(isDevelopment ? { devOtp: otp } : {}),
  })
})

const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body

  if (!isValidPhone(phone) || !/^\d{6}$/.test(String(otp || ''))) {
    throw new AppError('Invalid OTP request.', 400)
  }

  const normalizedPhone = normalizePhone(phone)
  const otpRecord = await Otp.findOne({
    phone: normalizedPhone,
    purpose: 'phone_signup',
  }).select('+otpHash')

  if (!otpRecord) {
    throw new AppError('Invalid or expired OTP.', 400)
  }

  if (otpRecord.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: otpRecord._id })
    throw new AppError('Invalid or expired OTP.', 400)
  }

  if (otpRecord.attempts >= 5) {
    await Otp.deleteOne({ _id: otpRecord._id })
    throw new AppError('Invalid or expired OTP.', 400)
  }

  const isMatch = await bcrypt.compare(String(otp), otpRecord.otpHash)

  if (!isMatch) {
    otpRecord.attempts += 1
    await otpRecord.save()
    throw new AppError('Invalid or expired OTP.', 400)
  }

  let user = await User.findOne({ phone: normalizedPhone })

  if (user?.isBlocked) {
    throw new AppError('Unable to login. Please contact support.', 403)
  }

  if (!user) {
    user = await User.create({
      name: 'BabyCure User',
      phone: normalizedPhone,
      isPhoneVerified: true,
    })
  } else if (!user.isPhoneVerified) {
    user.isPhoneVerified = true
    await user.save()
  }

  await Otp.deleteOne({ _id: otpRecord._id })

  sendAuthResponse(user, 200, res, 'Phone verified successfully.')
})

module.exports = {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  sendPhoneOtp,
  verifyPhoneOtp,
}
