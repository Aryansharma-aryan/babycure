import { SlidersHorizontal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { categoryService, productService } from '../api/services'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { useDebounce } from '../hooks/useDebounce'

const sortOptions = [
  ['-createdAt', 'Newest'],
  ['price', 'Price: Low to High'],
  ['-price', 'Price: High to Low'],
  ['-ratingsAverage', 'Top Rated'],
]

export default function CategoryPage() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState(params.get('search') || '')
  const debouncedSearch = useDebounce(search)

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      category: params.get('category') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sort: params.get('sort') || '-createdAt',
      page: Number(params.get('page') || 1),
      limit: 12,
    }),
    [debouncedSearch, params],
  )

  const updateParam = useCallback((key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }, [setParams])

  useEffect(() => {
    categoryService.list().then((response) => setCategories(response.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    productService
      .list(filters)
      .then((response) => {
        if (!active) return
        setProducts(response.products || [])
        setMeta({ total: response.total || 0, page: response.page || 1, pages: response.pages || 1 })
      })
      .catch((error) => toast.error(error.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [filters])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Shop" title="Baby Care Collection" copy="Search, filter and sort BabyCure products connected to your live backend." backTo="/" backLabel="Back to home" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <LiveFilterPanel categories={categories} filters={filters} search={search} setSearch={setSearch} updateParam={updateParam} />
        </aside>
        <div>
          <div className="sticky top-[132px] z-20 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-100 bg-white/95 p-3 shadow-[0_14px_40px_rgba(7,87,168,0.08)] backdrop-blur lg:top-32">
            <div>
              <p className="text-sm font-black text-slate-950">{meta.total} Products</p>
              <p className="text-xs font-bold text-slate-500">Fresh baby-care essentials</p>
            </div>
            <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-4 py-3 text-sm font-black text-brand-blue shadow-[0_10px_24px_rgba(7,87,168,0.08)] lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm" value={filters.sort} onChange={(event) => updateParam('sort', event.target.value)}>
              {sortOptions.map(([value, label]) => <option key={value} value={value}>Sort by: {label}</option>)}
            </select>
          </div>
          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="rounded-md border border-blue-100 bg-white p-10 text-center shadow-[0_18px_55px_rgba(7,87,168,0.08)]">
              <h2 className="font-display text-2xl font-black text-slate-950">No products found</h2>
              <p className="mt-2 font-semibold text-slate-500">Try a different category, price range, or search term.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          )}
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: meta.pages }, (_, index) => index + 1).slice(0, 6).map((page) => (
              <button key={page} type="button" onClick={() => updateParam('page', String(page))} className={`h-10 min-w-10 rounded-md px-3 text-sm font-black ${meta.page === page ? 'bg-brand-blue text-white' : 'border border-blue-100 bg-white text-brand-blue'}`}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-3 right-3 top-3 w-[min(92vw,390px)] overflow-y-auto rounded-[1.6rem] border border-sky-100 bg-white p-4 shadow-[0_30px_90px_rgba(74,166,217,0.24)]">
            <LiveFilterPanel categories={categories} filters={filters} search={search} setSearch={setSearch} updateParam={updateParam} />
          </div>
        </div>
      )}
    </section>
  )
}

function LiveFilterPanel({ categories, filters, search, setSearch, updateParam }) {
  return (
    <div className="sticky top-32 rounded-md border border-blue-100 bg-white p-5 shadow-[0_18px_55px_rgba(7,87,168,0.08)]">
      <h3 className="font-display text-xl font-black text-slate-950">Filters</h3>
      <label className="mt-5 block text-sm font-black text-slate-700">Search</label>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Baby wash, lotion..." className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue" />
      <label className="mt-5 block text-sm font-black text-slate-700">Category</label>
      <select value={filters.category} onChange={(event) => updateParam('category', event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue">
        <option value="">All Categories</option>
        {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
      </select>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-black text-slate-700">Min</label>
          <input value={filters.minPrice} onChange={(event) => updateParam('minPrice', event.target.value)} inputMode="numeric" className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-blue" />
        </div>
        <div>
          <label className="block text-sm font-black text-slate-700">Max</label>
          <input value={filters.maxPrice} onChange={(event) => updateParam('maxPrice', event.target.value)} inputMode="numeric" className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-blue" />
        </div>
      </div>
      <button type="button" onClick={() => { setSearch(''); updateParam('category', ''); updateParam('minPrice', ''); updateParam('maxPrice', '') }} className="mt-5 w-full rounded-md bg-green-50 px-4 py-3 text-sm font-black text-brand-green">
        Clear filters
      </button>
    </div>
  )
}
