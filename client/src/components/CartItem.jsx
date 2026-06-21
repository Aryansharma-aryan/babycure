import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import ProductArt from './ProductArt'

export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart()

  return (
    <div className="grid gap-4 border-b border-slate-100 p-5 last:border-0 sm:grid-cols-[100px_1fr_auto_auto] sm:items-center">
      <div className="grid h-24 place-items-center rounded-md bg-slate-50">
        <ProductArt type={item.type} color={item.color} />
      </div>
      <div>
        <h3 className="font-black text-slate-950">{item.name}</h3>
        <p className="mt-1 font-black text-slate-900">{formatPrice(item.price)}</p>
      </div>
      <div className="inline-flex w-max rounded-md border border-slate-200 bg-white">
        <button className="p-2" type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 py-2 font-black">{item.quantity}</span>
        <button className="p-2" type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button className="text-slate-400 hover:text-red-500" type="button" onClick={() => removeFromCart(item.id, item.name)}>
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}
