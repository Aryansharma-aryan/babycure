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
      className={`flex min-w-0 items-center rounded-full border border-sky-100 bg-white/95 px-4 shadow-[0_16px_42px_rgba(74,166,217,0.16),0_8px_24px_rgba(124,197,118,0.10)] transition duration-300 focus-within:-translate-y-0.5 focus-within:border-brand-blue focus-within:bg-white focus-within:shadow-[0_22px_58px_rgba(74,166,217,0.22),0_12px_30px_rgba(124,197,118,0.16)] ${compact ? 'py-2.5' : 'py-2.5'} ${className}`}
      onSubmit={handleSubmit}
    >
      <input
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
        placeholder={compact ? 'Search baby care...' : 'Search gentle baby care products...'}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        type="submit"
        aria-label="Search products"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-leaf text-brand-green shadow-[0_10px_24px_rgba(124,197,118,0.18)] transition hover:scale-105 hover:bg-brand-green hover:text-white active:scale-95"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    </form>
  )
}

export default memo(SearchBar)
