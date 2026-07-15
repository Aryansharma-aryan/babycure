import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import toast from 'react-hot-toast'
import { cartService } from '../api/services'
import { getCartTotals } from '../utils/format'
import { getProductId, normalizeCartItems } from '../utils/products'
import { useAuth } from '../hooks/useAuth'
import { CartContext } from './cart-context'

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET':
      return action.items
    case 'ADD': {
      const existing = state.find((item) => item.id === action.product.id)
      if (existing) {
        return state.map((item) =>
          item.id === action.product.id
            ? { ...item, quantity: item.quantity + action.quantity }
            : item,
        )
      }
      return [...state, { ...action.product, quantity: action.quantity }]
    }
    case 'REMOVE':
      return state.filter((item) => item.id !== action.id)
    case 'UPDATE':
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: Math.max(action.quantity, 1) } : item,
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, loading: authLoading } = useAuth()

  const syncCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET', items: [] })
      return null
    }

    setLoading(true)
    try {
      const response = await cartService.get()
      const nextItems = normalizeCartItems(response.cart)
      dispatch({ type: 'SET', items: nextItems })
      return response.cart
    } catch {
      dispatch({ type: 'SET', items: [] })
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!authLoading) {
      syncCart()
    }
  }, [authLoading, syncCart])

  const addToCart = useCallback(async (product, quantity = 1) => {
    const productId = getProductId(product)
    if (!isAuthenticated) {
      toast.error('Please login to add products to cart')
      throw new Error('Please login to add products to cart')
    }
    const response = await cartService.add({ productId, quantity })
    dispatch({ type: 'SET', items: normalizeCartItems(response.cart) })
    toast.success(`${product.name} added to cart`)
    return response.cart
  }, [isAuthenticated])

  const removeFromCart = useCallback(async (id, name = 'Product') => {
    const response = await cartService.remove(id)
    dispatch({ type: 'SET', items: normalizeCartItems(response.cart) })
    toast.success(`${name} removed`)
  }, [])

  const updateQuantity = useCallback(async (id, quantity) => {
    const response = await cartService.update(id, { quantity })
    dispatch({ type: 'SET', items: normalizeCartItems(response.cart) })
    toast.success('Quantity updated')
  }, [])

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR' })
      return
    }
    const response = await cartService.clear()
    dispatch({ type: 'SET', items: normalizeCartItems(response.cart) })
    toast.success('Bag cleared')
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      items,
      loading,
      totals: getCartTotals(items),
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCart,
    }),
    [addToCart, clearCart, items, loading, removeFromCart, syncCart, updateQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
