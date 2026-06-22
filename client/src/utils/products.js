export function getProductId(product) {
  return product?._id || product?.id || product?.product?._id || product?.product
}

export function getProductImage(product) {
  const source = product?.images?.[0]?.url || product?.productImage || product?.image || ''
  return source
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
      image: item.productImage || getProductImage(product),
      stock: product.stock ?? 0,
      slug: product.slug,
      raw: item,
      product,
    }
  })
}
