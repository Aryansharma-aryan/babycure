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
    <article className="group rounded-md border border-blue-100 bg-white p-4 shadow-[0_18px_55px_rgba(7,87,168,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_28px_85px_rgba(7,87,168,0.16)]">
      <Link to={`/product/${productId}`} className="block">
        <div className="relative grid h-56 place-items-center overflow-hidden rounded-md bg-[radial-gradient(circle_at_50%_30%,rgba(8,160,75,0.10),transparent_32%),linear-gradient(135deg,#f8fcff,#eef7ff)] ring-1 ring-blue-50">
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-brand-green shadow-[0_10px_24px_rgba(8,160,75,0.12)]">
            {product.isFeatured ? 'Featured' : product.brand || 'Babycure'}
          </span>
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <ProductArt type={product.type} color={product.color} />
          )}
        </div>
        <h3 className="mt-4 min-h-12 text-[15px] font-black leading-snug text-slate-950">{product.name}</h3>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-black text-slate-950">{formatPrice(product.price)}</p>
          <p className="text-xs font-bold text-slate-400 line-through">{formatPrice(mrp)}</p>
        </div>
        <Rating rating={rating} reviews={reviews} />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_46px] gap-2">
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
