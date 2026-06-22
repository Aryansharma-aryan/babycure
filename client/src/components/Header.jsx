import { ChevronDown, CircleUserRound, Heart, Menu, PackageCheck, Search, ShoppingCart, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { categories } from '../data/products'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import Logo from './Logo'
import SearchBar from './SearchBar'

const publicNavLinks = [
  { label: 'Shop', to: '/category' },
  { label: 'Categories', to: '/category?view=categories' },
  { label: 'Best Sellers', to: '/category?sort=-ratingsAverage' },
  { label: 'Orders', to: '/orders' },
  { label: 'About', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount, totals } = useCart()
  const { isAuthenticated, logout, user } = useAuth()
  const navLinks = user?.role === 'admin'
    ? [...publicNavLinks.slice(0, 4), { label: 'Admin', to: '/admin' }, ...publicNavLinks.slice(4)]
    : publicNavLinks

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/78 shadow-[0_14px_45px_rgba(74,166,217,0.10)] backdrop-blur-2xl">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-2 md:gap-2.5 lg:px-5 lg:py-1.5">
        <Logo />
        <div className="hidden items-center justify-center gap-3 sm:flex">
          <Link to="/category" className="hidden items-center gap-2 rounded-full border border-sky-100 bg-white/90 px-4 py-2.5 text-sm font-extrabold text-brand-ink shadow-[0_14px_34px_rgba(74,166,217,0.10)] transition hover:border-brand-blue hover:text-brand-blue md:flex">
            All Categories <ChevronDown className="h-4 w-4" />
          </Link>
          <SearchBar className="w-full max-w-[320px]" />
          <Link to="/category" className="hidden h-12 w-12 place-items-center rounded-full bg-white text-brand-ink shadow-[0_14px_32px_rgba(74,166,217,0.12)] transition hover:-translate-y-0.5 hover:text-brand-blue xl:grid" aria-label="Search products">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/wishlist" className="hidden h-12 w-12 place-items-center rounded-full bg-white text-brand-green shadow-[0_14px_32px_rgba(124,197,118,0.14)] transition hover:-translate-y-0.5 hover:bg-brand-leaf xl:grid" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Link>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Link to={user?.role === 'admin' ? '/admin' : '/login'} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-extrabold text-brand-ink transition hover:bg-sky-50 lg:flex">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-50 text-brand-blue shadow-[0_10px_24px_rgba(74,166,217,0.14)]">
              <CircleUserRound className="h-5 w-5" />
            </span>
            {isAuthenticated ? user?.name || user?.phone || 'Account' : 'Login / Register'}
          </Link>
          {isAuthenticated && (
            <button type="button" className="hidden rounded-full bg-red-50 px-4 py-2.5 text-sm font-black text-red-500 shadow-[0_12px_28px_rgba(239,68,68,0.10)] transition hover:-translate-y-0.5 hover:bg-red-100 hover:text-red-600 xl:block" onClick={logout}>
              Logout
            </button>
          )}
          <Link to="/orders" className="hidden h-12 w-12 place-items-center rounded-full bg-white text-brand-blue shadow-[0_14px_32px_rgba(74,166,217,0.12)] transition hover:-translate-y-0.5 hover:bg-sky-50 lg:grid" aria-label="Orders">
            <PackageCheck className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative flex items-center gap-2 rounded-full px-2 py-2 text-sm font-extrabold text-brand-ink transition hover:bg-sky-50">
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-sky-50 text-brand-blue shadow-[0_10px_24px_rgba(74,166,217,0.14)]">
              <ShoppingCart className="h-[22px] w-[22px]" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-green text-[11px] text-white shadow-[0_8px_18px_rgba(124,197,118,0.32)]">{cartCount}</span>}
            </span>
            <span className="hidden sm:block leading-tight">
              Cart ({cartCount})<br />{formatPrice(totals.total)}
            </span>
          </Link>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-sky-100 bg-sky-50 text-brand-blue shadow-[0_10px_24px_rgba(74,166,217,0.10)] lg:hidden" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="mx-auto block max-w-[1180px] px-4 pb-3 sm:hidden">
        <SearchBar compact />
      </div>
      <nav className="mx-auto hidden max-w-[1180px] items-center justify-center gap-7 px-4 pb-3 text-sm font-extrabold text-brand-ink lg:flex">
        {navLinks.map(({ label, to }) => (
          <NavLink key={`${label}-${to}`} to={to} className={({ isActive }) => `rounded-full px-5 py-2.5 transition ${isActive ? 'bg-sky-50 text-brand-blue shadow-[0_12px_28px_rgba(74,166,217,0.12)]' : 'hover:bg-sky-50 hover:text-brand-blue'}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      {menuOpen && (
        <div className="fixed inset-0 top-[96px] z-[70] bg-brand-ink/20 backdrop-blur-sm lg:hidden">
          <nav className="mx-3 mt-3 max-h-[calc(100vh-118px)] overflow-y-auto rounded-[1.6rem] border border-sky-100 bg-white/96 p-4 shadow-[0_28px_90px_rgba(74,166,217,0.22)]">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navLinks.map(({ label, to }) => (
              <NavLink key={`${label}-${to}`} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `rounded-2xl px-4 py-3.5 text-sm font-black transition ${isActive ? 'bg-brand-blue text-white shadow-[0_14px_34px_rgba(74,166,217,0.22)]' : 'bg-sky-50/70 text-brand-ink hover:bg-brand-mist hover:text-brand-blue'}`}>
                {label}
              </NavLink>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link onClick={() => setMenuOpen(false)} to={user?.role === 'admin' ? '/admin' : '/login'} className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-center text-sm font-black text-brand-blue shadow-sm">{user?.role === 'admin' ? 'Admin CRM' : isAuthenticated ? 'My Account' : 'Account'}</Link>
              <Link onClick={() => setMenuOpen(false)} to="/checkout" className="rounded-2xl bg-brand-green px-4 py-3 text-center text-sm font-black text-white shadow-[0_14px_34px_rgba(124,197,118,0.22)]">Checkout</Link>
            </div>
            {isAuthenticated && (
              <button type="button" onClick={() => { logout(); setMenuOpen(false) }} className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-black text-red-500">
                Logout
              </button>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-blue-50 pt-3">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  onClick={() => setMenuOpen(false)}
                  to={`/category?category=${category.id}`}
                  className="rounded-2xl bg-brand-mist px-4 py-3 text-sm font-black text-brand-blue"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </div>
          </nav>
        </div>
      )}
    </header>
  )
}
