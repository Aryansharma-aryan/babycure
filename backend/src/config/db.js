const mongoose = require('mongoose')
const { allowedCategoryNames } = require('../utils/allowedCategories')
const slugify = require('../utils/slugify')

const categoryDescriptions = {
  'Baby Shampoo': 'Tear-free hair and bath care essentials.',
  'Baby Body Wash': 'Gentle body washes for newborn routines.',
  'Baby Lotion': 'Soft moisturizers for delicate baby skin.',
  'Baby Diaper Rash Cream': 'Soothing creams to protect delicate skin.',
  'Baby Massage Oil': 'Nourishing oils for calming baby massages.',
}

const ensureAllowedCategories = async () => {
  const Category = require('../models/Category')
  const existingBodyWash = await Category.findOne({ name: 'Baby Body Wash' }).select('_id').lean()

  if (!existingBodyWash) {
    await Category.updateOne(
      { name: 'Baby Bosy Wash' },
      { $set: { name: 'Baby Body Wash', slug: slugify('Baby Body Wash') } },
    )
  }

  await Category.bulkWrite(allowedCategoryNames.map((name) => ({
    updateOne: {
      filter: { name },
      update: {
        $setOnInsert: {
          name,
          slug: slugify(name),
          description: categoryDescriptions[name],
          isActive: true,
        },
      },
      upsert: true,
    },
  })))
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to your backend .env file.')
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 20,
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
    })

    await ensureAllowedCategories()

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
      const ReturnRequest = require('../models/ReturnRequest')
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
      await ReturnRequest.syncIndexes()
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
