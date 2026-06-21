import { ShoppingCart } from 'lucide-react'
import Button from './Button'

export default function EmptyCart() {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-md border border-slate-200 bg-white p-8 text-center shadow-soft">
      <div>
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue-50 text-brand-blue">
          <ShoppingCart className="h-10 w-10" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-black text-slate-950">Your cart is empty</h2>
        <p className="mt-3 max-w-md font-semibold leading-7 text-slate-500">
          Add gentle baby-care products and enjoy a smooth checkout experience.
        </p>
        <Button to="/category" className="mt-7">Shop Products</Button>
      </div>
    </div>
  )
}
