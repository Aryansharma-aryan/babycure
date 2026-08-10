import { Heart, ShoppingBag } from 'lucide-react'
import { memo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { productService, wishlistService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { getProductId, getProductImage } from '../utils/products'
import Rating from './Rating'
import shampooMomVisual from '../assets/about-babycure-family-v2.png'
import bathMomVisual from '../assets/about-mother-baby-care.png'
import productMomVisual from '../assets/babycure-hero-products.png'

const visualAssets = {
  pump: { src: shampooMomVisual, position: '58% 54%', size: 'cover' },
  lotion: { src: bathMomVisual, position: '68% 52%', size: 'cover' },
  tube: { src: productMomVisual, position: '68% 60%', size: 'cover' },
  wipes: { src: productMomVisual, position: '72% 60%', size: 'cover' },
  spray: { src: bathMomVisual, position: '70% 50%', size: 'cover' },
  powder: { src: shampooMomVisual, position: '60% 52%', size: 'cover' },
}

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
  const saving = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0
  const normalizedName = product.name?.toLowerCase() || ''
  const visualType = product.type
    || (normalizedName.includes('wipe') ? 'wipes' : normalizedName.includes('oil') ? 'spray' : normalizedName.includes('lotion') ? 'lotion' : normalizedName.includes('cream') ? 'tube' : normalizedName.includes('powder') ? 'powder' : 'pump')
  const visual = visualAssets[visualType] || visualAssets.pump

  const resolveProduct = async () => {
    if (/^[a-f\d]{24}$/i.test(productId || '')) return product
    const response = await productService.get(productId)
    return response.product
  }

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add products to your bag')
      navigate('/login')
      return
    }
    setBusy(true)
    try {
      await addToCart(await resolveProduct())
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
      const resolvedProduct = await resolveProduct()
      await wishlistService.toggleAdd(getProductId(resolvedProduct))
      toast.success('Saved to wishlist')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-[1.1rem] border border-slate-200/90 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-blue/35 hover:shadow-[0_20px_50px_rgba(23,50,77,0.12)] sm:rounded-none">
      <Link to={`/product/${productId}`} className="block">
        <div className="relative grid h-44 place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#fff_0%,#f4fafc_57%,#eaf7fb_100%)] sm:h-64 lg:h-80">
          <span className="absolute left-0 top-0 z-10 bg-brand-ink px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.11em] text-white sm:px-3 sm:py-1.5 sm:text-[10px]">{product.isFeatured ? 'Best seller' : product.tag || 'BabyCure care'}</span>
          {saving > 0 && <span className="absolute right-2 top-2 z-10 bg-white px-2 py-1 text-[8px] font-extrabold text-brand-green shadow-sm sm:right-3 sm:top-3 sm:px-2.5 sm:text-[10px]">Save {saving}%</span>}
          {image ? <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : <div role="img" aria-label={`${product.name} BabyCure product visual`} className="h-full w-full bg-no-repeat transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${visual.src})`, backgroundPosition: visual.position, backgroundSize: visual.size }} />}
        </div>
        <div className="px-3 pt-3 sm:px-5 sm:pt-5"><p className="hidden text-[10px] font-extrabold uppercase tracking-[.13em] text-brand-green sm:block">BabyCure essentials</p><h3 className="min-h-[2.65rem] text-[13px] font-extrabold leading-snug text-brand-ink sm:mt-2 sm:min-h-12 sm:text-[15px]">{product.name}</h3></div>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2 px-3 sm:mt-3 sm:gap-3 sm:px-5"><div><p className="text-base font-extrabold text-brand-ink sm:text-lg">{formatPrice(product.price)} {mrp > product.price && <span className="ml-1 hidden text-xs font-semibold text-slate-400 line-through sm:inline">{formatPrice(mrp)}</span>}</p></div><Link to={`/product/${productId}#reviews`} className="hidden rounded-sm bg-[#fff8e7] px-2 py-1 transition hover:bg-amber-100 sm:block" aria-label={`Read or write reviews for ${product.name}`}><Rating rating={rating} reviews={reviews} /></Link></div>
      <div className="grid grid-cols-[1fr_36px] gap-2 p-3 sm:grid-cols-[1fr_44px] sm:p-5"><button className="flex items-center justify-center gap-1.5 bg-brand-ink px-2 py-2.5 text-[11px] font-extrabold text-white transition duration-300 hover:bg-brand-blue disabled:opacity-60 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm" type="button" disabled={busy || product.stock === 0} onClick={handleAdd}>{product.stock === 0 ? 'Out of stock' : busy ? 'Adding...' : <><span className="sm:hidden">Add</span><span className="hidden sm:inline">Add to bag</span></>} <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button><button type="button" onClick={handleWishlist} className="grid h-10 place-items-center border border-slate-200 bg-white text-brand-ink transition hover:border-brand-green hover:bg-brand-leaf hover:text-brand-green sm:h-[44px]" aria-label="Add to wishlist"><Heart className="h-4 w-4 sm:h-5 sm:w-5" /></button></div>
    </article>
  )
}

export default memo(ProductCard)
