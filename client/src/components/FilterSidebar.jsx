import { memo } from 'react'
import { X } from 'lucide-react'
import { categories } from '../data/products'

function FilterControl({ label, value, onChange, options, text = false }) {
  return (
    <label className="block rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <span className="mb-3 block font-black text-slate-950">{label}</span>
      {text ? (
        <input
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-brand-blue focus:bg-white"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search products"
        />
      ) : (
        <select
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-brand-blue focus:bg-white"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>{optionLabel}</option>
          ))}
        </select>
      )}
    </label>
  )
}

function FilterSidebar({ filters, drawer = false, onClose }) {
  const resetFilters = () => {
    filters.setQuery('')
    filters.setCategory('all')
    filters.setPrice('all')
    filters.setRating('all')
    filters.setSort('popular')
  }

  return (
    <aside className={`${drawer ? 'h-full space-y-5 overflow-y-auto bg-white p-5' : 'sticky top-36 space-y-5 self-start'}`}>
      {drawer && (
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-green">Babycure</p>
            <h2 className="font-display text-2xl font-black text-slate-950">Filters</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-brand-blue shadow-[0_10px_24px_rgba(7,87,168,0.10)]"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      <FilterControl label="Search" value={filters.query} onChange={filters.setQuery} text />
      <FilterControl
        label="Category"
        value={filters.category}
        onChange={filters.setCategory}
        options={[['all', 'All Products'], ...categories.map((item) => [item.id, item.title])]}
      />
      <FilterControl
        label="Price"
        value={filters.price}
        onChange={filters.setPrice}
        options={[['all', 'All Prices'], ['0-250', 'Rs.0 - Rs.250'], ['251-400', 'Rs.251 - Rs.400'], ['401-700', 'Rs.401 - Rs.700']]}
      />
      <FilterControl
        label="Rating"
        value={filters.rating}
        onChange={filters.setRating}
        options={[['all', 'All Ratings'], ['4.5', '4.5 & above'], ['4', '4 & above']]}
      />
      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-md border border-brand-green bg-white px-4 py-3 text-sm font-black text-brand-green shadow-[0_10px_26px_rgba(8,160,75,0.08)] transition hover:-translate-y-0.5 hover:bg-green-50"
      >
        Reset filters
      </button>
    </aside>
  )
}

export default memo(FilterSidebar)
