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
      enum: ['password_reset'],
      default: 'password_reset',
    },
  },
  {
    timestamps: true,
  },
)

const Otp = mongoose.model('Otp', otpSchema)

module.exports = Otp
