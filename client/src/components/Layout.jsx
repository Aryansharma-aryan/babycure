import { Link, Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <SupportBand />
      <Footer />
      <MobileBottomNav />
    </>
  )
}

function SupportBand() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <div className="grid gap-4 rounded-md border border-blue-100 bg-white p-4 shadow-soft sm:p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h3 className="font-display text-xl font-black text-slate-950">Need help choosing baby care?</h3>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">Babycure support can help with product guidance, orders and gentle-care recommendations.</p>
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <Link to="/contact" className="rounded-md bg-brand-blue px-5 py-3 text-center text-sm font-black text-white">Contact Support</Link>
          <Link to="/category" className="rounded-md border border-brand-green bg-white px-5 py-3 text-center text-sm font-black text-brand-green">Browse Products</Link>
        </div>
      </div>
    </section>
  )
}
