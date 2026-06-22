const Product = require('../models/Product')
const StockHistory = require('../models/StockHistory')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const LOW_STOCK_THRESHOLD = 10

const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Math.max(Number(req.query.threshold) || LOW_STOCK_THRESHOLD, 0)
  const products = await Product.find({ stock: { $lte: threshold }, isActive: true })
    .select('name sku stock price images')
    .sort({ stock: 1 })

  res.status(200).json({
    success: true,
    threshold,
    count: products.length,
    products,
  })
})

const adjustStock = asyncHandler(async (req, res) => {
  const { stock, reason = 'manual_adjustment', note } = req.body
  const newStock = Number(stock)

  if (!Number.isInteger(newStock) || newStock < 0) {
    throw new AppError('Valid stock value is required.', 400)
  }

  const product = await Product.findById(req.params.productId)
  if (!product) {
    throw new AppError('Product not found.', 404)
  }

  const previousStock = product.stock
  product.stock = newStock
  await product.save()

  await StockHistory.create({
    product: product._id,
    previousStock,
    newStock,
    change: newStock - previousStock,
    reason,
    note,
    changedBy: req.user._id,
  })

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully.',
    product,
  })
})

const getStockHistory = asyncHandler(async (req, res) => {
  const history = await StockHistory.find({ product: req.params.productId })
    .populate('changedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(100)

  res.status(200).json({
    success: true,
    count: history.length,
    history,
  })
})

module.exports = {
  adjustStock,
  getLowStockProducts,
  getStockHistory,
}
