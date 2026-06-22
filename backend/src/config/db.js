const mongoose = require('mongoose')

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to your backend .env file.')
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })

    if (process.env.NODE_ENV === 'development') {
      const Address = require('../models/Address')
      const User = require('../models/User')
      const Otp = require('../models/Otp')
      const Category = require('../models/Category')
      const Cart = require('../models/Cart')
      const Coupon = require('../models/Coupon')
      const Order = require('../models/Order')
      const Product = require('../models/Product')
      const Notification = require('../models/Notification')
      const Review = require('../models/Review')
      const StockHistory = require('../models/StockHistory')
      const Wishlist = require('../models/Wishlist')

      await Address.syncIndexes()
      await User.syncIndexes()
      await Otp.syncIndexes()
      await Category.syncIndexes()
      await Cart.syncIndexes()
      await Coupon.syncIndexes()
      await Notification.syncIndexes()
      await Order.syncIndexes()
      await Product.syncIndexes()
      await Review.syncIndexes()
      await StockHistory.syncIndexes()
      await Wishlist.syncIndexes()
    }

    console.log(`MongoDB connected: ${connection.connection.host}`)
    return connection
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    throw error
  }
}

module.exports = connectDB
