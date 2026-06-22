import { Check, Clock, ExternalLink, Package, RotateCw, Truck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { orderService } from '../api/services'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { formatDate, formatStatus } from './MyOrdersPage'

const steps = [
  { key: 'placed', label: 'Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

const statusRank = {
  placed: 0,
  processing: 1,
  pending: 1,
  packed: 2,
  shipped: 3,
  in_transit: 3,
  out_for_delivery: 4,
  delivered: 5,
}

export default function OrderTrackingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadTracking = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const response = await orderService.tracking(id)
      setTracking(response.tracking)
      setLastUpdated(new Date())
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
      toast.error('Please login to track your order')
      navigate('/login')
      return
    }
    loadTracking()
  }, [authLoading, isAuthenticated, loadTracking, navigate])

  useEffect(() => {
    const timer = window.setInterval(() => loadTracking(true), 15000)
    return () => window.clearInterval(timer)
  }, [loadTracking])

  const activeRank = useMemo(() => {
    const status = tracking?.deliveryStatus || tracking?.orderStatus || 'placed'
    return statusRank[status] ?? statusRank[tracking?.orderStatus] ?? 0
  }, [tracking])

  if (loading || authLoading || !tracking) return <PageSkeleton />

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Live Tracking" title={tracking.orderNumber} copy="Auto-refreshes every 15 seconds so users see delivery updates quickly." backTo="/orders" backLabel="Back to orders" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-sky-100 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-mist text-brand-blue"><Truck className="h-6 w-6" /></span>
          <div>
            <p className="font-display text-xl font-extrabold text-brand-ink">{formatStatus(tracking.deliveryStatus || tracking.orderStatus)}</p>
            <p className="text-sm font-semibold text-slate-500">Last refresh: {lastUpdated ? formatDate(lastUpdated) : 'Just now'}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => loadTracking(false)} className="rounded-full"><RotateCw className="h-4 w-4" /> Refresh Now</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-extrabold text-brand-ink">Shipment Journey</h2>
          <div className="mt-8 space-y-0">
            {steps.map((step, index) => {
              const completed = index <= activeRank
              return (
                <div key={step.key} className="grid grid-cols-[44px_1fr] gap-4">
                  <div className="grid justify-center">
                    <span className={`grid h-11 w-11 place-items-center rounded-full border-2 ${completed ? 'border-brand-green bg-brand-green text-white' : 'border-sky-100 bg-sky-50 text-slate-400'}`}>
                      {completed ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </span>
                    {index < steps.length - 1 && <span className={`mx-auto h-12 w-1 ${index < activeRank ? 'bg-brand-green' : 'bg-sky-100'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className="font-display text-lg font-extrabold text-brand-ink">{step.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{completed ? 'Completed or in progress' : 'Waiting for update'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <TrackingInfo tracking={tracking} />
          <TrackingHistory history={tracking.trackingHistory || []} />
        </aside>
      </div>
    </section>
  )
}

function TrackingInfo({ tracking }) {
  return (
    <div className="rounded-[1.6rem] border border-sky-100 bg-white p-5 shadow-soft">
      <h3 className="font-display text-xl font-extrabold text-brand-ink">Courier Details</h3>
      <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
        <p>Courier: <span className="font-extrabold text-brand-ink">{tracking.courierName || 'Will update soon'}</span></p>
        <p>Tracking ID: <span className="font-extrabold text-brand-ink">{tracking.trackingId || 'Not assigned yet'}</span></p>
        <p>Estimated Delivery: <span className="font-extrabold text-brand-ink">{tracking.estimatedDeliveryDate ? formatDate(tracking.estimatedDeliveryDate) : 'Will update soon'}</span></p>
      </div>
      {tracking.trackingUrl && (
        <Link to={tracking.trackingUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-extrabold text-white">
          Courier Tracking <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

function TrackingHistory({ history }) {
  return (
    <div className="rounded-[1.6rem] border border-sky-100 bg-white p-5 shadow-soft">
      <h3 className="font-display text-xl font-extrabold text-brand-ink">Tracking History</h3>
      <div className="mt-5 space-y-4">
        {history.length === 0 ? (
          <div className="rounded-2xl bg-sky-50 p-4 text-sm font-semibold text-slate-500">
            <Package className="mb-2 h-5 w-5 text-brand-blue" />
            Tracking history will appear after admin updates delivery.
          </div>
        ) : (
          history.slice().reverse().map((item, index) => (
            <div key={`${item.status}-${item.updatedAt}-${index}`} className="rounded-2xl bg-sky-50/70 p-4">
              <p className="font-display text-base font-extrabold text-brand-ink">{formatStatus(item.status)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{item.message}</p>
              {item.location && <p className="mt-1 text-xs font-bold text-brand-blue">{item.location}</p>}
              <p className="mt-2 text-xs font-bold text-slate-400">{formatDate(item.updatedAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
