import { ChevronDown, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { categoryService, productService } from '../api/services'
import ProductCard from '../components/ProductCard'
import { BabyCureLoader, ProductGridSkeleton } from '../components/Skeleton'
import { useDebounce } from '../hooks/useDebounce'

const sortOptions = [
  ['-createdAt', 'Newest'],
  ['price', 'Price: Low to High'],
  ['-price', 'Price: High to Low'],
  ['-ratingsAverage', 'Top Rated'],
]

const allowedCategoryNames = new Set([
  'Baby Shampoo',
  'Baby Body Wash',
  'Baby Lotion',
  'Baby Diaper Rash Cream',
  'Baby Massage Oil',
])

export default function CategoryPage() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState(params.get('search') || '')
  const loadMoreRef = useRef(null)
  const debouncedSearch = useDebounce(search)
  const visibleCategories = useMemo(() => categories.filter((category) => allowedCategoryNames.has(category.name)), [categories])
  const visibleProducts = useMemo(() => products.filter((product) => allowedCategoryNames.has(product.category?.name || product.categoryName)), [products])

  const filters = useMemo(() => ({
    search: debouncedSearch,
    category: params.get('category') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    sort: params.get('sort') || '-createdAt',
    limit: 12,
  }), [debouncedSearch, params])

  const updateParam = useCallback((key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }, [setParams])

  useEffect(() => {
    categoryService.list().then((response) => setCategories(response.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!filtersOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [filtersOpen])

  useEffect(() => {
    let active = true
    setLoading(true)
    productService.list({ ...filters, page: 1 })
      .then((response) => {
        if (!active) return
        setProducts(response.products || [])
        setMeta({ total: response.total || 0, page: response.page || 1, pages: response.pages || 1 })
      })
      .catch((error) => toast.error(error.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [filters])

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || meta.page >= meta.pages) return
    setLoadingMore(true)
    try {
      const nextPage = meta.page + 1
      const response = await productService.list({ ...filters, page: nextPage })
      setProducts((current) => [...current, ...(response.products || [])])
      setMeta({ total: response.total || 0, page: response.page || nextPage, pages: response.pages || 1 })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoadingMore(false)
    }
  }, [filters, loading, loadingMore, meta.page, meta.pages])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    }, { rootMargin: '500px 0px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <section className="bg-white pb-10">
      <div className="overflow-hidden rounded-b-[1.2rem] bg-gradient-to-r from-brand-green via-brand-blue to-brand-green px-4 py-3 text-center text-xs font-extrabold text-white shadow-[0_18px_50px_rgba(74,166,217,0.18)] sm:text-sm">
        <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Gentle everyday care, with free delivery above {'\u20B9'}799 and {'\u20B9'}60 delivery below.</span>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 pt-5">
        <div className="mb-5 flex items-end justify-between gap-4 lg:hidden">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-green">BabyCure shop</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-.04em] text-brand-ink">All collections</h1></div>
          <span className="rounded-full bg-brand-mist px-3 py-1.5 text-xs font-extrabold text-brand-blue">{meta.total} items</span>
        </div>
        <CategoryCards categories={visibleCategories} activeCategory={filters.category} updateParam={updateParam} />
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-5 px-4 pb-2 lg:grid-cols-[300px_1fr] lg:gap-6">
        <aside className="hidden lg:block"><LiveFilterPanel categories={visibleCategories} filters={filters} search={search} setSearch={setSearch} updateParam={updateParam} /></aside>
        <div>
          <div className="sticky top-[119px] z-20 mb-5 border border-sky-100 bg-white/95 p-3 shadow-[0_10px_30px_rgba(74,166,217,.08)] backdrop-blur lg:top-[142px] lg:border-x-0 lg:border-t-0 lg:p-0 lg:py-4 lg:shadow-none">
            <label className="mb-3 flex items-center gap-2 rounded-xl border border-sky-100 bg-slate-50 px-3 py-2.5 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-blue/10 lg:hidden">
              <Search className="h-4 w-4 shrink-0 text-brand-blue" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all collections" className="min-w-0 flex-1 bg-transparent text-sm font-bold text-brand-ink outline-none placeholder:text-slate-400" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="grid h-6 w-6 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-ink"><X className="h-4 w-4" /></button>}
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3"><p className="text-sm font-extrabold text-brand-ink sm:text-base"><span className="text-brand-blue">{meta.total}</span> products</p><button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-ink px-3 py-2 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(23,50,77,.18)] transition hover:bg-brand-blue lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters</button></div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-brand-ink sm:text-sm"><span className="hidden sm:inline">Sort by</span><select className="rounded-lg border border-sky-100 bg-white px-2.5 py-2 text-xs font-extrabold text-brand-ink outline-none focus:border-brand-blue sm:text-sm" value={filters.sort} onChange={(event) => updateParam('sort', event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
          </div>

          {loading ? <BabyCureLoader label="Loading baby care products..." /> : visibleProducts.length === 0 ? <EmptyResults /> : <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-x-7 lg:gap-y-8 xl:grid-cols-3">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div>
            <div ref={loadMoreRef} className="mt-8 min-h-16">{loadingMore && <ProductGridSkeleton count={3} />}{!loadingMore && meta.page >= meta.pages && visibleProducts.length > 0 && <p className="rounded-full bg-sky-50 px-5 py-3 text-center text-sm font-black text-brand-blue">You have reached the end</p>}</div>
          </>}
        </div>
      </div>

      {filtersOpen && <div className="baby-drawer-backdrop fixed inset-0 z-[80] h-dvh overflow-hidden lg:hidden"><button type="button" aria-label="Close filters" className="absolute inset-0 bg-slate-950/40" onClick={() => setFiltersOpen(false)} /><div className="mobile-filter-sheet fixed inset-x-0 bottom-0 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-[1.6rem] border-t border-sky-100 bg-white shadow-[0_-20px_70px_rgba(23,50,77,0.22)]"><div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-200" /><div className="flex items-center justify-between border-b border-sky-100 bg-white px-5 py-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-green">BabyCure</p><h2 className="font-display text-xl font-black text-brand-ink">Filters</h2></div><button type="button" onClick={() => setFiltersOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-sky-50 text-brand-blue" aria-label="Close filters"><X className="h-5 w-5" /></button></div><div className="overflow-y-auto bg-white p-4"><LiveFilterPanel drawer categories={visibleCategories} filters={filters} search={search} setSearch={setSearch} updateParam={updateParam} /></div><div className="border-t border-sky-100 bg-white p-4"><button type="button" onClick={() => setFiltersOpen(false)} className="w-full rounded-xl bg-brand-ink px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(23,50,77,.18)]">Show {meta.total} products</button></div></div></div>}
    </section>
  )
}

function CategoryCards({ categories, activeCategory, updateParam }) {
  const visibleCategories = categories.slice(0, 8)
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:gap-3 lg:overflow-x-auto lg:pb-2"><button type="button" onClick={() => updateParam('category', '')} className={`min-w-0 rounded-xl px-3 py-3 text-left text-sm font-extrabold transition lg:shrink-0 lg:rounded-full lg:px-6 lg:text-base ${!activeCategory ? 'bg-brand-green text-white shadow-[0_12px_28px_rgba(124,197,118,0.24)]' : 'border border-sky-100 bg-white text-brand-ink hover:border-brand-blue hover:text-brand-blue hover:shadow-[0_8px_18px_rgba(74,166,217,.10)]'}`}>All collections</button>{visibleCategories.map((category) => <button key={category._id} type="button" onClick={() => updateParam('category', category._id)} className={`min-w-0 rounded-xl px-3 py-3 text-left text-sm font-extrabold transition lg:shrink-0 lg:rounded-full lg:px-6 lg:text-base ${activeCategory === category._id ? 'bg-brand-blue text-white shadow-[0_12px_28px_rgba(74,166,217,0.24)]' : 'border border-sky-100 bg-white text-brand-ink hover:border-brand-blue hover:text-brand-blue hover:shadow-[0_8px_18px_rgba(74,166,217,.10)]'}`}>{category.name}</button>)}</div>
}

function LiveFilterPanel({ categories, filters, search, setSearch, updateParam, drawer = false }) {
  const clearFilters = () => { setSearch(''); updateParam('category', ''); updateParam('minPrice', ''); updateParam('maxPrice', '') }
  return <div className={drawer ? 'bg-white' : 'sticky top-[142px] rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_22px_70px_rgba(74,166,217,0.10)]'}>{!drawer && <div className="mb-5 flex items-center gap-3 text-base font-extrabold text-brand-ink"><span>Sort by</span><select className="flex-1 rounded-full border-0 bg-white py-2 text-base font-extrabold outline-none" value={filters.sort} onChange={(event) => updateParam('sort', event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}<h3 className="border-b border-slate-200 pb-3 font-display text-2xl font-extrabold text-brand-ink">{drawer ? 'Refine your selection' : 'Filters'}</h3><FilterBlock title="Search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Baby wash, lotion..." className="w-full rounded-xl border border-sky-100 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue" /></FilterBlock><FilterBlock title="Category">{drawer ? <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => updateParam('category', '')} className={`rounded-lg border px-3 py-2.5 text-left text-xs font-extrabold ${!filters.category ? 'border-brand-blue bg-brand-mist text-brand-blue' : 'border-slate-200 text-brand-ink'}`}>All collections</button>{categories.map((category) => <button key={category._id} type="button" onClick={() => updateParam('category', category._id)} className={`rounded-lg border px-3 py-2.5 text-left text-xs font-extrabold ${filters.category === category._id ? 'border-brand-blue bg-brand-mist text-brand-blue' : 'border-slate-200 text-brand-ink'}`}>{category.name}</button>)}</div> : <select value={filters.category} onChange={(event) => updateParam('category', event.target.value)} className="w-full rounded-xl border border-sky-100 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue"><option value="">All collections</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>}</FilterBlock><FilterBlock title="Price"><div className="grid grid-cols-2 gap-3"><input value={filters.minPrice} onChange={(event) => updateParam('minPrice', event.target.value)} inputMode="numeric" placeholder="Minimum" className="w-full rounded-xl border border-sky-100 px-3 py-3 text-sm font-bold outline-none focus:border-brand-blue" /><input value={filters.maxPrice} onChange={(event) => updateParam('maxPrice', event.target.value)} inputMode="numeric" placeholder="Maximum" className="w-full rounded-xl border border-sky-100 px-3 py-3 text-sm font-bold outline-none focus:border-brand-blue" /></div></FilterBlock><FilterBlock title="Baby concern"><p className="text-sm font-semibold leading-6 text-slate-500">Dry skin, rash care, bath time, newborn safety</p></FilterBlock><button type="button" onClick={clearFilters} className="mt-5 w-full rounded-xl bg-brand-leaf px-4 py-3 text-sm font-black text-brand-green transition hover:bg-green-100">Clear filters</button></div>
}

function FilterBlock({ title, children }) {
  return <div className="border-b border-slate-200 py-5"><div className="mb-3 flex items-center justify-between text-base font-extrabold text-brand-ink"><span>{title}</span><ChevronDown className="h-4 w-4" /></div>{children}</div>
}

function EmptyResults() {
  return <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-[0_18px_55px_rgba(7,87,168,0.08)]"><h2 className="font-display text-2xl font-black text-slate-950">No products found</h2><p className="mt-2 font-semibold text-slate-500">Try a different category, price range, or search term.</p></div>
}
