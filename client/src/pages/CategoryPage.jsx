import { ChevronDown, Gift, SlidersHorizontal, Sparkles } from 'lucide-react'
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

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      category: params.get('category') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sort: params.get('sort') || '-createdAt',
      limit: 12,
    }),
    [debouncedSearch, params],
  )

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

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [filtersOpen])

  useEffect(() => {
    let active = true
    setLoading(true)
    productService
      .list({ ...filters, page: 1 })
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

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '500px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <section className="bg-white pb-10">
      <div className="overflow-hidden rounded-b-[1.2rem] bg-gradient-to-r from-brand-green via-brand-blue to-brand-green px-4 py-3 text-center text-sm font-extrabold text-white shadow-[0_18px_50px_rgba(74,166,217,0.18)]">
        <span className="inline-flex items-center gap-2">
          <Gift className="h-4 w-4" /> Buy 2 baby essentials and get gentle-care gifts with selected orders
        </span>
      </div>
      <div className="mx-auto max-w-[1320px] px-4 py-5">
        <CategoryChips categories={categories} activeCategory={filters.category} updateParam={updateParam} />
      </div>
      <div className="mx-auto grid max-w-[1320px] gap-6 px-4 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <LiveFilterPanel categories={categories} filters={filters} search={search} setSearch={setSearch} updateParam={updateParam} />
        </aside>
        <div>
          <div className="sticky top-[116px] z-20 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white/95 py-4 backdrop-blur lg:top-[142px]">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
              <p className="text-base font-extrabold text-brand-ink">
                Showing <span className="text-brand-blue">{meta.total}</span> Products
              </p>
              <label className="flex items-center gap-3 text-base font-extrabold text-brand-ink">
                Sort By:
                <select className="rounded-full border-0 bg-transparent py-2 pr-7 text-base font-extrabold text-brand-ink outline-none" value={filters.sort} onChange={(event) => updateParam('sort', event.target.value)}>
                  {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
            <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-brand-mist px-4 py-3 text-sm font-black text-brand-blue shadow-[0_10px_24px_rgba(74,166,217,0.12)] lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>
          {loading ? (
            <BabyCureLoader label="Loading baby care products..." />
          ) : products.length === 0 ? (
            <div className="rounded-md border border-blue-100 bg-white p-10 text-center shadow-[0_18px_55px_rgba(7,87,168,0.08)]">
              <h2 className="font-display text-2xl font-black text-slate-950">No products found</h2>
              <p className="mt-2 font-semibold text-slate-500">Try a different category, price range, or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
              <div ref={loadMoreRef} className="mt-8 min-h-16">
                {loadingMore && <ProductGridSkeleton count={3} />}
                {!loadingMore && meta.page >= meta.pages && products.length > 0 && (
                  <p className="rounded-full bg-sky-50 px-5 py-3 text-center text-sm font-black text-brand-blue">You have reached the end</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {filtersOpen && (
        <div className="baby-drawer-backdrop fixed inset-0 z-[80] h-dvh overflow-hidden lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-slate-950/40" onClick={() => setFiltersOpen(false)} />
          <div className="baby-drawer-panel fixed inset-y-0 right-0 flex h-dvh w-[min(92vw,410px)] flex-col overflow-hidden rounded-l-[1.6rem] border-l border-sky-100 bg-white shadow-[0_30px_90px_rgba(23,50,77,0.22)]">
            <div className="flex items-center justify-between border-b border-sky-100 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-green">BabyCure</p>
                <h2 className="font-display text-xl font-black text-brand-ink">Filters</h2>
              </div>
              <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-full bg-sky-50 px-4 py-2 text-sm font-black text-brand-blue">
                Close
              </button>
            </div>
            <div className="overflow-y-auto bg-white p-4">
              <LiveFilterPanel drawer categories={categories} filters={filters} search={search} setSearch={setSearch} updateParam={updateParam} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function CategoryChips({ categories, activeCategory, updateParam }) {
  const visibleCategories = categories.slice(0, 8)

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => updateParam('category', '')}
        className={`shrink-0 rounded-full px-9 py-3 text-lg font-extrabold transition ${!activeCategory ? 'bg-brand-green text-white shadow-[0_16px_38px_rgba(124,197,118,0.24)]' : 'border border-brand-ink/30 bg-white text-brand-ink hover:border-brand-blue hover:text-brand-blue'}`}
      >
        All ›
      </button>
      {visibleCategories.map((category) => (
        <button
          key={category._id}
          type="button"
          onClick={() => updateParam('category', category._id)}
          className={`shrink-0 rounded-full px-9 py-3 text-lg font-extrabold transition ${activeCategory === category._id ? 'bg-brand-blue text-white shadow-[0_16px_38px_rgba(74,166,217,0.24)]' : 'border border-brand-ink/30 bg-white text-brand-ink hover:border-brand-blue hover:text-brand-blue'}`}
        >
          {category.name} ›
        </button>
      ))}
    </div>
  )
}

function LiveFilterPanel({ categories, filters, search, setSearch, updateParam, drawer = false }) {
  return (
    <div className={`${drawer ? 'bg-white' : 'sticky top-[142px] rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_22px_70px_rgba(74,166,217,0.10)]'}`}>
      <div className="mb-5 flex items-center gap-3 text-base font-extrabold text-brand-ink">
        <span>Sort By:</span>
        <select className="flex-1 rounded-full border-0 bg-white py-2 text-base font-extrabold outline-none" value={filters.sort} onChange={(event) => updateParam('sort', event.target.value)}>
          {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <h3 className="border-b border-slate-200 pb-3 font-display text-2xl font-extrabold text-brand-ink">Filters</h3>
      <FilterBlock title="Search">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Baby wash, lotion..." className="w-full rounded-full border border-sky-100 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue" />
      </FilterBlock>
      <FilterBlock title="Category">
        <select value={filters.category} onChange={(event) => updateParam('category', event.target.value)} className="w-full rounded-full border border-sky-100 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue">
        <option value="">All Categories</option>
        {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
      </select>
      </FilterBlock>
      <FilterBlock title="Price">
        <div className="grid grid-cols-2 gap-3">
        <div>
          <input value={filters.minPrice} onChange={(event) => updateParam('minPrice', event.target.value)} inputMode="numeric" placeholder="Min" className="w-full rounded-full border border-sky-100 px-3 py-3 text-sm font-bold outline-none focus:border-brand-blue" />
        </div>
        <div>
          <input value={filters.maxPrice} onChange={(event) => updateParam('maxPrice', event.target.value)} inputMode="numeric" placeholder="Max" className="w-full rounded-full border border-sky-100 px-3 py-3 text-sm font-bold outline-none focus:border-brand-blue" />
        </div>
      </div>
      </FilterBlock>
      <FilterBlock title="Baby Concern">
        <p className="text-sm font-semibold text-slate-500">Dry skin, rash care, bath time, newborn safety</p>
      </FilterBlock>
      <button type="button" onClick={() => { setSearch(''); updateParam('category', ''); updateParam('minPrice', ''); updateParam('maxPrice', '') }} className="mt-5 w-full rounded-full bg-brand-leaf px-4 py-3 text-sm font-black text-brand-green transition hover:bg-green-100">
        Clear filters
      </button>
    </div>
  )
}

function FilterBlock({ title, children }) {
  return (
    <div className="border-b border-slate-200 py-5">
      <div className="mb-3 flex items-center justify-between text-lg font-extrabold text-brand-ink">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4" />
      </div>
      {children}
    </div>
  )
}
