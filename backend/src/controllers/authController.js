const bcrypt = require('bcryptjs')
const { randomInt } = require('crypto')

const Otp = require('../models/Otp')
const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { AUTH_COOKIE_NAME, getCookieOptions } = require('../utils/jwt')
const { createSession, hashSession } = require('../utils/session')
const Session = require('../models/Session')
const Address = require('../models/Address')
const { isValidPhone, normalizePhone } = require('../utils/phone')
const { notifyUser } = require('../services/notificationService')
const logger = require('../config/logger')
const { getLogoAttachment, getLogoHtml, sendEmail } = require('../services/emailService')

const sendAuthResponse = async (user, statusCode, res, message) => {
  await createSession(user._id, res)
  const address = await Address.findOne({ user: user._id }).sort({ isDefault: -1, createdAt: -1 })

  res.status(statusCode).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: address?.fullName || user.name,
      email: user.email,
      phone: address?.phone || user.phone,
      role: user.role,
      isBlocked: user.isBlocked,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
    },
  })
}

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const generateOtp = () => String(randomInt(100000, 1000000))

const isValidEmail = (email = '') => /^\S+@\S+\.\S+$/.test(String(email).trim())

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

  await sendAuthResponse(user, 201, res, 'Account created successfully.')
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

  await sendAuthResponse(user, 200, res, 'Logged in successfully.')
})

const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME]
  if (token?.startsWith('s_')) await Session.deleteOne({ tokenHash: hashSession(token) })
  res.clearCookie('token', getCookieOptions())
  res.cookie(AUTH_COOKIE_NAME, '', {
    ...getCookieOptions(),
    maxAge: 0,
  })

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  })
})

const getMe = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 })
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: address?.fullName || req.user.name,
      email: req.user.email,
      phone: address?.phone || req.user.phone,
      role: req.user.role,
      isBlocked: req.user.isBlocked,
      isPhoneVerified: req.user.isPhoneVerified,
      createdAt: req.user.createdAt,
    },
  })
})

const updateMe = asyncHandler(async (req, res) => {
  if (req.body.email && normalizeEmail(req.body.email) !== req.user.email) {
    throw new AppError('Your verified login email cannot be changed here.', 400)
  }
  const allowed = {}
  const { name, email, phone } = req.body

  if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
    if (!name || String(name).trim().length < 2) {
      throw new AppError('Name must be at least 2 characters.', 400)
    }
    allowed.name = String(name).trim()
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
    if (!isValidEmail(email)) {
      throw new AppError('Please provide a valid email address.', 400)
    }
    const normalizedEmail = normalizeEmail(email)
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } })
    if (existing) {
      throw new AppError('This email is already used by another account.', 409)
    }
    allowed.email = normalizedEmail
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
    if (!isValidPhone(phone)) {
      throw new AppError('Please provide a valid phone number.', 400)
    }
    const normalizedPhone = normalizePhone(phone)
    const existing = await User.findOne({ phone: normalizedPhone, _id: { $ne: req.user._id } })
    if (existing) {
      throw new AppError('This phone number is already used by another account.', 409)
    }
    allowed.phone = normalizedPhone
  }

  const user = await User.findByIdAndUpdate(req.user._id, allowed, {
    new: true,
    runValidators: true,
  })

  await sendAuthResponse(user, 200, res, 'Profile updated successfully.')
})

const sendPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!isValidEmail(email)) {
    throw new AppError('Please enter a valid email address.', 400)
  }

  const normalizedEmail = normalizeEmail(email)
  const user = await User.findOne({ email: normalizedEmail })

  if (!user || user.isBlocked) {
    res.status(200).json({
      success: true,
      message: 'If this email is registered, a password reset OTP has been sent.',
    })
    return
  }

  const otp = generateOtp()
  const otpHash = await bcrypt.hash(otp, 12)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await Otp.deleteMany({
    email: normalizedEmail,
    purpose: 'password_reset',
  })

  const otpRecord = await Otp.create({
    email: normalizedEmail,
    otpHash,
    expiresAt,
    purpose: 'password_reset',
  })

  try {
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: 'Your BabyCure password reset OTP',
      text: `Your BabyCure password reset OTP is ${otp}. It is valid for 5 minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17324D;padding:20px;background:#F7FCFF">
          <div style="max-width:640px;margin:auto;background:#FFFFFF;border:1px solid #DCEFF8;border-radius:14px;padding:22px">
            ${getLogoHtml()}
            <h2 style="color:#17324D;margin:0 0 12px">Password reset verification</h2>
            <p>Hello ${user.name || 'there'},</p>
            <p>Use this OTP to reset your BabyCure account password:</p>
            <div style="display:inline-block;background:#F5FFF3;border:1px solid #D7F5D3;border-radius:16px;padding:14px 22px;font-size:28px;font-weight:800;letter-spacing:6px;color:#7CC576">${otp}</div>
            <p>This OTP is valid for 5 minutes. If you did not request this, you can safely ignore this email.</p>
            <p style="margin-top:24px;color:#64748B;font-size:13px">Team BabyCure</p>
          </div>
        </div>
      `,
      attachments: getLogoAttachment(),
    })

    if (emailResult?.skipped) {
      throw new AppError('Password reset email is currently unavailable. Please try again later.', 503)
    }
  } catch (error) {
    await Otp.deleteOne({ _id: otpRecord._id })
    logger.error({ code: error.code, command: error.command, responseCode: error.responseCode }, 'Password reset email delivery failed')

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('Unable to send password reset OTP. Please try again later.', 502)
  }

  res.status(200).json({
    success: true,
    message: 'Password reset OTP sent successfully.',
  })
})

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body

  if (!isValidEmail(email) || !/^\d{6}$/.test(String(otp || ''))) {
    throw new AppError('Invalid password reset request.', 400)
  }

  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400)
  }

  const normalizedEmail = normalizeEmail(email)
  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
    purpose: 'password_reset',
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

  const user = await User.findOne({ email: normalizedEmail }).select('+password')

  if (!user || user.isBlocked) {
    await Otp.deleteOne({ _id: otpRecord._id })
    throw new AppError('Invalid or expired OTP.', 400)
  }

  user.password = password
  await user.save()
  await Otp.deleteOne({ _id: otpRecord._id })

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. Please login with your new password.',
  })
})


const sendLoginOtp = asyncHandler(async (req, res) => {
  if (typeof req.body.email !== 'string' || !isValidEmail(req.body.email)) {
    throw new AppError('Please enter a valid email address.', 400)
  }
  const email = normalizeEmail(req.body.email)
  const otp = generateOtp()
  const otpHash = await bcrypt.hash(otp, 12)
  let record
  try {
    record = await Otp.findOneAndUpdate(
      { email, purpose: 'login', updatedAt: { $lte: new Date(Date.now() - 60000) } },
      { $set: { otpHash, expiresAt: new Date(Date.now() + 300000), attempts: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  } catch (error) {
    if (error.code === 11000) throw new AppError('Please wait 60 seconds before requesting another code.', 429)
    throw error
  }
  try {
    const result = await sendEmail({
      to: email,
      subject: 'Your BabyCure login code',
      text: 'Your BabyCure login code is ' + otp + '. It expires in 5 minutes. Never share this code. If you did not request it, ignore this email.',
      html: '<div style="font-family:Arial,sans-serif;padding:24px;color:#17324D"><h2>Welcome to BabyCure</h2><p>Your one-time login code</p><p style="font-size:32px;letter-spacing:8px;font-weight:bold">' + otp + '</p><p>Valid for 5 minutes. Never share this code.</p><p>If you did not request this, you can ignore this email.</p></div>',
    })
    if (result?.skipped) throw new Error('Email delivery unavailable')
  } catch (error) {
    await Otp.deleteOne({ _id: record._id, otpHash })
    logger.error({ code: error.code }, 'Login OTP delivery failed')
    throw new AppError('Unable to send your code. Please try again shortly.', 503)
  }
  res.json({ success: true, message: 'Verification code sent. Check your email.', retryAfter: 60 })
})

const verifyLoginOtp = asyncHandler(async (req, res) => {
  if (typeof req.body.email !== 'string' || !isValidEmail(req.body.email) || !/^\d{6}$/.test(String(req.body.otp || ''))) {
    throw new AppError('Enter your email and the 6-digit verification code.', 400)
  }
  const email = normalizeEmail(req.body.email)
  // Reserve attempts atomically so concurrent requests cannot bypass the limit.
  const record = await Otp.findOneAndUpdate(
    { email, purpose: 'login', expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } },
    { $inc: { attempts: 1 } }, { new: true, timestamps: false },
  ).select('+otpHash')
  if (!record || !(await bcrypt.compare(String(req.body.otp), record.otpHash))) {
    throw new AppError('Incorrect or expired code. Try again or request a new code.', 400)
  }
  const consumed = await Otp.deleteOne({ _id: record._id, otpHash: record.otpHash })
  if (!consumed.deletedCount) throw new AppError('This code has already been used. Request a new code.', 400)
  const user = await User.findOneAndUpdate({ email }, { $setOnInsert: { email } }, { upsert: true, new: true, setDefaultsOnInsert: true })
  if (user.isBlocked) throw new AppError('Your account has been blocked. Please contact support.', 403)
  await sendAuthResponse(user, 200, res, 'Welcome to BabyCure.')
})

module.exports = {
  sendLoginOtp,
  verifyLoginOtp,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordWithOtp,
  sendPasswordResetOtp,
  updateMe,
}
