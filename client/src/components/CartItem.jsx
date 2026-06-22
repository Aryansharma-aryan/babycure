import { Minus, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import ProductArt from './ProductArt'

export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart()
  const handleUpdate = (quantity) => {
    updateQuantity(item.id, quantity).catch((error) => toast.error(error.message))
  }

  const handleRemove = () => {
    removeFromCart(item.id, item.name).catch((error) => toast.error(error.message))
  }

  return (
    <div className="grid gap-4 border-b border-slate-100 p-5 last:border-0 sm:grid-cols-[100px_1fr_auto_auto] sm:items-center">
      <div className="grid h-24 place-items-center rounded-md bg-slate-50">
        {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-contain p-3" loading="lazy" /> : <ProductArt type={item.type} color={item.color} />}
      </div>
      <div>
        <h3 className="font-black text-slate-950">{item.name}</h3>
        <p className="mt-1 font-black text-slate-900">{formatPrice(item.price)}</p>
        {item.stock <= item.quantity && <p className="mt-1 text-xs font-black text-red-500">Only {item.stock} left in stock</p>}
      </div>
      <div className="inline-flex w-max rounded-md border border-slate-200 bg-white">
        <button className="rounded-l-md p-2 transition hover:bg-sky-50 hover:text-brand-blue" type="button" onClick={() => handleUpdate(item.quantity - 1)}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 py-2 font-black">{item.quantity}</span>
        <button className="rounded-r-md p-2 transition hover:bg-sky-50 hover:text-brand-blue" type="button" onClick={() => handleUpdate(item.quantity + 1)}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500" type="button" onClick={handleRemove}>
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}
