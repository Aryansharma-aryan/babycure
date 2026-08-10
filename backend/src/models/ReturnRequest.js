const mongoose = require('mongoose')

const statuses = [
  'requested',
  'approved',
  'rejected',
  'pickup_scheduled',
  'picked_up',
  'received_by_seller',
  'refund_initiated',
  'refund_completed',
  'replacement_shipped',
  'replacement_delivered',
  'closed',
]

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: statuses,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const requestItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
)

const returnRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['return', 'replacement'],
      required: true,
      index: true,
    },
    items: {
      type: [requestItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'At least one product is required.',
      },
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    status: {
      type: String,
      enum: statuses,
      default: 'requested',
      index: true,
    },
    statusHistory: {
      type: [historySchema],
      default: [],
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    returnShiprocketOrderId: String,
    returnShiprocketShipmentId: String,
    returnAwbCode: String,
    returnCourierName: String,
    returnTrackingUrl: String,
    returnShipmentStatus: String,
    returnPickupStatus: String,
    returnLabelUrl: String,
    replacementOrderId: String,
    replacementShipmentId: String,
    replacementAwbCode: String,
    replacementCourierName: String,
    replacementTrackingUrl: String,
    replacementShipmentStatus: String,
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundMethod: {
      type: String,
      enum: ['razorpay', 'manual_upi', 'bank_transfer', 'store_credit'],
    },
    razorpayRefundId: String,
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    closedAt: Date,
  },
  { timestamps: true },
)

returnRequestSchema.index({ order: 1, type: 1, status: 1 })

module.exports = mongoose.model('ReturnRequest', returnRequestSchema)
module.exports.statuses = statuses
