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
      className={`flex min-w-0 items-center rounded-full border border-sky-100 bg-white/95 px-4 shadow-[0_18px_48px_rgba(74,166,217,0.18),0_12px_34px_rgba(124,197,118,0.15),inset_0_0_0_1px_rgba(124,197,118,0.08)] transition duration-300 focus-within:-translate-y-0.5 focus-within:border-brand-green focus-within:bg-white focus-within:shadow-[0_24px_70px_rgba(74,166,217,0.26),0_18px_46px_rgba(124,197,118,0.22),inset_0_0_0_1px_rgba(74,166,217,0.14)] ${compact ? 'py-2.5' : 'py-2.5'} ${className}`}
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
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue text-white shadow-[0_12px_28px_rgba(74,166,217,0.20)] transition hover:scale-105 active:scale-95"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    </form>
  )
}

export default memo(SearchBar)
