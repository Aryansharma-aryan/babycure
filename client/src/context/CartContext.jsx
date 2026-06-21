import { useCallback, useMemo, useReducer } from 'react'
import toast from 'react-hot-toast'
import { getCartTotals } from '../utils/format'
import { CartContext } from './cart-context'

function cartReducer(state, action) {
  switch (action.type) {
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

  const addToCart = useCallback((product, quantity = 1) => {
    dispatch({ type: 'ADD', product, quantity })
    toast.success(`${product.name} added to cart`)
  }, [])

  const removeFromCart = useCallback((id, name = 'Product') => {
    dispatch({ type: 'REMOVE', id })
    toast.success(`${name} removed`)
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: 'UPDATE', id, quantity })
    toast.success('Quantity updated')
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const value = useMemo(
    () => ({
      items,
      totals: getCartTotals(items),
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [addToCart, clearCart, items, removeFromCart, updateQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
