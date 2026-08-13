require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Category = require('../src/models/Category')
const { allowedCategoryNames } = require('../src/utils/allowedCategories')
const slugify = require('../src/utils/slugify')

const descriptions = {
  'Baby Shampoo': 'Tear-free hair and bath care essentials.',
  'Baby Body Wash': 'Gentle body washes for newborn routines.',
  'Baby Lotion': 'Soft moisturizers for delicate baby skin.',
  'Baby Diaper Rash Cream': 'Soothing creams to protect delicate skin.',
  'Baby Massage Oil': 'Nourishing oils for calming baby massages.',
}

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.')

  await mongoose.connect(process.env.MONGO_URI)
  const bodyWash = await Category.findOne({ name: 'Baby Body Wash' }).select('_id').lean()
  if (!bodyWash) {
    await Category.updateOne(
      { name: 'Baby Bosy Wash' },
      { $set: { name: 'Baby Body Wash', slug: slugify('Baby Body Wash') } },
    )
  }

  await Category.bulkWrite(allowedCategoryNames.map((name) => ({
    updateOne: {
      filter: { name },
      update: { $setOnInsert: { name, slug: slugify(name), description: descriptions[name], isActive: true } },
      upsert: true,
    },
  })))

  console.log('Required categories are available.')
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error(error.message)
  await mongoose.disconnect()
  process.exit(1)
})
