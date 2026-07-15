import { Download, Heart, MapPin, PackageCheck, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { addressService, orderService, returnRequestService, wishlistService } from '../api/services'
import Button from '../components/Button'
import Input from '../components/Input'
import PageHeader from '../components/PageHeader'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/format'
import { formatDate, formatStatus } from './MyOrdersPage'

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function AccountPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, updateProfile, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [requests, setRequests] = useState([])
  const [pending, setPending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [orderResponse, addressResponse, wishlistResponse, returnResponse] = await Promise.all([
        orderService.mine(),
        addressService.list(),
        wishlistService.get().catch(() => ({ items: [] })),
        returnRequestService.mine().catch(() => ({ requests: [] })),
      ])
      setOrders(orderResponse.orders || [])
      setAddresses(addressResponse.addresses || [])
      setWishlist(wishlistResponse.items || wishlistResponse.wishlist?.items || [])
      setRequests(returnResponse.requests || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('Please login to manage your account')
      navigate('/login')
      return
    }
    queueMicrotask(load)
  }, [authLoading, isAuthenticated, load, navigate])

  const saveProfile = async (event) => {
    event.preventDefault()
    setPending(true)
    try {
      await updateProfile(Object.fromEntries(new FormData(event.currentTarget)))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  const downloadInvoice = async (order) => {
    try {
      const blob = await orderService.invoice(order._id)
      downloadBlob(blob, `${order.orderNumber}-invoice.pdf`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading || authLoading) return <PageSkeleton />

  const paidOrders = orders.filter((order) => order.paymentStatus === 'paid')
  const totalSpend = paidOrders.reduce((total, order) => total + Number(order.totalPrice || 0), 0)

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Account" title="My Account" copy="Profile, saved addresses, invoices, wishlist and returns in one place." backTo="/" backLabel="Back to store" />

      <div className="grid gap-4 md:grid-cols-4">
        <AccountMetric icon={PackageCheck} label="Orders" value={orders.length} />
        <AccountMetric icon={ShieldCheck} label="Paid Spend" value={formatPrice(totalSpend)} />
        <AccountMetric icon={MapPin} label="Addresses" value={addresses.length} />
        <AccountMetric icon={Heart} label="Wishlist" value={wishlist.length} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={saveProfile} className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-mist text-brand-blue"><UserRound className="h-5 w-5" /></span>
            <h2 className="font-display text-xl font-semibold text-brand-ink">Profile Details</h2>
          </div>
          <div className="mt-5 grid gap-4">
            <Input label="Full Name" name="name" defaultValue={user?.name || ''} required />
            <Input label="Email" name="email" type="email" defaultValue={user?.email || ''} required />
            <Input label="Phone" name="phone" defaultValue={user?.phone || ''} required />
          </div>
          <Button type="submit" className="mt-5 w-full" disabled={pending}><Save className="h-4 w-4" /> {pending ? 'Saving...' : 'Save Profile'}</Button>
        </form>

        <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-brand-ink">Saved Addresses</h2>
            <Button to="/checkout" variant="outline">Manage in Checkout</Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {addresses.length === 0 ? (
              <p className="rounded bg-brand-mist p-4 text-sm font-medium text-slate-500 md:col-span-2">No saved addresses yet.</p>
            ) : addresses.map((address) => (
              <div key={address._id} className="rounded-md border border-slate-100 bg-brand-mist p-4 text-sm font-medium leading-6 text-slate-600">
                <p className="font-semibold text-brand-ink">{address.fullName} {address.isDefault ? '(Default)' : ''}</p>
                <p>{address.addressLine1}</p>
                <p>{address.city}, {address.state} - {address.postalCode}</p>
                <p>{address.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AccountPanel title="Recent Orders">
          {orders.slice(0, 5).map((order) => (
            <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
              <div>
                <p className="font-semibold text-brand-ink">{order.orderNumber}</p>
                <p className="text-sm font-medium text-slate-500">{formatDate(order.createdAt)} · {formatStatus(order.orderStatus)} · {formatPrice(order.totalPrice)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button to={`/orders/${order._id}`} variant="ghost">Details</Button>
                <Button type="button" variant="outline" onClick={() => downloadInvoice(order)}><Download className="h-4 w-4" /> Invoice</Button>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="rounded bg-brand-mist p-4 text-sm font-medium text-slate-500">No orders yet.</p>}
        </AccountPanel>

        <AccountPanel title="Returns / Replacements">
          {requests.slice(0, 5).map((request) => (
            <div key={request._id} className="border-b border-slate-100 py-3 last:border-0">
              <p className="font-semibold text-brand-ink">{request.requestNumber}</p>
              <p className="text-sm font-medium text-slate-500">{formatStatus(request.type)} · {formatStatus(request.status)}</p>
            </div>
          ))}
          {requests.length === 0 && <p className="rounded bg-brand-mist p-4 text-sm font-medium text-slate-500">No return or replacement requests yet.</p>}
        </AccountPanel>
      </div>
    </section>
  )
}

function AccountMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-brand-blue" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-brand-ink">{value}</p>
    </div>
  )
}

function AccountPanel({ title, children }) {
  return (
    <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-brand-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  )
}
