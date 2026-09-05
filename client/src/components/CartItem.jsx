import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { resolveMediaUrl } from '../api/client'
import ProductArt from './ProductArt'

export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart()
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async (quantity) => {
    if (updating) return
    setUpdating(true)
    try {
      await updateQuantity(item.id, quantity)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemove = () => {
    removeFromCart(item.id, item.name).catch((error) => toast.error(error.message))
  }

  return (
    <div className="grid min-w-0 grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-slate-100 p-3 last:border-0 sm:grid-cols-[100px_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4 sm:p-5">
      <div className="row-span-2 grid h-24 w-[88px] place-items-center overflow-hidden rounded-md bg-slate-50 sm:row-span-1 sm:w-auto">
        {item.image ? <img src={resolveMediaUrl(item.image)} alt={item.name} className="h-full w-full object-contain p-3" loading="lazy" decoding="async" /> : <ProductArt type={item.type} color={item.color} />}
      </div>
      <div className="min-w-0 self-start sm:self-center">
        <h3 className="break-words text-sm font-black leading-5 text-slate-950 sm:text-base">{item.name}</h3>
        <p className="mt-1 text-sm font-black text-slate-900 sm:text-base">{formatPrice(item.price)}</p>
      </div>
      <div className="flex min-w-0 items-center justify-between gap-2 self-end sm:contents">
      <div className="inline-flex w-max rounded-md border border-slate-200 bg-white">
        <button className="rounded-l-md p-2 transition hover:bg-sky-50 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={updating} onClick={() => handleUpdate(item.quantity - 1)}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-3 py-2 font-black sm:px-4">{item.quantity}</span>
        <button className="rounded-r-md p-2 transition hover:bg-sky-50 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={updating} onClick={() => handleUpdate(item.quantity + 1)}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500" type="button" onClick={handleRemove} aria-label={`Remove ${item.name} from bag`}>
        <Trash2 className="h-5 w-5" />
      </button>
      </div>
    </div>
  )
}
