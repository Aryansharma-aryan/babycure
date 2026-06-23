import CartItem from '../components/CartItem'
import EmptyCart from '../components/EmptyCart'
import OrderSummary from '../components/OrderSummary'
import PageHeader from '../components/PageHeader'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
  const { items, loading } = useCart()

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
      <PageHeader eyebrow="Cart" title="Your Cart" copy="Review products, quantity and delivery savings before checkout." backTo="/category" backLabel="Continue shopping" />
      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center font-black text-brand-blue shadow-soft">Loading your cart...</div>
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_360px] lg:gap-6">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
            {items.map((item) => <CartItem key={item.id} item={item} />)}
          </div>
          <OrderSummary cta="Proceed to Checkout" to="/checkout" />
        </div>
      )}
    </section>
  )
}
