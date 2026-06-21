import { useEffect, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import FilterSidebar from '../components/FilterSidebar'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import { useProductFilters } from '../hooks/useProductFilters'

export default function CategoryPage() {
  const [params] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filters = useProductFilters(products)
  const { setCategory, setQuery } = filters

  useEffect(() => {
    if (params.get('category')) setCategory(params.get('category'))
    if (params.get('search')) setQuery(params.get('search'))
  }, [params, setCategory, setQuery])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Shop" title="Baby Care Collection" copy="Filter, search and sort premium Babycure products." backTo="/" backLabel="Back to home" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} />
        </div>
        <div>
          <div className="sticky top-[132px] z-20 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-100 bg-white/95 p-3 shadow-[0_14px_40px_rgba(7,87,168,0.08)] backdrop-blur lg:top-32">
            <div>
              <p className="text-sm font-black text-slate-950">{filters.filteredProducts.length} Products</p>
              <p className="text-xs font-bold text-slate-500">Gentle baby-care essentials</p>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-4 py-3 text-sm font-black text-brand-blue shadow-[0_10px_24px_rgba(7,87,168,0.08)] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm" value={filters.sort} onChange={(event) => filters.setSort(event.target.value)}>
              <option value="popular">Sort by: Popular</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          {filters.filteredProducts.length === 0 ? (
            <div className="rounded-md border border-blue-100 bg-white p-10 text-center shadow-[0_18px_55px_rgba(7,87,168,0.08)]">
              <h2 className="font-display text-2xl font-black text-slate-950">No products found</h2>
              <p className="mt-2 font-semibold text-slate-500">Try a different category, price range, rating, or search term.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filters.filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>
      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute bottom-0 right-0 top-0 w-[min(90vw,380px)] border-l border-blue-100 bg-white shadow-[0_30px_90px_rgba(7,87,168,0.24)]">
            <FilterSidebar filters={filters} drawer onClose={() => setFiltersOpen(false)} />
          </div>
        </div>
      )}
    </section>
  )
}
