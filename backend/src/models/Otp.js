const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    purpose: {
      type: String,
      enum: ['phone_signup', 'password_reset'],
      default: 'phone_signup',
    },
  },
  {
    timestamps: true,
  },
)

otpSchema.pre('validate', function requireOtpTarget() {
  if (!this.phone && !this.email) {
    this.invalidate('email', 'OTP requires phone or email.')
  }
})

const Otp = mongoose.model('Otp', otpSchema)

module.exports = Otp
