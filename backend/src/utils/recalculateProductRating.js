const Product = require('../models/Product')
const Review = require('../models/Review')

const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        ratingsAverage: { $avg: '$rating' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ])

  if (stats.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    })
    return
  }

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: Math.round(stats[0].ratingsAverage * 10) / 10,
    ratingsQuantity: stats[0].ratingsQuantity,
  })
}

module.exports = recalculateProductRating
