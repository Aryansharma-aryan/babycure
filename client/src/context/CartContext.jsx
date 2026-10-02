import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { cartService } from '../api/services'
import { getCartTotals } from '../utils/format'
import { getProductId, normalizeCartItems } from '../utils/products'
import { useAuth } from '../hooks/useAuth'
import { CartContext } from './cart-context'

const GUEST_KEY = 'babycure:guest-bag'
let memoryBag
function readBag() {
  try {
    const saved = JSON.parse(localStorage.getItem(GUEST_KEY))
    if (saved && typeof saved.mergeId === 'string' && Array.isArray(saved.items)) {
      memoryBag = { ...saved, items: saved.items.filter((item) => item && typeof item.id === 'string' && Number.isSafeInteger(item.quantity) && item.quantity > 0) }
    }
  } catch { /* Retain the in-memory bag if browser storage is unavailable. */ }
  return memoryBag || { mergeId: crypto.randomUUID(), items: [] }
}
function saveBag(items) {
  memoryBag = { mergeId: crypto.randomUUID(), items }
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(memoryBag)) }
  catch { toast.error('Browser storage is unavailable. Keep this page open to retain your bag.', { id: 'bag-storage' }) }
  return items
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readBag().items)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const userId = user?._id
  const requestId = useRef(0)

  const syncCart = useCallback(async () => {
    const request = ++requestId.current
    if (!isAuthenticated || !userId) {
      setItems(readBag().items)
      setLoading(false)
      setError('')
      return null
    }
    setLoading(true)
    setError('')
    try {
      const guest = readBag()
      const response = guest.items.length
        ? await cartService.merge({ mergeId: guest.mergeId, items: guest.items.map((item) => ({ productId: item.id, quantity: item.quantity })) })
        : await cartService.get()
      if (request !== requestId.current) return null
      if (guest.items.length && readBag().mergeId === guest.mergeId) {
        saveBag([])
        if (response.message?.includes('adjusted')) toast(response.message)
      }
      setItems(normalizeCartItems(response.cart))
      return response.cart
    } catch (failure) {
      if (request === requestId.current) setError(failure.message || 'Could not load your bag. Please try again.')
      return null
    } finally {
      if (request === requestId.current) setLoading(false)
    }
  }, [isAuthenticated, userId])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => { if (active && !authLoading) syncCart() })
    return () => { active = false; requestId.current += 1 }
  }, [authLoading, syncCart])

  useEffect(() => {
    const handleStorage = (event) => {
      if (!isAuthenticated && event.key === GUEST_KEY) {
        memoryBag = undefined
        setItems(readBag().items)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [isAuthenticated])

  const addToCart = useCallback(async (product, quantity = 1) => {
    const productId = getProductId(product)
    if (!isAuthenticated) {
      const guest = readBag().items
      const existing = guest.find((item) => item.id === productId)
      if (!Number.isSafeInteger(quantity) || quantity < 1 || (existing?.quantity || 0) + quantity > product.stock) throw new Error('Requested quantity is not available in stock.')
      const line = normalizeCartItems({ items: [{ product, quantity, priceAtTime: product.price }] })[0]
      if (!line) throw new Error('Product not available.')
      const next = existing ? guest.map((item) => item.id === productId ? { ...line, quantity: item.quantity + quantity } : item) : [...guest, line]
      setItems(saveBag(next))
      toast.success(`${product.name} added to bag`)
      return { items: next }
    }
    if (loading || error) throw new Error('Please open your bag and finish loading it first.')
    const response = await cartService.add({ productId, quantity })
    setItems(normalizeCartItems(response.cart))
    toast.success(`${product.name} added to cart`)
    return response.cart
  }, [isAuthenticated, loading, error])

  const removeFromCart = useCallback(async (id, name = 'Product') => {
    if (!isAuthenticated) {
      setItems(saveBag(readBag().items.filter((item) => item.id !== id)))
    } else {
      const response = await cartService.remove(id)
      setItems(normalizeCartItems(response.cart))
    }
    toast.success(`${name} removed`)
  }, [isAuthenticated])

  const updateQuantity = useCallback(async (id, quantity) => {
    if (!isAuthenticated) {
      const guest = readBag().items
      const item = guest.find((entry) => entry.id === id)
      if (!item || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > item.stock) throw new Error('Requested quantity is not available in stock.')
      setItems(saveBag(quantity === 0 ? guest.filter((entry) => entry.id !== id) : guest.map((entry) => entry.id === id ? { ...entry, quantity } : entry)))
    } else {
      const response = await cartService.update(id, { quantity })
      setItems(normalizeCartItems(response.cart))
    }
    toast.success('Quantity updated')
  }, [isAuthenticated])

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) setItems(saveBag([]))
    else {
      const response = await cartService.clear()
      setItems(normalizeCartItems(response.cart))
    }
    toast.success('Bag cleared')
  }, [isAuthenticated])

  const value = useMemo(() => ({ items, loading, error, totals: getCartTotals(items), cartCount: items.reduce((total, item) => total + item.quantity, 0), addToCart, removeFromCart, updateQuantity, clearCart, syncCart }), [items, loading, error, addToCart, removeFromCart, updateQuantity, clearCart, syncCart])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
