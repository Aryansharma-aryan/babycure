import { ChevronDown, CircleUserRound, Menu, ShoppingCart, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { categories } from '../data/products'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import Logo from './Logo'
import SearchBar from './SearchBar'

const navLinks = [
  ['Home', '/'],
  ['Baby Care', '/category'],
  ['Blog', '/blog'],
  ['Contact', '/contact'],
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount, totals } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="bg-brand-blue px-4 py-2 text-center text-[13px] font-extrabold text-white">
        <Sparkles className="mr-2 inline h-4 w-4" />
        Premium baby care, gentle by nature and pure by care
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-5">
        <Logo />
        <Link to="/category" className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-brand-blue hover:text-brand-blue md:flex">
          All Categories <ChevronDown className="h-4 w-4" />
        </Link>
        <SearchBar className="hidden flex-1 sm:flex" />
        <Link to="/login" className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold text-slate-800 transition hover:bg-blue-50 lg:flex">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-brand-blue shadow-[0_10px_24px_rgba(7,87,168,0.12)]">
            <CircleUserRound className="h-5 w-5" />
          </span>
          Login / Register
        </Link>
        <Link to="/cart" className="relative flex items-center gap-2 rounded-md px-2 py-2 text-sm font-extrabold text-slate-800 transition hover:bg-blue-50">
          <span className="relative grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-brand-blue shadow-[0_10px_24px_rgba(7,87,168,0.12)]">
            <ShoppingCart className="h-[22px] w-[22px]" />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-green text-[11px] text-white shadow-[0_8px_18px_rgba(8,160,75,0.24)]">{cartCount}</span>}
          </span>
          <span className="hidden sm:block leading-tight">
            Cart ({cartCount})<br />{formatPrice(totals.total)}
          </span>
        </Link>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-brand-blue shadow-[0_10px_24px_rgba(7,87,168,0.10)] lg:hidden" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div className="mx-auto block max-w-7xl px-4 pb-4 sm:hidden">
        <SearchBar compact />
      </div>
      <nav className="mx-auto hidden max-w-7xl items-center justify-between px-4 pb-3 text-sm font-extrabold text-slate-700 lg:flex">
        {navLinks.map(([label, to]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-md px-4 py-2 transition ${isActive ? 'bg-brand-blue text-white shadow-lg shadow-blue-100' : 'hover:bg-blue-50 hover:text-brand-blue'}`}>
            {label}
          </NavLink>
        ))}
        {categories.slice(1, 5).map((category) => (
          <Link key={category.id} to={`/category?category=${category.id}`} className="hover:text-brand-blue">
            {category.title}
          </Link>
        ))}
        <Link to="/checkout" className="rounded-md bg-green-50 px-4 py-2 text-brand-green">Checkout</Link>
      </nav>
      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navLinks.map(([label, to]) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `rounded-md px-4 py-3 text-sm font-black ${isActive ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-800'}`}>
                {label}
              </NavLink>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link onClick={() => setMenuOpen(false)} to="/login" className="rounded-md border border-slate-200 px-4 py-3 text-center text-sm font-black text-brand-blue">Account</Link>
              <Link onClick={() => setMenuOpen(false)} to="/checkout" className="rounded-md bg-brand-green px-4 py-3 text-center text-sm font-black text-white">Checkout</Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-blue-50 pt-3">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  onClick={() => setMenuOpen(false)}
                  to={`/category?category=${category.id}`}
                  className="rounded-md bg-blue-50 px-4 py-3 text-sm font-black text-brand-blue"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
