import { ArrowRight, Ban, CreditCard, ExternalLink, MapPin, PackageCheck, RotateCw, Truck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { orderService } from '../api/services'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/format'
import { formatDate, formatStatus } from './MyOrdersPage'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  const loadOrder = useCallback(async () => {
    setLoading(true)
    try {
      const response = await orderService.get(id)
      setOrder(response.order)
    } catch (error) {
      toast.error(error.message)
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('Please login to view order details')
      navigate('/login')
      return
    }
    loadOrder()
  }, [authLoading, isAuthenticated, loadOrder, navigate])

  const cancelOrder = async () => {
    setPending(true)
    try {
      const response = await orderService.cancel(id)
      setOrder(response.order)
      toast.success('Order cancelled')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  if (loading || authLoading || !order) return <PageSkeleton />

  const address = order.shippingAddress || {}

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Order Details" title={order.orderNumber} copy="Review products, payment, address and delivery status." backTo="/orders" backLabel="Back to orders" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500">Placed on {formatDate(order.createdAt)}</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-ink">{formatStatus(order.orderStatus)}</h2>
              </div>
              <Button to={`/orders/${order._id}/tracking`} className="rounded-full"><Truck className="h-4 w-4" /> Live Tracking</Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.8rem] border border-sky-100 bg-white shadow-soft">
            {order.orderItems?.map((item) => (
              <div key={`${item.product}-${item.name}`} className="grid gap-4 border-b border-sky-50 p-5 last:border-0 sm:grid-cols-[90px_1fr_auto] sm:items-center">
                <div className="grid h-20 place-items-center rounded-2xl bg-sky-50">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2" loading="lazy" /> : <PackageCheck className="h-8 w-8 text-brand-blue" />}
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-brand-ink">{item.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Qty {item.quantity} x {formatPrice(item.price)}</p>
                </div>
                <p className="font-display text-lg font-extrabold text-brand-blue">{formatPrice(item.quantity * item.price)}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <InfoCard icon={CreditCard} title="Payment">
            <p>{order.paymentMethod}</p>
            <p>Status: {formatStatus(order.paymentStatus)}</p>
            <p className="mt-3 font-display text-2xl font-extrabold text-brand-blue">{formatPrice(order.totalPrice)}</p>
          </InfoCard>
          <InfoCard icon={MapPin} title="Shipping Address">
            <p className="font-extrabold">{address.fullName}</p>
            <p>{address.addressLine1}</p>
            <p>{address.city}, {address.state} - {address.postalCode}</p>
            <p>{address.phone}</p>
          </InfoCard>
          <InfoCard icon={Truck} title="Shipment">
            <p>Courier: {order.courierName || 'Will update soon'}</p>
            <p>AWB: {order.awbCode || order.trackingId || 'Not assigned yet'}</p>
            <p>Status: {formatStatus(order.deliveryStatus || order.orderStatus)}</p>
            <p>Estimated: {order.estimatedDeliveryDate ? formatDate(order.estimatedDeliveryDate) : 'Will update soon'}</p>
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-extrabold text-white">
                Track on Courier Website <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </InfoCard>
          <div className="rounded-[1.6rem] border border-sky-100 bg-white p-5 shadow-soft">
            <Button to={`/orders/${order._id}/tracking`} variant="outline" className="w-full rounded-full">Track Shipment <ArrowRight className="h-4 w-4" /></Button>
            {['placed', 'processing'].includes(order.orderStatus) && (
              <button disabled={pending} onClick={cancelOrder} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-extrabold text-red-500 transition hover:bg-red-100 disabled:opacity-60">
                <Ban className="h-4 w-4" /> {pending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <button onClick={loadOrder} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-sky-50 px-5 py-3 text-sm font-extrabold text-brand-blue transition hover:bg-sky-100">
              <RotateCw className="h-4 w-4" /> Refresh Details
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-[1.6rem] border border-sky-100 bg-white p-5 text-sm font-semibold leading-7 text-slate-600 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-mist text-brand-blue">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-display text-lg font-extrabold text-brand-ink">{title}</h3>
      </div>
      {children}
    </div>
  )
}
