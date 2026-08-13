require('dotenv').config({ quiet: true })

const compression = require('compression')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const path = require('path')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const hpp = require('hpp')
const morgan = require('morgan')

const errorHandler = require('./middlewares/errorHandler')
const notFound = require('./middlewares/notFound')
const addressRoutes = require('./routes/addressRoutes')
const adminRoutes = require('./routes/adminRoutes')
const authRoutes = require('./routes/authRoutes')
const cartRoutes = require('./routes/cartRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const contactRoutes = require('./routes/contactRoutes')
const couponRoutes = require('./routes/couponRoutes')
const healthRoutes = require('./routes/healthRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const orderRoutes = require('./routes/orderRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const productRoutes = require('./routes/productRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const returnRequestRoutes = require('./routes/returnRequestRoutes')
const shiprocketRoutes = require('./routes/shiprocketRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')

const app = express()

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV !== 'development' || !origin) return false

  try {
    const url = new URL(origin)
    return ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

app.set('trust proxy', 1)

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isDevelopmentOrigin(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    // Product lists, cart refreshes and navigation are read-only requests.
    // Do not count those against customers' action quota.
    skip: (req) => process.env.NODE_ENV !== 'production' || ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
    limit: 500,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
  }),
)

app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json', limit: '1mb' }))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(hpp())
app.use(compression())
// Product-upload filenames are unique, so they can be cached aggressively by
// browsers and CDNs instead of being downloaded again on every visit.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '1y',
  immutable: true,
}))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api/health', healthRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/products', productRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/returns', returnRequestRoutes)
app.use('/api/shiprocket', shiprocketRoutes)
app.use('/api/wishlist', wishlistRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
