export function formatPrice(value) {
  return `Rs.${Number(value).toLocaleString('en-IN')}.00`
}

export function getCartTotals(items) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const discount = subtotal > 800 ? 150 : subtotal > 0 ? 50 : 0
  const shipping = subtotal === 0 || subtotal > 999 ? 0 : 40
  return {
    subtotal,
    discount,
    shipping,
    total: Math.max(subtotal + shipping - discount, 0),
  }
}
