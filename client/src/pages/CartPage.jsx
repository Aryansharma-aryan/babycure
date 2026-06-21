import CartItem from '../components/CartItem'
import EmptyCart from '../components/EmptyCart'
import OrderSummary from '../components/OrderSummary'
import PageHeader from '../components/PageHeader'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
  const { items } = useCart()

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Cart" title="Your Cart" copy="Review products, quantity and delivery savings before checkout." backTo="/category" backLabel="Continue shopping" />
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
            {items.map((item) => <CartItem key={item.id} item={item} />)}
          </div>
          <OrderSummary cta="Proceed to Checkout" to="/checkout" />
        </div>
      )}
    </section>
  )
}
