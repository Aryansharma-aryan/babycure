const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { assertCloudinaryConfig, cloudinary } = require('../config/cloudinary')
const AppError = require('../utils/AppError')

const allowedFormats = ['jpg', 'jpeg', 'png', 'webp']
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'babycure/products',
    allowed_formats: allowedFormats,
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  },
})

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new AppError('Only jpg, jpeg, png and webp images are allowed.', 400))
  }

  return callback(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 3 * 1024 * 1024,
  },
})

const ensureCloudinaryReady = (req, res, next) => {
  const contentType = req.headers['content-type'] || ''
  if (!contentType.includes('multipart/form-data')) {
    return next()
  }

  try {
    assertCloudinaryConfig()
    next()
  } catch (error) {
    next(new AppError(error.message, 500))
  }
}

const uploadProductImages = [ensureCloudinaryReady, upload.array('images', 5)]

module.exports = {
  uploadProductImages,
}
