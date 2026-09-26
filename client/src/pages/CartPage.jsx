import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { productService } from '../api/services'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import CartItem from '../components/CartItem'
import EmptyCart from '../components/EmptyCart'
import OrderSummary from '../components/OrderSummary'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
  const { items, loading } = useCart()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [products, setProducts] = useState([])
  useEffect(() => {
    let active = true
    productService.list({ limit: 4 }).then((response) => { if (active) setProducts(response.products || []) }).catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
      <PageHeader eyebrow="Shopping bag" title="Your Bag" copy="Review products, quantity and delivery savings before checkout." backTo="/category" backLabel="Continue shopping" />
      {authLoading || loading ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center font-semibold text-brand-blue">Loading your bag…</div>
      ) : !isAuthenticated ? (
        <div className="rounded-2xl border border-sky-100 bg-white px-5 py-10 text-center shadow-sm">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-mist text-brand-blue"><ShoppingBag className="h-8 w-8" /></span>
          <h2 className="mt-5 text-2xl font-bold text-brand-ink">Your saved bag is waiting</h2>
          <p className="mt-3 text-sm text-slate-500">Login with your email to see your products and pick up where you left off.</p>
          <Button to="/login" state={{ from: '/cart' }} className="mt-6 min-w-48">Login</Button>
          <div className="mt-4"><Button to="/category" variant="ghost">Continue shopping</Button></div>
        </div>
      ) : items.length === 0 ? <EmptyCart /> : (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_360px] lg:gap-6">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">{items.map((item) => <CartItem key={item.id} item={item} />)}</div>
          <OrderSummary cta="Proceed to Checkout" to="/checkout" />
        </div>
      )}
      {products.length > 0 && <div className="mt-10"><h2 className="mb-5 text-xl font-bold text-brand-ink">A little everyday care</h2><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product._id || product.id} product={product} />)}</div></div>}
    </section>
  )
}
