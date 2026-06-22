const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
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
      enum: ['phone_signup'],
      default: 'phone_signup',
    },
  },
  {
    timestamps: true,
  },
)

const Otp = mongoose.model('Otp', otpSchema)

module.exports = Otp
