import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { wishlistService } from '../api/services'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { getProductImage } from '../utils/products'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadWishlist = useCallback(async () => {
    setLoading(true)
    try {
      const response = await wishlistService.get()
      setProducts(response.wishlist?.products || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('Please login to view wishlist')
      navigate('/login')
      return
    }
    loadWishlist()
  }, [authLoading, isAuthenticated, loadWishlist, navigate])

  const removeItem = async (productId) => {
    try {
      const response = await wishlistService.remove(productId)
      setProducts(response.wishlist?.products || [])
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const clearWishlist = async () => {
    try {
      const response = await wishlistService.clear()
      setProducts(response.wishlist?.products || [])
      toast.success('Wishlist cleared')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const moveToCart = async (product) => {
    try {
      await addToCart(product, 1)
      await removeItem(product._id)
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (authLoading || loading) return <PageSkeleton />

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Saved Products" title="Your Wishlist" copy="Products you love are saved here for quick shopping later." backTo="/category" backLabel="Continue shopping" />

      {products.length === 0 ? (
        <div className="grid min-h-[420px] place-items-center rounded-[2rem] border border-sky-100 bg-white p-8 text-center shadow-soft">
          <div>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-leaf text-brand-green">
              <Heart className="h-10 w-10" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold text-brand-ink">Wishlist is empty</h2>
            <p className="mt-3 max-w-md font-semibold leading-7 text-slate-500">
              Tap the heart on any product and it will appear here.
            </p>
            <Button to="/category" className="mt-7">Shop Products</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 flex justify-end">
            <Button variant="ghost" onClick={clearWishlist}>
              <Trash2 className="h-4 w-4" /> Clear Wishlist
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product._id} className="group rounded-[1.6rem] border border-sky-100 bg-white p-4 shadow-[0_18px_60px_rgba(74,166,217,0.10)] transition duration-300 hover:-translate-y-1.5 hover:shadow-premium">
                <Link to={`/product/${product._id}`} className="block">
                  <div className="grid h-56 place-items-center overflow-hidden rounded-[1.3rem] bg-gradient-to-br from-sky-50 to-green-50">
                    {getProductImage(product) ? (
                      <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <Heart className="h-12 w-12 text-brand-green" />
                    )}
                  </div>
                  <h3 className="mt-4 min-h-12 text-[15px] font-black leading-snug text-brand-ink">{product.name}</h3>
                </Link>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-brand-ink">{formatPrice(product.price)}</p>
                    {product.mrp > product.price && <p className="text-xs font-bold text-slate-400 line-through">{formatPrice(product.mrp)}</p>}
                  </div>
                  <p className="rounded-full bg-brand-leaf px-3 py-1 text-xs font-black text-brand-green">{product.stock > 0 ? 'In Stock' : 'Out'}</p>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_46px] gap-2">
                  <button
                    type="button"
                    disabled={product.stock === 0}
                    onClick={() => moveToCart(product)}
                    className="flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(74,166,217,0.24)] transition duration-300 hover:-translate-y-1 hover:bg-sky-500 disabled:opacity-60"
                  >
                    Add to Cart <ShoppingCart className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => removeItem(product._id)} className="grid h-[46px] place-items-center rounded-full bg-red-50 text-red-500 transition hover:-translate-y-1 hover:bg-red-100" aria-label="Remove from wishlist">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
