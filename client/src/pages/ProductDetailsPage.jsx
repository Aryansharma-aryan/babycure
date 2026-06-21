import { BadgeCheck, Minus, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import FeatureCard from '../components/FeatureCard'
import PageHeader from '../components/PageHeader'
import ProductArt from '../components/ProductArt'
import Rating from '../components/Rating'
import { useCart } from '../hooks/useCart'
import { features, products } from '../data/products'
import { formatPrice } from '../utils/format'

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const product = useMemo(() => products.find((item) => item.id === id), [id])

  if (!product) return <Navigate to="/category" replace />

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Product Detail" title={product.name} copy="Premium detail page with gallery, quantity selector and purchase actions." backTo="/category" backLabel="Continue shopping" />
      <div className="grid gap-10 rounded-md border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-5 sm:grid-cols-[88px_1fr]">
          <div className="flex gap-3 sm:block">
            {[product, ...products.filter((item) => item.id !== product.id).slice(0, 2)].map((item) => (
              <button key={item.id} className="mb-3 grid h-20 w-20 place-items-center rounded-md border border-slate-200 bg-white" type="button">
                <ProductArt type={item.type} color={item.color} />
              </button>
            ))}
          </div>
          <div className="grid min-h-[520px] place-items-center rounded-md bg-gradient-to-br from-blue-50 via-white to-green-50">
            <ProductArt type={product.type} color={product.color} large />
          </div>
        </div>
        <div className="py-4">
          <p className="mb-3 inline-flex rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-green">{product.tag}</p>
          <h2 className="font-display text-4xl font-black text-slate-950">{product.name}</h2>
          <div className="mt-4"><Rating rating={product.rating} reviews={product.reviews} /></div>
          <div className="mt-5 flex items-end gap-3">
            <p className="text-4xl font-black text-slate-950">{formatPrice(product.price)}</p>
            <p className="pb-1 font-bold text-slate-400 line-through">{formatPrice(product.oldPrice)}</p>
          </div>
          <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">{product.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {product.benefits.map((item) => (
              <p key={item} className="flex items-center gap-2 font-bold text-slate-700"><BadgeCheck className="h-5 w-5 text-brand-green" /> {item}</p>
            ))}
          </div>
          <div className="mt-7">
            <p className="mb-2 text-sm font-black text-slate-900">Quantity</p>
            <div className="inline-flex rounded-md border border-slate-200 bg-white">
              <button className="p-3" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="h-4 w-4" /></button>
              <span className="px-5 py-3 font-black">{quantity}</span>
              <button className="p-3" type="button" onClick={() => setQuantity((value) => value + 1)}><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-4">
            <Button onClick={() => addToCart(product, quantity)}>Add to Cart</Button>
            <Button variant="green" onClick={() => { addToCart(product, quantity); navigate('/checkout') }}>Buy Now</Button>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
      </div>
    </section>
  )
}
