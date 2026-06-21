import { memo } from 'react'
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

function FilterSidebar({ filters }) {
  return (
    <aside className="space-y-5">
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
    </aside>
  )
}

export default memo(FilterSidebar)
