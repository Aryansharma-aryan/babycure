const mongoose = require('mongoose')

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ['manual_adjustment', 'order_placed', 'order_cancelled', 'return', 'correction'],
      default: 'manual_adjustment',
    },
    note: {
      type: String,
      trim: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

stockHistorySchema.index({ product: 1, createdAt: -1 })

const StockHistory = mongoose.model('StockHistory', stockHistorySchema)

module.exports = StockHistory
