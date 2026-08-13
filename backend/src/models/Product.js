const mongoose = require('mongoose')
const slugify = require('../utils/slugify')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [140, 'Product name cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || value.trim().split(/\s+/).filter(Boolean).length <= 80,
        message: 'Short description cannot exceed 80 words',
      },
    },
    keyFeatures: { type: String, trim: true, default: '' },
    specifications: { type: String, trim: true, default: '' },
    benefits: { type: String, trim: true, default: '' },
    howToUse: { type: String, trim: true, default: '' },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      min: [0, 'MRP cannot be negative'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true,
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          publicId: {
            type: String,
            trim: true,
          },
        },
      ],
      validate: {
        validator: (images) => images.length <= 4,
        message: 'A product can have a maximum of 4 images',
      },
    },
    stock: {
      type: Number,
      default: 1000,
      min: [0, 'Stock cannot be negative'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    brand: {
      type: String,
      default: 'Babycure',
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Ratings quantity cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
)

productSchema.pre('validate', function setSlug() {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name)
  }

  if (this.isModified('name')) {
    this.slug = slugify(this.name)
  }
})

productSchema.index({ price: 1 })
productSchema.index({ name: 'text' })

const Product = mongoose.model('Product', productSchema)

module.exports = Product
