import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService } from '../api/services'
import { clearRecentlyViewed, readRecentlyViewed, RECENTLY_VIEWED_EVENT } from '../utils/recentlyViewed'
import { getProductImage, getProductPath } from '../utils/products'
import { formatPrice } from '../utils/format'

export default function RecentlyViewed({ labels }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setFailed(false)
      const results = await Promise.allSettled(readRecentlyViewed().map((id) => productService.get(id)))
      if (!active) return
      setProducts(results.filter((result) => result.status === 'fulfilled' && result.value.product).map((result) => result.value.product))
      setFailed(results.some((result) => result.status === 'rejected' && result.reason?.status !== 404))
      setLoading(false)
    }
    queueMicrotask(load)
    return () => { active = false }
  }, [version])

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1)
    window.addEventListener(RECENTLY_VIEWED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(RECENTLY_VIEWED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="recently-viewed-heading">
    <div className="flex items-center justify-between gap-3">
      <h2 id="recently-viewed-heading" className="flex items-center gap-2 text-lg font-bold text-brand-ink"><History className="h-5 w-5 text-brand-blue" />{labels.recent}</h2>
      {products.length > 0 && <button type="button" className="rounded-md p-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2" onClick={() => { try { clearRecentlyViewed() } catch { toast.error(labels.storageError) } }}>{labels.clear}</button>}
    </div>
    {loading ? <p role="status" className="py-8 text-sm text-slate-500">{labels.loading}</p> : products.length > 0 ? <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3">
      {products.map((product) => <Link key={product._id || product.id} to={getProductPath(product)} className="w-36 shrink-0 snap-start rounded-xl border border-slate-100 p-3 transition hover:border-sky-200 hover:bg-sky-50/40 focus-visible:outline focus-visible:outline-2 sm:w-44">
        {getProductImage(product) ? <img src={getProductImage(product)} alt={product.name} loading="lazy" className="h-28 w-full rounded-lg object-contain" /> : <span className="grid h-28 place-items-center rounded-lg bg-brand-mist text-sm text-brand-blue">BabyCure</span>}
        <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold text-brand-ink">{product.name}</p>
        <p className="mt-2 text-sm font-bold text-brand-blue">{formatPrice(product.price)}</p>
      </Link>)}
    </div> : !failed && <div className="py-7 text-center"><p className="text-sm text-slate-500">{labels.recentEmpty}</p><Link to="/category" className="mt-3 inline-block rounded-md px-3 py-2 text-sm font-bold text-brand-blue">{labels.browse}</Link></div>}
    {failed && <p role="status" className="mt-4 text-sm text-slate-500">{labels.recentError} <button type="button" onClick={() => setVersion((value) => value + 1)} className="font-semibold text-brand-blue">{labels.retry}</button></p>}
  </section>
}
