import { Heart, ShoppingCart } from 'lucide-react'
import { memo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { wishlistService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { getProductId, getProductImage } from '../utils/products'
import ProductArt from './ProductArt'
import Rating from './Rating'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const productId = getProductId(product)
  const image = getProductImage(product)
  const rating = product.ratingsAverage || product.rating || 0
  const reviews = product.ratingsQuantity || product.reviews || 0
  const mrp = product.mrp || product.oldPrice || product.price

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add products to cart')
      navigate('/login')
      return
    }
    setBusy(true)
    try {
      await addToCart(product)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save wishlist')
      navigate('/login')
      return
    }
    try {
      await wishlistService.toggleAdd(productId)
      toast.success('Saved to wishlist')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <article className="group overflow-hidden rounded-[1.2rem] border border-sky-100 bg-white shadow-[0_18px_55px_rgba(74,166,217,0.10)] transition duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-[0_28px_85px_rgba(74,166,217,0.18)]">
      <Link to={`/product/${productId}`} className="block">
        <div className="relative grid h-72 place-items-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),transparent_9rem),linear-gradient(135deg,#eaf8ff,#f6fff4_45%,#fff3d8)]">
          <span className="absolute left-0 top-0 rounded-br-xl bg-white/92 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-green shadow-[0_10px_24px_rgba(124,197,118,0.14)]">
            {product.isFeatured ? 'Bestseller ★' : 'Babycure ★'}
          </span>
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <ProductArt type={product.type} color={product.color} />
          )}
        </div>
        <div className="px-4 pt-4">
          <span className="rounded-md bg-brand-mist px-2 py-1 text-[11px] font-extrabold text-brand-ink">All Baby Types</span>
          <h3 className="mt-3 min-h-12 text-[15px] font-black leading-snug text-brand-ink">{product.name}</h3>
        </div>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-3 px-4">
        <div>
          <p className="text-lg font-black text-brand-ink">{formatPrice(product.price)}</p>
          <p className="text-xs font-bold text-slate-400 line-through">{formatPrice(mrp)}</p>
        </div>
        <Rating rating={rating} reviews={reviews} />
      </div>
      <div className="grid grid-cols-[1fr_46px] gap-2 p-4">
        <button
          className="flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(74,166,217,0.24)] transition duration-300 hover:-translate-y-1 hover:bg-sky-500 hover:shadow-[0_22px_54px_rgba(74,166,217,0.30)] active:translate-y-0 disabled:opacity-60"
          type="button"
          disabled={busy || product.stock === 0}
          onClick={handleAdd}
        >
          {product.stock === 0 ? 'Out of Stock' : busy ? 'Adding...' : 'Add to Cart'} <ShoppingCart className="h-4 w-4" />
        </button>
        <button type="button" onClick={handleWishlist} className="grid h-[46px] place-items-center rounded-full border border-green-100 bg-green-50 text-brand-green shadow-[0_12px_30px_rgba(124,197,118,0.10)] transition duration-300 hover:-translate-y-1 hover:bg-brand-leaf hover:shadow-[0_18px_44px_rgba(124,197,118,0.18)]" aria-label="Add to wishlist">
          <Heart className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}

export default memo(ProductCard)
