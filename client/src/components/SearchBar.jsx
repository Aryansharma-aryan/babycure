import { Search } from 'lucide-react'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchBar({ compact = false, className = '' }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/category?search=${encodeURIComponent(trimmed)}` : '/category')
  }

  return (
    <form
      className={`flex min-w-0 items-center rounded-xl border border-slate-200 bg-[#f8fafb] px-3 transition duration-200 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-blue/10 ${compact ? 'py-1.5' : 'py-1.5'} ${className}`}
      onSubmit={handleSubmit}
    >
      <input
        className="min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold text-brand-ink outline-none"
        placeholder={compact ? 'Search baby care...' : 'Search gentle baby care products...'}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        type="submit"
        aria-label="Search products"
        className="grid h-8 w-8 shrink-0 place-items-center text-brand-blue transition hover:bg-brand-mist hover:text-brand-ink"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    </form>
  )
}

export default memo(SearchBar)
