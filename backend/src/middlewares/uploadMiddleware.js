const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { cloudinary } = require('../config/cloudinary')
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
    files: 4,
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
const productUploadsDir = path.join(__dirname, '..', '..', 'uploads', 'products')

const createLocalStorage = (destination) => multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdirSync(destination, { recursive: true })
    callback(null, destination)
  },
  filename(req, file, callback) {
    const ext = path.extname(file.originalname || '').toLowerCase()
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})

const localReturnUpload = multer({
  storage: createLocalStorage(returnUploadsDir),
  fileFilter,
  limits: {
    files: 5,
    fileSize: 3 * 1024 * 1024,
  },
})

const localProductUpload = multer({
  storage: createLocalStorage(productUploadsDir),
  fileFilter,
  limits: {
    files: 4,
    fileSize: 3 * 1024 * 1024,
  },
})

const hasCloudinaryConfig = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)

const uploadReturnImages = (req, res, next) => {
  const uploader = hasCloudinaryConfig() ? returnUpload : localReturnUpload
  return uploader.any()(req, res, next)
}

// Allowed product upload field names: support explicit slots and legacy multi-file `images`
const productFileFields = [
  { name: 'imageFile0', maxCount: 1 },
  { name: 'imageFile1', maxCount: 1 },
  { name: 'imageFile2', maxCount: 1 },
  { name: 'imageFile3', maxCount: 1 },
  { name: 'images', maxCount: 4 },
]

const uploadProductImages = (req, res, next) => {
  const uploader = hasCloudinaryConfig() ? upload : localProductUpload
  // Parse the request exactly once. Retrying multer after it has read a multipart
  // stream causes "Unexpected end of form", which made product creation fail.
  return uploader.fields(productFileFields)(req, res, next)
}

module.exports = {
  uploadProductImages,
  uploadReturnImages,
}
