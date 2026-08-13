require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Category = require('../models/Category')
const Product = require('../models/Product')
const slugify = require('./slugify')

const categoryData = [
  {
    name: 'Baby Shampoo',
    description: 'Tear-free hair and bath care essentials.',
    image: '',
  },
  {
    name: 'Baby Body Wash',
    description: 'Gentle body washes for newborn routines.',
    image: '',
  },
  {
    name: 'Baby Lotion',
    description: 'Soft moisturizers for delicate baby skin.',
    image: '',
  },
  {
    name: 'Baby Diaper Rash Cream',
    description: 'Soothing creams to protect delicate skin.',
    image: '',
  },
  {
    name: 'Baby Massage Oil',
    description: 'Nourishing oils for calming baby massages.',
    image: '',
  },
]

const image = (url) => [{ url }]

const productData = [
  ['BC-LOT-001', 'Babycure Cloud Soft Baby Lotion', 'Baby Lotion', 499, 649, 60, true, '24-hour gentle hydration with a soft, non-sticky finish.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'],
  ['BC-LOT-002', 'Babycure Aloe Moisture Lotion', 'Baby Lotion', 399, 529, 45, false, 'Aloe-inspired daily lotion for delicate skin comfort.', 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=80'],
  ['BC-SHA-001', 'Babycure Gentle Baby Shampoo', 'Baby Shampoo', 349, 499, 70, true, 'Tear-free shampoo for soft baby hair and happy bath time.', 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=900&q=80'],
  ['BC-WASH-001', 'Babycure Head-to-Toe Baby Wash', 'Baby Body Wash', 399, 549, 55, true, 'Mild body wash for newborn routines.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'],
  ['BC-WASH-002', 'Babycure Calming Baby Body Wash', 'Baby Body Wash', 429, 579, 48, false, 'Gentle cleansing for soft, comfortable skin.', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'],
  ['BC-OIL-001', 'Babycure Nourishing Massage Oil', 'Baby Massage Oil', 299, 399, 85, true, 'Light massage oil for calming bonding moments.', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'],
  ['BC-OIL-002', 'Babycure Almond Baby Massage Oil', 'Baby Massage Oil', 449, 599, 40, false, 'Rich yet gentle oil for evening massage care.', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80'],
  ['BC-SKIN-001', 'Babycure Diaper Rash Cream', 'Baby Diaper Rash Cream', 299, 399, 65, true, 'Soothing barrier cream for everyday diaper changes.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'],
]

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required to seed demo data.')
  }

  await mongoose.connect(process.env.MONGO_URI)

  const babyBodyWash = await Category.findOne({ name: 'Baby Body Wash' })
  if (!babyBodyWash) {
    await Category.updateOne(
      { name: 'Baby Bosy Wash' },
      { $set: { name: 'Baby Body Wash', slug: slugify('Baby Body Wash') } },
    )
  }

  const categoriesByName = {}
  for (const category of categoryData) {
    const saved = await Category.findOneAndUpdate(
      { name: category.name },
      { ...category, slug: slugify(category.name), isActive: true },
      { upsert: true, returnDocument: 'after', runValidators: true },
    )
    categoriesByName[category.name] = saved
  }

  for (const [sku, name, categoryName, price, mrp, stock, isFeatured, shortDescription, imageUrl] of productData) {
    const category = categoriesByName[categoryName]
    await Product.findOneAndUpdate(
      { sku },
      {
        name,
        slug: slugify(name),
        shortDescription,
        description: `${shortDescription} BabyCure demo product for testing listing, cart, checkout, wishlist and reviews.`,
        price,
        mrp,
        discountPercentage: Math.round(((mrp - price) / mrp) * 100),
        category: category._id,
        images: image(imageUrl),
        stock,
        sku,
        brand: 'Babycure',
        isFeatured,
        isActive: true,
        ratingsAverage: 4.5 + Math.round(Math.random() * 4) / 10,
        ratingsQuantity: 30 + Math.floor(Math.random() * 130),
      },
      { upsert: true, returnDocument: 'after', runValidators: true },
    )
  }

  console.log(`Seeded ${categoryData.length} categories and ${productData.length} demo products.`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`)
  await mongoose.disconnect()
  process.exit(1)
})
