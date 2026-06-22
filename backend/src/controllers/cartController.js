const mongoose = require('mongoose')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const populateCart = (query) =>
  query.populate({
    path: 'items.product',
    select: 'name slug price mrp images stock sku brand isActive',
  })

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] })
  }

  return cart
}

const getActiveProduct = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError('Valid product is required.', 400)
  }

  const product = await Product.findById(productId)

  if (!product || !product.isActive) {
    throw new AppError('Product not available.', 404)
  }

  return product
}

const getProductImage = (product) => product.images?.[0]?.url || ''

const sendCart = async (res, cart, message = 'Cart fetched successfully.') => {
  const populatedCart = await populateCart(Cart.findById(cart._id))

  res.status(200).json({
    success: true,
    message,
    cart: populatedCart,
  })
}

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body
  const requestedQuantity = Number(quantity)

  if (!productId || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    throw new AppError('Valid product and quantity are required.', 400)
  }

  const product = await getActiveProduct(productId)
  const cart = await getOrCreateCart(req.user._id)
  const existingItem = cart.items.find((item) => item.product.toString() === product._id.toString())
  const finalQuantity = existingItem ? existingItem.quantity + requestedQuantity : requestedQuantity

  if (product.stock < finalQuantity) {
    throw new AppError('Requested quantity is not available in stock.', 400)
  }

  if (existingItem) {
    existingItem.quantity = finalQuantity
    existingItem.priceAtTime = product.price
    existingItem.productName = product.name
    existingItem.productImage = getProductImage(product)
  } else {
    cart.items.push({
      product: product._id,
      quantity: requestedQuantity,
      priceAtTime: product.price,
      productName: product.name,
      productImage: getProductImage(product),
    })
  }

  await cart.save()
  await sendCart(res, cart, 'Product added to cart.')
})

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  await sendCart(res, cart)
})

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const quantity = Number(req.body.quantity)

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new AppError('Valid quantity is required.', 400)
  }

  const cart = await getOrCreateCart(req.user._id)
  const item = cart.items.find((cartItem) => cartItem.product.toString() === productId)

  if (!item) {
    throw new AppError('Product not found in cart.', 404)
  }

  if (quantity === 0) {
    cart.items = cart.items.filter((cartItem) => cartItem.product.toString() !== productId)
    await cart.save()
    return sendCart(res, cart, 'Product removed from cart.')
  }

  const product = await getActiveProduct(productId)

  if (product.stock < quantity) {
    throw new AppError('Requested quantity is not available in stock.', 400)
  }

  item.quantity = quantity
  item.priceAtTime = product.price
  item.productName = product.name
  item.productImage = getProductImage(product)

  await cart.save()
  return sendCart(res, cart, 'Cart quantity updated.')
})

const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const cart = await getOrCreateCart(req.user._id)
  const initialLength = cart.items.length

  cart.items = cart.items.filter((item) => item.product.toString() !== productId)

  if (cart.items.length === initialLength) {
    throw new AppError('Product not found in cart.', 404)
  }

  await cart.save()
  await sendCart(res, cart, 'Product removed from cart.')
})

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = []
  await cart.save()

  await sendCart(res, cart, 'Cart cleared successfully.')
})

module.exports = {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
}
