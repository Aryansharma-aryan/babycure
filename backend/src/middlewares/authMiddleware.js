const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { verifyToken } = require('../utils/jwt')

const protect = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)

  if (!token) {
    throw new AppError('Authentication required. Please login.', 401)
  }

  const decoded = verifyToken(token)
  const user = await User.findById(decoded.id)

  if (!user) {
    throw new AppError('The user linked to this token no longer exists.', 401)
  }

  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Please contact support.', 403)
  }

  req.user = user
  next()
})

const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required.', 403))
  }

  next()
}

module.exports = {
  admin,
  protect,
}
