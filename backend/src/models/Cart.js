const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    priceAtTime: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productImage: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
)

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    cartTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

cartSchema.methods.recalculateTotal = function recalculateTotal() {
  this.cartTotal = this.items.reduce((total, item) => total + item.quantity * item.priceAtTime, 0)
  return this.cartTotal
}

cartSchema.pre('save', function calculateTotal() {
  this.recalculateTotal()
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
