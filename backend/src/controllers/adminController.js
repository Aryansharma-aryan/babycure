const Category = require('../models/Category')
const Address = require('../models/Address')
const Cart = require('../models/Cart')
const Notification = require('../models/Notification')
const Order = require('../models/Order')
const PaymentSession = require('../models/PaymentSession')
const Product = require('../models/Product')
const Review = require('../models/Review')
const ReturnRequest = require('../models/ReturnRequest')
const User = require('../models/User')
const Wishlist = require('../models/Wishlist')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const deleteOrderRecords = async (filter) => {
  const orderIds = await Order.find(filter).distinct('_id')
  if (!orderIds.length) return 0

  await Promise.all([
    PaymentSession.deleteMany({ order: { $in: orderIds } }),
    ReturnRequest.deleteMany({ order: { $in: orderIds } }),
    Review.updateMany({ order: { $in: orderIds } }, { $unset: { order: 1 } }),
  ])
  const result = await Order.deleteMany({ _id: { $in: orderIds } })
  return result.deletedCount
}

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

const deleteOrder = asyncHandler(async (req, res) => {
  const deletedCount = await deleteOrderRecords({ _id: req.params.id })
  if (!deletedCount) throw new AppError('Order not found.', 404)
  res.status(200).json({ success: true, message: 'Order history deleted successfully.' })
})

const deleteAllOrders = asyncHandler(async (req, res) => {
  const deletedCount = await deleteOrderRecords({})
  res.status(200).json({ success: true, message: `${deletedCount} order(s) deleted successfully.`, deletedCount })
})

const deleteCustomerRecords = async (userIds) => {
  if (!userIds.length) return 0
  await deleteOrderRecords({ user: { $in: userIds } })
  await Promise.all([
    Address.deleteMany({ user: { $in: userIds } }),
    Cart.deleteMany({ user: { $in: userIds } }),
    Notification.deleteMany({ user: { $in: userIds } }),
    PaymentSession.deleteMany({ user: { $in: userIds } }),
    ReturnRequest.deleteMany({ user: { $in: userIds } }),
    Review.deleteMany({ user: { $in: userIds } }),
    Wishlist.deleteMany({ user: { $in: userIds } }),
  ])
  const result = await User.deleteMany({ _id: { $in: userIds }, role: { $ne: 'admin' } })
  return result.deletedCount
}

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('role')
  if (!user) throw new AppError('User not found.', 404)
  if (user.role === 'admin') throw new AppError('Admin accounts cannot be deleted here.', 400)
  await deleteCustomerRecords([user._id])
  res.status(200).json({ success: true, message: 'Customer and related history deleted successfully.' })
})

const deleteAllUsers = asyncHandler(async (req, res) => {
  const userIds = await User.find({ role: { $ne: 'admin' } }).distinct('_id')
  const deletedCount = await deleteCustomerRecords(userIds)
  res.status(200).json({ success: true, message: `${deletedCount} customer(s) deleted. Admin accounts were preserved.`, deletedCount })
})

module.exports = {
  deleteAllOrders,
  deleteAllUsers,
  deleteOrder,
  deleteUser,
  getDashboard,
  getUsers,
  updateUser,
}
