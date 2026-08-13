require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Product = require('../src/models/Product')

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.')

  await mongoose.connect(process.env.MONGO_URI)
  const result = await Product.deleteMany({})
  console.log(`Deleted ${result.deletedCount} product listings.`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error(error.message)
  await mongoose.disconnect()
  process.exit(1)
})
