import { Check, Clock, ExternalLink, RotateCw, Truck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { orderService } from '../api/services'
import Button from '../components/Button'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { formatDate, formatStatus } from './MyOrdersPage'

const steps = [
  { key: 'placed', label: 'Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

const statusRank = {
  placed: 0,
  processing: 1,
  pending: 1,
  packed: 2,
  pickup_scheduled: 3,
  picked_up: 4,
  shipped: 5,
  in_transit: 6,
  out_for_delivery: 7,
  delivered: 8,
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
    const timer = window.setInterval(() => loadTracking(true), 10000)
    return () => window.clearInterval(timer)
  }, [loadTracking])

  const activeRank = useMemo(() => {
    const status = tracking?.deliveryStatus || tracking?.orderStatus || 'placed'
    return statusRank[status] ?? statusRank[tracking?.orderStatus] ?? 0
  }, [tracking])

  if (loading || authLoading || !tracking) return <PageSkeleton />

  const currentStatus = tracking.deliveryStatus || tracking.orderStatus || 'placed'

  return (
    <section className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-7">
      <CompactOrderHeader eyebrow="Live Tracking" title={tracking.orderNumber} copy="Shipment updates sync automatically from Shiprocket." backTo="/orders" backLabel="Back to orders" />

      <div className="mb-4 rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-mist text-brand-blue"><Truck className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Current status</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{formatStatus(currentStatus)}</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Last refresh: {lastUpdated ? formatDate(lastUpdated) : 'Just now'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tracking.trackingUrl && (
              <a href={tracking.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white">
                Courier Website <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <Button variant="ghost" onClick={() => loadTracking(false)} className="rounded-full"><RotateCw className="h-4 w-4" /> Refresh</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
        <ShipmentJourney activeRank={activeRank} />
        <aside>
          <TrackingInfo tracking={tracking} />
        </aside>
      </div>
    </section>
  )
}

function CompactOrderHeader({ eyebrow, title, copy, backTo, backLabel }) {
  return (
    <div className="mb-5">
      <Link to={backTo} className="inline-flex items-center rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-brand-blue shadow-sm">{backLabel}</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-green">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">{copy}</p>
    </div>
  )
}

function ShipmentJourney({ activeRank }) {
  const safeRank = Math.max(0, Math.min(activeRank, steps.length - 1))
  const progress = (safeRank / (steps.length - 1)) * 100

  return (
    <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-brand-ink">Shipment Journey</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Step-by-step delivery progress.</p>
        </div>
        <span className="rounded-full bg-brand-leaf px-3 py-1 text-xs font-semibold text-brand-green">{Math.min(activeRank + 1, steps.length)} of {steps.length}</span>
      </div>

      <div className="mt-6 hidden md:block">
        <div className="relative px-3">
          <div className="absolute left-8 right-8 top-4 h-1 rounded-full bg-slate-100" />
          <div className="absolute left-8 top-4 h-1 rounded-full bg-brand-green transition-all duration-500" style={{ width: `calc((100% - 4rem) * ${progress / 100})` }} />
          <div className="relative grid grid-cols-9 gap-1">
            {steps.map((step, index) => {
              const completed = index <= safeRank
              const active = index === safeRank
              return (
                <div key={step.key} className="grid justify-items-center gap-2">
                  <span className={`grid h-9 w-9 place-items-center rounded-full border-2 text-xs transition ${completed ? 'border-brand-green bg-brand-green text-white' : 'border-slate-200 bg-white text-slate-400'} ${active ? 'shadow-[0_0_0_5px_rgba(124,197,118,0.16)]' : ''}`}>
                    {completed ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className={`max-w-[92px] text-center text-xs font-semibold leading-4 ${completed ? 'text-brand-ink' : 'text-slate-400'}`}>{step.label}</span>
                  <span className={`text-[11px] font-medium ${active ? 'text-brand-green' : completed ? 'text-slate-500' : 'text-slate-400'}`}>
                    {active ? 'Current' : completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 md:hidden">
        {steps.map((step, index) => {
          const completed = index <= safeRank
          const active = index === safeRank
          return (
            <div key={step.key} className="grid grid-cols-[34px_1fr] gap-3">
              <div className="grid justify-center">
                <span className={`grid h-8 w-8 place-items-center rounded-full border ${completed ? 'border-brand-green bg-brand-green text-white' : 'border-slate-200 bg-white text-slate-400'}`}>
                  {completed ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </span>
                {index < steps.length - 1 && <span className={`mx-auto h-9 w-px ${index < activeRank ? 'bg-brand-green' : 'bg-slate-200'}`} />}
              </div>
              <div className="pb-5">
                <div className={`rounded-md border px-3 py-2 ${completed ? 'border-green-100 bg-green-50/70' : 'border-slate-100 bg-slate-50'}`}>
                  <p className="font-display text-base font-semibold text-brand-ink">{step.label}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{active ? 'Current update' : completed ? 'Completed' : 'Waiting for update'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrackingInfo({ tracking }) {
  const estimatedDelivery = tracking.estimatedDeliveryDate ? new Date(tracking.estimatedDeliveryDate) : null
  const daysRemaining = estimatedDelivery
    ? Math.max(Math.ceil((estimatedDelivery.getTime() - Date.now()) / (24 * 60 * 60 * 1000)), 0)
    : null
  const estimatedDeliveryLabel = estimatedDelivery
    ? `${estimatedDelivery.toLocaleDateString('en-IN', { dateStyle: 'medium' })}${daysRemaining > 0 ? ` (about ${daysRemaining} day${daysRemaining === 1 ? '' : 's'})` : ''}`
    : 'Awaiting estimate from courier'

  return (
    <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-brand-ink">Courier Details</h3>
      <div className="mt-3 grid gap-2 text-sm font-medium text-slate-600">
        <InfoRow label="Courier" value={tracking.courierName || 'Will update soon'} />
        <InfoRow label="AWB Number" value={tracking.awbCode || tracking.trackingId || 'Not assigned yet'} />
        <InfoRow label="Estimated Delivery" value={estimatedDeliveryLabel} />
      </div>
      <p className="mt-3 text-xs font-medium leading-5 text-slate-500">Courier estimate based on the delivery location and current shipment movement. It updates automatically when Shiprocket revises the EDD.</p>
      {tracking.trackingUrl && (
        <Link to={tracking.trackingUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white">
          Track on Courier Website <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-md bg-brand-mist px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-brand-ink">{value}</p>
    </div>
  )
}
