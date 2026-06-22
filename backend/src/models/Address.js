const mongoose = require('mongoose')

const phoneRegex = /^[6-9]\d{9}$/
const postalCodeRegex = /^\d{6}$/

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [80, 'Full name cannot exceed 80 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [phoneRegex, 'Please provide a valid phone number'],
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [phoneRegex, 'Please provide a valid alternate phone number'],
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
      maxlength: [160, 'Address line 1 cannot exceed 160 characters'],
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [160, 'Address line 2 cannot exceed 160 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [80, 'City cannot exceed 80 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [80, 'State cannot exceed 80 characters'],
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      match: [postalCodeRegex, 'Please provide a valid 6 digit postal code'],
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [120, 'Landmark cannot exceed 120 characters'],
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

addressSchema.index({ user: 1, isDefault: 1 })

const Address = mongoose.model('Address', addressSchema)

module.exports = Address
