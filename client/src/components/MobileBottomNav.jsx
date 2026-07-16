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
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-1 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5">
        {items.map(([to, Icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `grid place-items-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] font-black ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-slate-500'}`}>
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
