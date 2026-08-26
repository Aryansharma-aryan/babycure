const bcrypt = require('bcryptjs')
const { randomInt } = require('crypto')

const Otp = require('../models/Otp')
const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { AUTH_COOKIE_NAME, getCookieOptions, signToken } = require('../utils/jwt')
const { isValidPhone, normalizePhone } = require('../utils/phone')
const { notifyUser } = require('../services/notificationService')
const { getLogoAttachment, getLogoHtml, sendEmail } = require('../services/emailService')

const sendAuthResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id)

  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions())

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

const updateMe = asyncHandler(async (req, res) => {
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

  sendAuthResponse(user, 200, res, 'Profile updated successfully.')
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

  await Otp.create({
    email: normalizedEmail,
    otpHash,
    expiresAt,
    purpose: 'password_reset',
  })

  let emailSkipped = false

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

    emailSkipped = Boolean(emailResult?.skipped)

    if (emailSkipped && process.env.NODE_ENV !== 'development') {
      await Otp.deleteMany({
        email: normalizedEmail,
        purpose: 'password_reset',
      })
      throw new AppError('Email service is not configured. Please set SMTP credentials.', 503)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      emailSkipped = true
    } else {
      await Otp.deleteMany({
        email: normalizedEmail,
        purpose: 'password_reset',
      })

      if (error instanceof AppError) {
        throw error
      }

      throw new AppError('Unable to send password reset OTP. Please try again later.', 502)
    }
  }

  res.status(200).json({
    success: true,
    message: 'Password reset OTP sent successfully.',
    ...(emailSkipped ? { devOtp: otp } : {}),
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

module.exports = {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordWithOtp,
  sendPasswordResetOtp,
  updateMe,
}
