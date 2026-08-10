const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { assertCloudinaryConfig, cloudinary } = require('../config/cloudinary')
const AppError = require('../utils/AppError')

const allowedFormats = ['jpg', 'jpeg', 'png', 'webp']
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder,
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
  storage: createStorage('babycure/products'),
  fileFilter,
  limits: {
    files: 5,
    fileSize: 3 * 1024 * 1024,
  },
})

const returnUpload = multer({
  storage: createStorage('babycure/return-requests'),
  fileFilter,
  limits: {
    files: 5,
    fileSize: 3 * 1024 * 1024,
  },
})

const returnUploadsDir = path.join(__dirname, '..', '..', 'uploads', 'return-requests')

const localReturnUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      fs.mkdirSync(returnUploadsDir, { recursive: true })
      callback(null, returnUploadsDir)
    },
    filename(req, file, callback) {
      const ext = path.extname(file.originalname || '').toLowerCase()
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
      callback(null, safeName)
    },
  }),
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

const hasCloudinaryConfig = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)

const uploadReturnImages = (req, res, next) => {
  const uploader = hasCloudinaryConfig() ? returnUpload : localReturnUpload
  return uploader.array('images', 5)(req, res, next)
}

const uploadProductImages = [ensureCloudinaryReady, upload.array('images', 5)]

module.exports = {
  uploadProductImages,
  uploadReturnImages,
}
