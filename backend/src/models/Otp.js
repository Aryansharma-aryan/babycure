const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema(
  {
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
      enum: ['password_reset', 'login'],
      default: 'password_reset',
    },
  },
  {
    timestamps: true,
  },
)

otpSchema.index({ email: 1, purpose: 1 }, { unique: true, partialFilterExpression: { purpose: 'login' } })

const Otp = mongoose.model('Otp', otpSchema)

module.exports = Otp
