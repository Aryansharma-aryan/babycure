import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import Button from './Button'

function SummaryLine({ label, value, positive = false, strong = false }) {
  return (
    <div className={`mb-3 flex justify-between ${strong ? 'text-lg font-black text-slate-950' : 'text-sm font-bold text-slate-600'}`}>
      <span>{label}</span>
      <span className={positive ? 'text-brand-green' : 'text-slate-950'}>{value}</span>
    </div>
  )
}

export default function OrderSummary({ cta, to }) {
  const { totals, items } = useCart()

  return (
    <aside className="h-max rounded-md border border-slate-200 bg-white p-6 shadow-soft">
      <h3 className="mb-5 font-display text-2xl font-black text-slate-950">Order Summary</h3>
      <SummaryLine label="Subtotal" value={formatPrice(totals.subtotal)} />
      <SummaryLine label="Shipping" value={totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)} />
      <SummaryLine label="Discount" value={`-${formatPrice(totals.discount)}`} positive />
      <div className="mt-5 border-t border-slate-200 pt-5">
        <SummaryLine label="Total" value={formatPrice(totals.total)} strong />
      </div>
      {cta && (
        <Button to={to} className="mt-5 w-full">
          {cta}
        </Button>
      )}
      {items.length > 0 && (
        <p className="mt-3 text-center text-xs font-bold text-slate-500">
          {totals.shipping === 0 ? 'Free shipping applied' : 'You are close to free shipping'}
        </p>
      )}
      {items.length === 0 && (
        <Link to="/category" className="mt-4 block text-center text-sm font-black text-brand-blue">
          Browse baby care products
        </Link>
      )}
    </aside>
  )
}
