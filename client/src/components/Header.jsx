import { Baby, BookOpen, CircleUserRound, Heart, Headphones, LogOut, Menu, PackageCheck, ShieldCheck, ShoppingBag, Truck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { categories } from '../data/products'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import Logo from './Logo'
import SearchBar from './SearchBar'

const publicNavLinks = [
  { label: 'Home', to: '/', Icon: Baby },
  { label: 'About', to: '/about', Icon: BookOpen },
  { label: 'Products', to: '/category', Icon: ShoppingBag },
  { label: 'Wishlist', to: '/wishlist', Icon: Heart, wishlist: true },
  { label: 'Contact', to: '/contact', Icon: Headphones },
  { label: 'Why Baby Cure', to: '/why-baby-cure', Icon: ShieldCheck },
]
const isAdminUser = (user) => String(user?.role || '').trim().toLowerCase() === 'admin'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount, totals } = useCart()
  const { isAuthenticated, logout, user } = useAuth()
  const navLinks = isAdminUser(user) ? [...publicNavLinks, { label: 'Admin', to: '/admin', Icon: ShieldCheck }] : publicNavLinks

  useEffect(() => {
    if (!menuOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-[0_4px_16px_rgba(23,50,77,.06)]">
      <div className="hidden bg-brand-ink text-white md:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-1 text-[10px] font-bold uppercase tracking-[.13em]">
          <span className="flex items-center gap-2 text-white/90"><Truck className="h-3.5 w-3.5 text-brand-green" /> Free delivery on orders above ₹799 · ₹60 below ₹799</span>
          <div className="flex items-center gap-2"><Link to="/orders" className="flex items-center gap-1.5 rounded-full border border-brand-green/45 bg-brand-green/15 px-3 py-1 text-white shadow-[0_2px_8px_rgba(0,0,0,.12)] transition hover:-translate-y-px hover:bg-brand-green/30"><PackageCheck className="h-3.5 w-3.5 text-brand-green" /> Track order</Link><Link to="/contact" className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-white shadow-[0_2px_8px_rgba(0,0,0,.12)] transition hover:-translate-y-px hover:bg-white/20"><Headphones className="h-3.5 w-3.5 text-brand-blue" /> Care support</Link></div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-1 sm:gap-5 lg:px-6 lg:py-1.5">
        <Logo />
        <div className="hidden min-w-0 flex-1 lg:block"><SearchBar className="mx-auto max-w-[510px]" /></div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/wishlist" className="hidden h-10 w-10 place-items-center rounded-full bg-red-50 text-red-500 shadow-[0_5px_16px_rgba(239,68,68,.12)] ring-1 ring-red-100 transition hover:-translate-y-0.5 hover:bg-red-100 hover:text-red-600 lg:grid" aria-label="Wishlist"><Heart className="h-[19px] w-[19px] fill-current" /></Link>
          <Link to="/orders" className="hidden h-10 w-10 place-items-center rounded-full text-brand-ink transition hover:bg-brand-mist hover:text-brand-blue xl:grid" aria-label="Orders"><PackageCheck className="h-[19px] w-[19px]" /></Link>
          <Link to={isAdminUser(user) ? '/admin' : isAuthenticated ? '/account' : '/login'} className="hidden items-center gap-2 border-l border-slate-200 px-3 py-1 text-sm font-extrabold text-brand-ink transition hover:text-brand-blue lg:flex"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-mist text-brand-blue"><CircleUserRound className="h-5 w-5" /></span><span className="max-w-[120px] truncate">{isAuthenticated ? user?.name || 'Account' : 'Account'}</span></Link>
          {isAuthenticated && <button type="button" onClick={logout} className="hidden items-center gap-1.5 border border-red-200 bg-red-50 px-3 py-2 text-sm font-extrabold text-red-600 transition hover:border-red-300 hover:bg-red-100 lg:flex"><LogOut className="h-4 w-4" /> Logout</button>}
          <Link to="/cart" className="relative flex items-center gap-2 border-l border-slate-200 py-1 pl-3 text-brand-ink transition hover:text-brand-blue sm:pl-4" aria-label="Shopping bag"><span className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-mist"><ShoppingBag className="h-5 w-5" />{cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-brand-blue text-[9px] font-extrabold text-white">{cartCount}</span>}</span><span className="hidden text-left text-[11px] font-bold leading-4 sm:block"><span className="block uppercase tracking-[.1em] text-slate-400">Bag</span>{formatPrice(totals.total)}</span></Link>
          <button className="ml-1 grid h-10 w-10 place-items-center border border-slate-200 text-brand-ink transition hover:border-brand-blue hover:text-brand-blue lg:hidden" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>

      <div className="mx-auto block max-w-[1280px] border-t border-slate-100 px-4 py-1.5 lg:hidden"><SearchBar compact /></div>
      <nav aria-label="Main navigation" className="hidden border-t border-slate-200 bg-[#fbfdff] lg:block"><div className="mx-auto flex max-w-[1280px] items-center justify-center gap-1 px-6 py-1">{navLinks.map(({ label, to, Icon, featured, wishlist }) => <NavLink key={`${label}-${to}`} to={to} className={({ isActive }) => `rounded-full px-3 py-1.5 text-[13px] font-extrabold tracking-[-.01em] transition-all duration-200 ${featured ? 'bg-[#fff5d9] text-[#9a6700] hover:-translate-y-px hover:bg-[#ffebae] hover:shadow-[0_5px_12px_rgba(154,103,0,.15)]' : wishlist ? isActive ? 'bg-red-100 text-red-600 shadow-[0_3px_12px_rgba(239,68,68,.16)]' : 'text-red-500 hover:-translate-y-px hover:bg-red-50 hover:text-red-600' : isActive ? 'bg-brand-mist text-brand-blue shadow-[0_2px_8px_rgba(74,166,217,.12)]' : 'text-brand-ink hover:bg-brand-mist hover:text-brand-blue'}`}><span className="flex items-center gap-1.5">{wishlist && <Icon className="h-4 w-4 fill-current" />}{label}</span></NavLink>)}</div></nav>

      {menuOpen && <div className="fixed inset-0 z-[70] bg-brand-ink/35 lg:hidden"><button type="button" className="absolute inset-0" aria-label="Close menu" onClick={() => setMenuOpen(false)} /><nav className="absolute inset-y-0 right-0 flex w-[min(90vw,390px)] flex-col overflow-hidden bg-white shadow-[-20px_0_50px_rgba(23,50,77,.16)]"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-5"><div><p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-green"><ShieldCheck className="h-3.5 w-3.5" /> BabyCure</p><h2 className="mt-1 text-xl font-extrabold text-brand-ink">Explore care</h2></div><button type="button" onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center border border-slate-200 text-brand-ink" aria-label="Close menu"><X className="h-5 w-5" /></button></div><div className="overflow-y-auto p-4">{navLinks.map(({ label, to, Icon, featured, wishlist }) => <NavLink key={`${label}-${to}`} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 border-b border-slate-100 px-2 py-4 text-sm font-extrabold ${featured ? 'text-[#9a6700]' : wishlist ? 'text-red-500' : isActive ? 'text-brand-blue' : 'text-brand-ink'}`}><Icon className={`h-[18px] w-[18px] ${featured || wishlist ? 'fill-current' : ''}`} />{label}</NavLink>)}<div className="mt-5 grid grid-cols-2 gap-3"><Link onClick={() => setMenuOpen(false)} to={user?.role === 'admin' ? '/admin' : isAuthenticated ? '/account' : '/login'} className="border border-slate-200 px-4 py-3 text-center text-sm font-extrabold text-brand-ink">{isAuthenticated ? 'My account' : 'Sign in'}</Link><Link onClick={() => setMenuOpen(false)} to="/cart" className="bg-brand-ink px-4 py-3 text-center text-sm font-extrabold text-white">My bag</Link></div>{isAuthenticated && <button type="button" onClick={() => { logout(); setMenuOpen(false) }} className="mt-3 w-full border border-red-100 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600">Sign out</button>}<div className="mt-7 border-t border-slate-200 pt-5"><p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.15em] text-slate-400">Shop categories</p><div className="grid grid-cols-2 gap-2">{categories.map((category) => <Link key={category.id} onClick={() => setMenuOpen(false)} to={`/category?search=${encodeURIComponent(category.title)}`} className="bg-brand-mist px-3 py-3 text-sm font-extrabold text-brand-ink">{category.title}</Link>)}</div></div></div></nav></div>}
    </header>
  )
}
