const errorHandler = (err, req, res, next) => {
  let error = err
  let statusCode = error.statusCode || error.status || 500
  const isProduction = process.env.NODE_ENV === 'production'

  if (error.name === 'MulterError') {
    statusCode = 400
    if (error.code === 'LIMIT_FILE_COUNT') {
      error = new Error('Maximum 5 images are allowed.')
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new Error('One or more uploaded files used unexpected field names. Use the provided numbered image upload slots or the images field.')
    } else {
      error = new Error(error.message)
    }
  }

  if (error.name === 'ValidationError') {
    statusCode = 400
    error = new Error(Object.values(error.errors).map((item) => item.message).join(', '))
  }

  if (error.code === 11000) {
    statusCode = 409
    error = new Error('Duplicate field value entered.')
  }

  if (error.name === 'CastError') {
    statusCode = 404
    error = new Error('Resource not found.')
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    error = new Error('Invalid token. Please login again.')
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    error = new Error('Your session has expired. Please login again.')
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(isProduction ? {} : { stack: error.stack }),
    ...(req.uploadWarning ? { uploadWarning: req.uploadWarning } : {}),
  })
}

module.exports = errorHandler
