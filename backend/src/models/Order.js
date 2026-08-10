const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
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
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    _id: false,
  },
)

const trackingHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['placed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed'],
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [240, 'Tracking message cannot exceed 240 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Tracking location cannot exceed 120 characters'],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponUsedAt: {
      type: Date,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'ONLINE',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
      select: false,
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    trackingId: {
      type: String,
      trim: true,
    },
    shiprocketOrderId: {
      type: String,
      trim: true,
      index: true,
    },
    shiprocketShipmentId: {
      type: String,
      trim: true,
      index: true,
    },
    awbCode: {
      type: String,
      trim: true,
      index: true,
    },
    courierName: {
      type: String,
      trim: true,
    },
    trackingUrl: {
      type: String,
      trim: true,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    labelUrl: {
      type: String,
      trim: true,
    },
    pickupStatus: {
      type: String,
      trim: true,
    },
    shipmentStatus: {
      type: String,
      trim: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['placed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed'],
      default: 'placed',
      index: true,
    },
    trackingHistory: {
      type: [trackingHistorySchema],
      default: [],
    },
    trackingSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ trackingId: 1 })

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
