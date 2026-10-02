import { useEffect, useState } from 'react'
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
  const { items, loading, error, syncCart } = useCart()
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
      ) : error ? (
        <div role="alert" className="rounded-xl border border-slate-200 bg-white p-8 text-center"><p>{error}</p><Button onClick={syncCart} className="mt-4">Retry loading bag</Button></div>
      ) : items.length === 0 ? <EmptyCart /> : (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_360px] lg:gap-6">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">{items.map((item) => <CartItem key={item.id} item={item} />)}</div>
          <div className="space-y-4">
            {!isAuthenticated && <div className="rounded-xl border border-sky-100 bg-white p-5"><h2 className="font-bold text-brand-ink">Your bag is saved on this device</h2><p className="mt-2 text-sm text-slate-500">Login with your email and verify the OTP to save your bag to your account and place your order.</p></div>}
            <OrderSummary cta={isAuthenticated ? 'Proceed to Checkout' : 'Login with email to continue'} to={isAuthenticated ? '/checkout' : '/login'} state={{ from: '/cart' }} />
          </div>
        </div>
      )}
      {products.length > 0 && <div className="mt-10"><h2 className="mb-5 text-xl font-bold text-brand-ink">A little everyday care</h2><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product._id || product.id} product={product} />)}</div></div>}
    </section>
  )
}
