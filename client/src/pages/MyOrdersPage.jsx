import { Clock, Download, Eye, PackageCheck, RotateCw, Truck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../api/services'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/format'

const statusStyles = {
  placed: 'bg-sky-50 text-brand-blue',
  processing: 'bg-blue-50 text-blue-600',
  shipped: 'bg-green-50 text-brand-green',
  out_for_delivery: 'bg-green-50 text-brand-green',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-500',
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const response = await orderService.mine()
      setOrders(response.orders || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

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
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('Please login to view your orders')
      navigate('/login')
      return
    }
    loadOrders()
  }, [authLoading, isAuthenticated, loadOrders, navigate])

  if (loading || authLoading) return <PageSkeleton />

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Account" title="My Orders" copy="Track every BabyCure order, payment and delivery update in one place." backTo="/" backLabel="Back to home" />
      <div className="mb-5 flex justify-end">
        <Button variant="ghost" onClick={() => loadOrders(false)}><RotateCw className="h-4 w-4" /> Refresh</Button>
      </div>
      {orders.length === 0 ? (
        <div className="grid min-h-[380px] place-items-center rounded-[2rem] border border-sky-100 bg-white p-8 text-center shadow-soft">
          <div>
            <PackageCheck className="mx-auto h-14 w-14 text-brand-blue" />
            <h2 className="mt-5 font-display text-3xl font-extrabold text-brand-ink">No orders yet</h2>
            <p className="mt-3 font-medium text-slate-500">Shop gentle baby-care products and your order history will appear here.</p>
            <Button to="/category" className="mt-7 rounded-full">Start Shopping</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.orderStatus === 'delivered' || order.deliveryStatus === 'delivered'
            const returnWindowActive = isDelivered && isReturnWindowActive(order)
            return (
              <article key={order._id} className="rounded-[1.6rem] border border-sky-100 bg-white p-5 shadow-[0_18px_60px_rgba(74,166,217,0.10)] transition hover:-translate-y-1 hover:shadow-premium">
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl font-extrabold text-brand-ink">{order.orderNumber}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusStyles[order.orderStatus] || 'bg-slate-50 text-slate-500'}`}>
                        {formatStatus(order.orderStatus)}
                      </span>
                      <span className="rounded-full bg-brand-leaf px-3 py-1 text-xs font-extrabold text-brand-green">{order.paymentMethod}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> {formatDate(order.createdAt)}</span>
                      <span>{order.orderItems?.length || 0} item(s)</span>
                      <span>Payment: {formatStatus(order.paymentStatus)}</span>
                      <span className="font-extrabold text-brand-blue">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button to={`/orders/${order._id}`} variant="ghost" className="rounded-full"><Eye className="h-4 w-4" /> Details</Button>
                    <Button type="button" variant="ghost" className="rounded-full" onClick={() => downloadInvoice(order)}><Download className="h-4 w-4" /> Invoice</Button>
                    <Button to={`/orders/${order._id}/tracking`} variant="outline" className="rounded-full"><Truck className="h-4 w-4" /> Track</Button>
                    {returnWindowActive && (
                      <>
                        <Button to={`/orders/${order._id}?action=return`} variant="outline" className="rounded-full"><RotateCw className="h-4 w-4" /> Return Product</Button>
                        <Button to={`/orders/${order._id}?action=replacement`} className="rounded-full"><PackageCheck className="h-4 w-4" /> Replace Product</Button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function formatStatus(value = '') {
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function isReturnWindowActive(order) {
  const deliveredAt = order.deliveredAt || order.updatedAt || order.createdAt
  if (!deliveredAt) return true
  return Date.now() - new Date(deliveredAt).getTime() <= 48 * 60 * 60 * 1000
}
