require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Category = require('../models/Category')
const Product = require('../models/Product')
const slugify = require('./slugify')

const categoryData = [
  {
    name: 'Baby Lotion',
    description: 'Soft moisturizers for delicate baby skin.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Baby Shampoo',
    description: 'Tear-free hair and bath care essentials.',
    image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Baby Oil',
    description: 'Gentle massage oils for bonding routines.',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Diapers',
    description: 'Soft diapering essentials for daily comfort.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Baby Wipes',
    description: 'Fresh, soft wipes for quick and gentle cleanup.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Skin Care',
    description: 'Daily skin care for newborn-safe routines.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Feeding',
    description: 'Clean feeding products for smooth parent routines.',
    image: 'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Toys & Accessories',
    description: 'Soft accessories and gentle baby play essentials.',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Health & Safety',
    description: 'Helpful safety and wellness products for babies.',
    image: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Gift Sets',
    description: 'Premium bundles for newborns and parents.',
    image: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=900&q=80',
  },
]

const image = (url) => [{ url }]

const productData = [
  ['BC-LOT-001', 'Babycure Cloud Soft Baby Lotion', 'Baby Lotion', 499, 649, 60, true, '24-hour gentle hydration with a soft, non-sticky finish.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'],
  ['BC-LOT-002', 'Babycure Aloe Moisture Lotion', 'Baby Lotion', 399, 529, 45, false, 'Aloe-inspired daily lotion for delicate skin comfort.', 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=80'],
  ['BC-SHA-001', 'Babycure Gentle Baby Shampoo', 'Baby Shampoo', 349, 499, 70, true, 'Tear-free shampoo for soft baby hair and happy bath time.', 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=900&q=80'],
  ['BC-SHA-002', 'Babycure Head-to-Toe Baby Wash', 'Baby Shampoo', 399, 549, 55, true, 'Mild wash for hair and body, crafted for newborn routines.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'],
  ['BC-OIL-001', 'Babycure Nourishing Massage Oil', 'Baby Oil', 299, 399, 85, true, 'Light massage oil for calming bonding moments.', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'],
  ['BC-OIL-002', 'Babycure Almond Baby Oil', 'Baby Oil', 449, 599, 40, false, 'Rich yet gentle oil for evening massage care.', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80'],
  ['BC-DIA-001', 'Babycure Ultra Soft Diapers Small', 'Diapers', 599, 799, 120, true, 'Breathable diapers with soft comfort fit.', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80'],
  ['BC-DIA-002', 'Babycure Overnight Diaper Pants', 'Diapers', 699, 899, 90, false, 'Comfortable overnight protection for peaceful sleep.', 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=900&q=80'],
  ['BC-WIP-001', 'Babycure Premium Baby Wipes 72 pcs', 'Baby Wipes', 199, 249, 150, true, 'Soft, alcohol-free wipes for home and travel.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'],
  ['BC-WIP-002', 'Babycure Water Care Baby Wipes', 'Baby Wipes', 249, 329, 100, false, 'Water-based wipes for sensitive skin cleanup.', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'],
  ['BC-SKIN-001', 'Babycure Diaper Rash Cream', 'Skin Care', 299, 399, 65, true, 'Soothing barrier cream for everyday diaper changes.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'],
  ['BC-SKIN-002', 'Babycure Soft Baby Powder', 'Skin Care', 199, 259, 75, false, 'Fresh comfort powder with a soft smooth feel.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80'],
  ['BC-FEED-001', 'Babycure Silicone Feeding Spoon Set', 'Feeding', 249, 349, 55, false, 'Soft spoons designed for early feeding routines.', 'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=900&q=80'],
  ['BC-FEED-002', 'Babycure Easy Grip Feeding Bottle', 'Feeding', 399, 549, 50, true, 'Easy-grip bottle for comfortable feeding moments.', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=80'],
  ['BC-TOY-001', 'Babycure Soft Plush Rattle', 'Toys & Accessories', 349, 449, 80, false, 'A soft sensory rattle for tiny hands.', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80'],
  ['BC-TOY-002', 'Babycure Bath Toy Set', 'Toys & Accessories', 499, 649, 35, true, 'Gentle bath toys for playful bath routines.', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80'],
  ['BC-HEALTH-001', 'Babycure Digital Bath Thermometer', 'Health & Safety', 599, 799, 30, false, 'Helpful thermometer for safer bath water checks.', 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=900&q=80'],
  ['BC-HEALTH-002', 'Babycure Nail Care Safety Kit', 'Health & Safety', 299, 399, 45, false, 'Compact grooming kit for careful baby nail care.', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80'],
  ['BC-GIFT-001', 'Babycure Newborn Welcome Gift Set', 'Gift Sets', 1299, 1699, 25, true, 'Premium care bundle with bath, lotion, wipes and oil.', 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=900&q=80'],
  ['BC-GIFT-002', 'Babycure Complete Bath Care Box', 'Gift Sets', 999, 1399, 28, true, 'Thoughtful bath care set for new parents.', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=900&q=80'],
]

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required to seed demo data.')
  }

  await mongoose.connect(process.env.MONGO_URI)

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
