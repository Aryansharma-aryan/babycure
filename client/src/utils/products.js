import { resolveMediaUrl } from '../api/client'

export function getProductId(product) {
  return product?._id || product?.id || product?.product?._id || product?.product
}

export function getProductImage(product) {
  const source = product?.images?.[0]?.url || product?.productImage || product?.image || ''
  // Demo seed data used generic stock images. Do not present them as BabyCure products.
  if (source.includes('images.unsplash.com')) return ''
  return resolveMediaUrl(source)
}

export function normalizeCartItems(cart) {
  return (cart?.items || []).map((item) => {
    const product = item.product || {}
    return {
      id: product._id || item.product,
      name: item.productName || product.name,
      price: item.priceAtTime || product.price || 0,
      oldPrice: product.mrp || item.priceAtTime || 0,
      quantity: item.quantity,
      // Cart records keep the product image as a backend upload path. Resolve it
      // before rendering so it never tries to load from the Vite frontend origin.
      image: resolveMediaUrl(item.productImage) || getProductImage(product),
      stock: product.stock ?? 0,
      slug: product.slug,
      raw: item,
      product,
    }
  })
}
