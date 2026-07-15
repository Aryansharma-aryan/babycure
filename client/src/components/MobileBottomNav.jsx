import { Baby, CircleUserRound, Heart, PackageCheck, ShoppingBag } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  ['/', Heart, 'Home'],
  ['/category', Baby, 'Shop'],
  ['/cart', ShoppingBag, 'Bag'],
  ['/orders', PackageCheck, 'Orders'],
  ['/login', CircleUserRound, 'Account'],
]

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(([to, Icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `grid place-items-center gap-1 rounded-md px-2 py-2 text-[11px] font-black ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-slate-500'}`}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
