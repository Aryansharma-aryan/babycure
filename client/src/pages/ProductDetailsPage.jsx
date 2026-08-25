import { BadgeCheck, ChevronDown, Heart, Minus, Plus, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { productService, wishlistService } from '../api/services'
import Button from '../components/Button'
import FeatureCard from '../components/FeatureCard'
import PageHeader from '../components/PageHeader'
import ProductArt from '../components/ProductArt'
import Rating from '../components/Rating'
import { PageSkeleton } from '../components/Skeleton'
import { features } from '../data/products'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { getProductImage } from '../utils/products'
import { resolveMediaUrl } from '../api/client'

export default function ProductDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [activeImage, setActiveImage] = useState('')
  const [activeDetail, setActiveDetail] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([productService.get(id), productService.reviews(id).catch(() => ({ reviews: [] }))])
      .then(([productResponse, reviewsResponse]) => {
        if (!active) return
        setProduct(productResponse.product)
        setReviews(reviewsResponse.reviews || [])
        setActiveImage(getProductImage(productResponse.product))
      })
      .catch(() => setMissing(true))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (loading || location.hash !== '#reviews') return
    window.setTimeout(() => {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }, [loading, location.hash])

  const images = useMemo(() => (product?.images || []).map((image) => ({ ...image, url: resolveMediaUrl(image.url) })), [product])

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add products to your bag')
      navigate('/login')
      return
    }
    try {
      await addToCart(product, quantity)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }
    try {
      await addToCart(product, quantity)
      navigate('/checkout')
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <PageSkeleton />
  if (missing || !product) return <Navigate to="/category" replace />

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Product Detail" title={product.name} copy={product.shortDescription || 'Premium baby-care detail with gallery, quantity selector and safe checkout.'} backTo="/category" backLabel="Continue shopping" />
      <div className="grid gap-10 rounded-md border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-5 sm:grid-cols-[88px_1fr]">
          <div className="flex gap-3 sm:block">
            {images.length > 0 ? images.map((image) => (
              <button key={image.url} onClick={() => setActiveImage(image.url)} className="mb-3 grid h-20 w-20 place-items-center rounded-md border border-slate-200 bg-white p-2" type="button">
                <img src={image.url} alt={product.name} className="h-full w-full object-contain" loading="lazy" />
              </button>
            )) : (
              <button className="mb-3 grid h-20 w-20 place-items-center rounded-md border border-slate-200 bg-white" type="button"><ProductArt /></button>
            )}
          </div>
          <div className="grid min-h-[520px] place-items-center rounded-md bg-gradient-to-br from-blue-50 via-white to-green-50">
            {activeImage ? <img src={activeImage} alt={product.name} className="max-h-[500px] w-full object-contain p-8" loading="eager" fetchPriority="high" decoding="async" /> : <ProductArt large />}
          </div>
        </div>
        <div className="py-4">
          <p className="mb-3 inline-flex rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-green">{product.brand || 'Babycure'}</p>
          <h2 className="font-display text-4xl font-black text-slate-950">{product.name}</h2>
          <div className="mt-4"><Rating rating={product.ratingsAverage || 0} reviews={product.ratingsQuantity || 0} /></div>
          <div className="mt-5 flex items-end gap-3">
            <p className="text-4xl font-black text-slate-950">{formatPrice(product.price)}</p>
            {product.mrp > product.price && <p className="pb-1 font-bold text-slate-400 line-through">{formatPrice(product.mrp)}</p>}
          </div>
          <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">{product.shortDescription || 'Gentle everyday care made for your baby.'}</p>
          <ProductDetailsTabs product={product} activeDetail={activeDetail} setActiveDetail={setActiveDetail} />
          <div className="mt-7">
            <p className="mb-2 text-sm font-black text-slate-900">Quantity</p>
            <div className="inline-flex rounded-md border border-slate-200 bg-white">
              <button className="p-3" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="h-4 w-4" /></button>
              <span className="px-5 py-3 font-black">{quantity}</span>
              <button className="p-3" type="button" onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}><Plus className="h-4 w-4" /></button>
            </div>
            <p className={`mt-2 text-sm font-bold ${product.stock > 0 ? 'text-brand-green' : 'text-red-500'}`}>{product.stock > 0 ? 'In stock' : 'Out of stock'}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-4">
            <Button onClick={handleAdd} disabled={!product.stock}>Add to Bag</Button>
            <Button variant="green" onClick={handleBuyNow} disabled={!product.stock}>Buy Now</Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Please login to save wishlist')
                  navigate('/login')
                  return
                }
                wishlistService.toggleAdd(product._id).then(() => toast.success('Saved to wishlist')).catch((error) => toast.error(error.message))
              }}
            >
              <Heart className="h-5 w-5" /> Wishlist
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
      </div>
      <Reviews product={product} reviews={reviews} setReviews={setReviews} canReview={isAuthenticated} />
    </section>
  )
}

function ProductDetailsTabs({ product, activeDetail, setActiveDetail }) {
  const sections = [
    ['description', 'Description', product.description],
    ['comboItems', 'Combo Includes', product.comboItems?.length ? `<ul>${product.comboItems.map((item) => `<li>${escapeProductText(item)}</li>`).join('')}</ul>` : ''],
    ['keyFeatures', 'Key Features', product.keyFeatures],
    ['specifications', 'Specifications', product.specifications],
    ['benefits', 'Benefits', product.benefits],
    ['howToUse', 'How To Use', product.howToUse],
  ]
  // Always show the five buttons; show placeholder when content missing
  const hasAny = sections.some(([, , content]) => !!content)
  if (!hasAny) {
    // still render buttons but with placeholders
  }
  const selected = sections.find(([key]) => key === activeDetail)
  return (
    <div className="mt-5 max-w-xl border-t border-slate-200 pt-4">
      <div className="flex flex-wrap gap-2">
        {sections.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveDetail(activeDetail === key ? '' : key)}
            className={`rounded-lg px-3 py-2 text-sm font-extrabold transition ${activeDetail === key ? 'bg-brand-ink text-white' : 'bg-sky-50 text-brand-ink hover:bg-brand-mist'}`}
          >
            {label}
            <ChevronDown className={`ml-1 inline h-4 w-4 transition-transform ${activeDetail === key ? 'rotate-180' : ''}`} />
          </button>
        ))}
      </div>
      {selected && (
        <div className="product-rich-text break-words px-1 pt-4 text-base font-medium leading-8 text-slate-600">
          {selected[2] ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(selected[2]) }} />
          ) : (
            <p className="text-sm font-medium text-slate-500">Information not provided for this product.</p>
          )}
        </div>
      )}
    </div>
  )
}

function escapeProductText(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character])
}

function sanitizeProductHtml(value) {
  if (typeof window === 'undefined') return String(value || '')
  const documentNode = new DOMParser().parseFromString(String(value || ''), 'text/html')
  documentNode.querySelectorAll('script, style, iframe, object, embed').forEach((element) => element.remove())
  documentNode.querySelectorAll('*').forEach((element) => [...element.attributes].forEach((attribute) => {
    if (attribute.name.startsWith('on') || attribute.name === 'style' || (attribute.name === 'href' && !/^https?:|^mailto:/i.test(attribute.value))) element.removeAttribute(attribute.name)
  }))
  return documentNode.body.innerHTML
}

function Reviews({ product, reviews, setReviews, canReview }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const submitReview = async (event) => {
    event.preventDefault()
    if (!canReview) return toast.error('Please login to review this product')
    if (!comment.trim()) return toast.error('Please write a short review')
    try {
      await productService.createReview(product._id, { rating, comment })
      const response = await productService.reviews(product._id)
      setReviews(response.reviews || [])
      setComment('')
      toast.success('Review submitted')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div id="reviews" className="mt-8 scroll-mt-32 grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submitReview} className="rounded-md border border-blue-100 bg-white p-6 shadow-[0_18px_55px_rgba(7,87,168,0.08)]">
        <h3 className="font-display text-2xl font-black text-slate-950">Write a review</h3>
        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((item) => (
            <button type="button" key={item} onClick={() => setRating(item)} className={item <= rating ? 'text-yellow-400' : 'text-slate-300'}>
              <Star className="h-6 w-6 fill-current" />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows="4" className="mt-4 w-full rounded-md border border-slate-200 p-4 text-sm font-semibold outline-none focus:border-brand-blue" placeholder="Share your experience" />
        <Button type="submit" className="mt-4 w-full">Submit Review</Button>
      </form>
      <div className="rounded-md border border-blue-100 bg-white p-6 shadow-[0_18px_55px_rgba(7,87,168,0.08)]">
        <h3 className="font-display text-2xl font-black text-slate-950">Customer reviews</h3>
        <div className="mt-5 space-y-4">
          {reviews.length === 0 ? <p className="font-semibold text-slate-500">No reviews yet.</p> : reviews.map((review) => (
            <div key={review._id} className="rounded-md bg-blue-50/60 p-4">
              <Rating rating={review.rating} reviews={0} />
              <p className="mt-2 font-bold text-slate-700">{review.comment}</p>
              <p className="mt-1 text-xs font-black text-brand-blue">{review.user?.name || 'BabyCure customer'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
