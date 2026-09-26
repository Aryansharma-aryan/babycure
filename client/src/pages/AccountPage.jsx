import { ChevronRight, Download, FileText, Globe, Heart, HelpCircle, Info, LogOut, MapPin, MessageSquare, PackageCheck, Settings, ShieldCheck, Truck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation } from 'react-router-dom'
import { addressService, orderService, returnRequestService, wishlistService } from '../api/services'
import Button from '../components/Button'
import AddressBook from '../components/AddressBook'
import AccountFeedback from '../components/AccountFeedback'
import RecentlyViewed from '../components/RecentlyViewed'
import { PageSkeleton } from '../components/Skeleton'
import { accountLabels } from '../data/accountLabels'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/format'
import { formatDate, formatStatus } from './MyOrdersPage'

const LANGUAGE_KEY = 'babycure:account-language'
const readLanguage = () => {
  try { return localStorage.getItem(LANGUAGE_KEY) === 'hi' ? 'hi' : 'en' }
  catch { return 'en' }
}

export default function AccountPage() {
  const location = useLocation()
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth()
  const [language, setLanguage] = useState(readLanguage)
  const labels = accountLabels[language]
  const [data, setData] = useState({ owner: null, orders: [], addresses: [], wishlist: [], requests: [] })
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [reload, setReload] = useState(0)
  const [pending, setPending] = useState(false)
  const userId = user?.id || user?._id
  const ready = isAuthenticated && data.owner === userId && !loading

  useEffect(() => {
    if (!ready || !['#profile', '#addresses'].includes(location.hash)) return
    const timer = window.setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'auto', block: 'start' }), 0)
    return () => window.clearTimeout(timer)
  }, [ready, location.hash])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    let active = true
    const load = async () => {
      if (!active) return
      setLoading(true)
      setLoadError(false)
      const results = await Promise.allSettled([orderService.mine(), addressService.list(), wishlistService.get(), returnRequestService.mine()])
      if (!active) return
      const values = results.map((result) => result.status === 'fulfilled' ? result.value : {})
      setData({ owner: userId, orders: values[0].orders || [], addresses: values[1].addresses || [], wishlist: values[2].items || values[2].wishlist?.items || [], requests: values[3].requests || [] })
      setLoadError(results.some((result) => result.status === 'rejected'))
      setLoading(false)
    }
    queueMicrotask(load)
    return () => { active = false }
  }, [authLoading, isAuthenticated, userId, reload])

  useEffect(() => {
    const sync = (event) => { if (event.key === LANGUAGE_KEY) setLanguage(readLanguage()) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const changeLanguage = (value) => {
    setLanguage(value)
    try { localStorage.setItem(LANGUAGE_KEY, value); toast.success(accountLabels[value].languageSaved, { id: 'account-language' }) }
    catch { toast.error(accountLabels[value].storageError) }
  }
  const reloadAddresses = async () => {
    const response = await addressService.list()
    setData((previous) => ({ ...previous, addresses: response.addresses || [] }))
  }
  const handleLogout = async () => {
    setPending(true)
    try { await logout(); setData({ owner: null, orders: [], addresses: [], wishlist: [], requests: [] }) }
    catch (error) { toast.error(error.message) }
    finally { setPending(false) }
  }
  const downloadInvoice = async (order) => {
    try {
      const blob = await orderService.invoice(order._id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${order.orderNumber}-invoice.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { toast.error(error.message) }
  }

  if (authLoading) return <PageSkeleton />
  const addresses = ready ? data.addresses : []
  const displayName = addresses[0]?.fullName || user?.name || 'BabyCure'
  const loginTarget = (path) => isAuthenticated ? { to: path } : { to: '/login', state: { from: path } }

  return <section lang={language} className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:space-y-6 sm:py-9">
    <div><h1 className="font-display text-2xl font-bold text-brand-ink sm:text-3xl">{labels.title}</h1><p className="mt-1 text-sm text-slate-500">{labels.subtitle}</p></div>
    <div className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-green-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-brand-blue shadow-sm"><UserRound className="h-7 w-7" /></span><div className="min-w-0"><h2 className="text-xl font-bold text-brand-ink">{isAuthenticated ? `${labels.hello}, ${displayName}` : labels.guestTitle}</h2><p className="mt-1 break-all text-sm leading-6 text-slate-500">{isAuthenticated ? user?.email : labels.guestCopy}</p></div></div>
      {isAuthenticated ? <Button variant="ghost" className="shrink-0" disabled={pending} onClick={handleLogout}><LogOut className="h-4 w-4" />{pending ? labels.signingOut : labels.logout}</Button> : <Button to="/login" state={{ from: '/account' }} className="min-w-36 shrink-0">{labels.login}</Button>}
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <QuickLink icon={PackageCheck} label={labels.orders} {...loginTarget('/orders')} />
      <QuickLink icon={Heart} label={labels.wishlist} {...loginTarget('/wishlist')} />
      <QuickLink icon={MapPin} label={labels.addresses} {...loginTarget('/account#addresses')} />
      <QuickLink icon={HelpCircle} label={labels.help} to="/contact" />
    </div>

    <RecentlyViewed labels={labels} />

    <div className="grid items-start gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <AccountPanel title={labels.settings} icon={Settings}>
          {isAuthenticated && <MenuLink icon={UserRound} label={labels.profile} to="#profile" />}
          <div className="px-5 py-4"><label htmlFor="account-language" className="flex items-center gap-3 text-sm font-semibold text-brand-ink"><Globe className="h-5 w-5 text-brand-blue" />{labels.language}</label><select id="account-language" value={language} onChange={(event) => changeLanguage(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue"><option value="en">English</option><option value="hi">Hindi / {'\u0939\u093f\u0928\u094d\u0926\u0940'}</option></select><p className="mt-2 text-xs leading-5 text-slate-500">{labels.languageCopy}</p></div>
        </AccountPanel>
        <AccountPanel title={labels.support} icon={HelpCircle}>
          <MenuLink icon={HelpCircle} label={labels.help} copy={labels.helpCopy} to="/contact" />
          <details className="group border-t border-slate-100"><summary className="flex cursor-pointer list-none items-center gap-3 p-5 text-sm font-semibold text-brand-ink [&::-webkit-details-marker]:hidden"><MessageSquare className="h-5 w-5 text-brand-blue" />{labels.feedback}<ChevronRight className="ml-auto h-4 w-4 text-slate-400 transition group-open:rotate-90" /></summary><div className="px-5 pb-5"><AccountFeedback key={userId || 'guest'} user={user} labels={labels} /></div></details>
        </AccountPanel>
      </div>
      <AccountPanel title={labels.information} icon={Info}>
        <MenuLink icon={FileText} label={labels.terms} to="/terms-and-conditions" />
        <MenuLink icon={ShieldCheck} label={labels.privacy} to="/privacy-policy" />
        <MenuLink icon={Truck} label={labels.shipping} to="/shipping-policy" />
        <MenuLink icon={PackageCheck} label={labels.returns} to="/return-refund-policy" />
        <MenuLink icon={HelpCircle} label={labels.faqs} to="/faqs" />
        <MenuLink icon={Info} label={labels.about} to="/about" />
      </AccountPanel>
    </div>

    {isAuthenticated && <>
      {loadError && <div role="alert" className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">{labels.loadError}<button type="button" onClick={() => setReload((value) => value + 1)} className="ml-3 font-bold underline">{labels.retry}</button></div>}
      {!ready ? <p role="status" className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">{labels.loading}</p> : <>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div id="profile" className="scroll-mt-48"><AccountPanel title={labels.profile} icon={UserRound}><dl className="space-y-4 p-5 text-sm"><div><dt className="text-slate-500">{labels.name}</dt><dd className="mt-1 font-semibold">{addresses[0]?.fullName || user?.name || labels.addAddress}</dd></div><div><dt className="text-slate-500">{labels.email}</dt><dd className="mt-1 break-all font-semibold">{user?.email}</dd></div><div><dt className="text-slate-500">{labels.phone}</dt><dd className="mt-1 font-semibold">{addresses[0]?.phone || user?.phone || labels.addAddress}</dd></div><p className="text-xs leading-5 text-slate-500">{labels.profileCopy}</p></dl></AccountPanel></div>
          <div id="addresses" className="scroll-mt-48"><AddressBook addresses={addresses} onChange={reloadAddresses} /></div>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <AccountPanel title={labels.recentOrders} icon={PackageCheck}><div className="px-5 pb-5">
            {data.orders.slice(0, 3).map((order) => <div key={order._id} className="border-b border-slate-100 py-4"><p className="font-semibold text-brand-ink">{order.orderNumber}</p><p className="mt-1 text-xs leading-5 text-slate-500">{formatDate(order.createdAt)} / {formatStatus(order.orderStatus)} / {formatPrice(order.totalPrice)}</p><div className="mt-3 flex flex-wrap gap-2"><Button to={`/orders/${order._id}`} variant="ghost">{labels.orderDetails}</Button><Button variant="outline" onClick={() => downloadInvoice(order)}><Download className="h-4 w-4" />{labels.invoice}</Button></div></div>)}
            {data.orders.length === 0 && <p className="py-5 text-sm text-slate-500">{labels.noOrders}</p>}<Link to="/orders" className="mt-4 inline-block text-sm font-bold text-brand-blue">{labels.allOrders}</Link>
          </div></AccountPanel>
          <AccountPanel title={labels.returnRequests} icon={PackageCheck}><div className="px-5 pb-5">{data.requests.slice(0, 3).map((request) => <div key={request._id} className="border-b border-slate-100 py-4 text-sm"><p className="font-semibold text-brand-ink">{request.requestNumber}</p><p className="mt-1 text-slate-500">{formatStatus(request.type)} / {formatStatus(request.status)}</p></div>)}{data.requests.length === 0 && <p className="py-5 text-sm text-slate-500">{labels.noReturns}</p>}</div></AccountPanel>
        </div>
      </>}
    </>}
  </section>
}

function QuickLink({ icon: Icon, label, ...props }) {
  return <Link {...props} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-brand-ink transition hover:border-sky-200 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2"><Icon className="h-5 w-5 shrink-0 text-brand-blue" /><span>{label}</span></Link>
}
function MenuLink({ icon: Icon, label, copy, to }) {
  return <Link to={to} className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 text-sm last:border-0 hover:bg-sky-50/60 focus-visible:outline focus-visible:outline-2"><Icon className="h-5 w-5 shrink-0 text-brand-blue" /><span className="min-w-0"><span className="font-semibold text-brand-ink">{label}</span>{copy && <span className="mt-1 block text-xs text-slate-500">{copy}</span>}</span><ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" /></Link>
}
function AccountPanel({ title, icon: Icon, children }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-base font-bold text-brand-ink"><Icon className="h-5 w-5 text-brand-blue" />{title}</h2>{children}</section>
}
