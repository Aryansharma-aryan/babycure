require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('../src/models/Product')

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is required in .env to run this script')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to DB')

  const result = await Product.updateMany({}, { $set: { images: [] } })
  console.log(`Updated ${result.nModified || result.modifiedCount || 0} products - images cleared.`)

  await mongoose.disconnect()
  console.log('Done')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
