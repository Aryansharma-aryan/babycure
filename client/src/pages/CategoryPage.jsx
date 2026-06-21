import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import FilterSidebar from '../components/FilterSidebar'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { ProductSkeleton } from '../components/Skeleton'
import { products } from '../data/products'
import { useProductFilters } from '../hooks/useProductFilters'

export default function CategoryPage() {
  const [params] = useSearchParams()
  const filters = useProductFilters(products)
  const { setCategory, setQuery } = filters

  useEffect(() => {
    if (params.get('category')) setCategory(params.get('category'))
    if (params.get('search')) setQuery(params.get('search'))
  }, [params, setCategory, setQuery])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Shop" title="Baby Care Collection" copy="Filter, search and sort premium Babycure products." backTo="/" backLabel="Back to home" />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <FilterSidebar filters={filters} />
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-500">Showing {filters.filteredProducts.length} products</p>
            <select className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm" value={filters.sort} onChange={(event) => filters.setSort(event.target.value)}>
              <option value="popular">Sort by: Popular</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filters.filteredProducts.length === 0 && Array.from({ length: 3 }).map((_, index) => <ProductSkeleton key={index} />)}
            {filters.filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
