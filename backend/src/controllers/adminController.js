const Category = require('../models/Category')
const Order = require('../models/Order')
const Product = require('../models/Product')
const ReturnRequest = require('../models/ReturnRequest')
const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const getDashboard = asyncHandler(async (req, res) => {
  const [
    usersCount,
    productsCount,
    categoriesCount,
    ordersCount,
    pendingOrders,
    paidOrders,
    revenue,
    topSellingProducts,
    monthlySales,
    dailySales,
    orderStatusBreakdown,
    paymentStatusBreakdown,
    lowStockProducts,
    returnRequestsCount,
    openReturnRequests,
    refundedOrders,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: { $in: ['placed', 'processing'] } }),
    Order.countDocuments({ paymentStatus: 'paid' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          quantitySold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Product.find({ stock: { $lte: 10 }, isActive: true })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock price sku'),
    ReturnRequest.countDocuments(),
    ReturnRequest.countDocuments({ status: { $nin: ['closed', 'rejected', 'refund_completed', 'replacement_delivered'] } }),
    Order.countDocuments({ paymentStatus: 'refunded' }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('user', 'name email phone')
      .select('orderNumber totalPrice paymentStatus orderStatus createdAt user'),
  ])

  res.status(200).json({
    success: true,
    stats: {
      usersCount,
      productsCount,
      categoriesCount,
      ordersCount,
      pendingOrders,
      paidOrders,
      revenue: revenue[0]?.total || 0,
      averageOrderValue: paidOrders ? Math.round((revenue[0]?.total || 0) / paidOrders) : 0,
      openReturnRequests,
      refundedOrders,
      returnRequestsCount,
      lowStockCount: lowStockProducts.length,
    },
    dailySales,
    lowStockProducts,
    orderStatusBreakdown,
    paymentStatusBreakdown,
    recentOrders,
    topSellingProducts,
    monthlySales,
  })
})

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    User.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
    users,
  })
})

const updateUser = asyncHandler(async (req, res) => {
  const allowed = {}

  if (Object.prototype.hasOwnProperty.call(req.body, 'role')) {
    if (!['user', 'admin'].includes(req.body.role)) {
      throw new AppError('Valid role is required.', 400)
    }
    allowed.role = req.body.role
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'isBlocked')) {
    allowed.isBlocked = Boolean(req.body.isBlocked)
  }

  const user = await User.findByIdAndUpdate(req.params.id, allowed, {
    new: true,
    runValidators: true,
  }).select('-password')

  if (!user) {
    throw new AppError('User not found.', 404)
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    user,
  })
})

module.exports = {
  getDashboard,
  getUsers,
  updateUser,
}
