import { ArrowLeft, ArrowRight, Ban, CheckCircle2, CreditCard, Download, ExternalLink, FileText, MapPin, PackageCheck, RotateCw, Truck, UploadCloud } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { resolveMediaUrl } from '../api/client'
import { orderService, returnRequestService } from '../api/services'
import Button from '../components/Button'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/format'
import { formatDate, formatStatus } from './MyOrdersPage'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [requests, setRequests] = useState([])
  const [requestType, setRequestType] = useState('')

  const loadOrder = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const response = await orderService.get(id)
      setOrder(response.order)
      const requestResponse = await returnRequestService.mine({ orderId: id })
      setRequests(requestResponse.requests || [])
    } catch (error) {
      toast.error(error.message)
      navigate('/orders')
    } finally {
      if (!quiet) setLoading(false)
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

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const timer = window.setInterval(() => loadOrder(true), 30000)
    return () => window.clearInterval(timer)
  }, [isAuthenticated, loadOrder])

  useEffect(() => {
    const action = searchParams.get('action')
    const isDelivered = order?.orderStatus === 'delivered' || order?.deliveryStatus === 'delivered'
    if (isDelivered && ['return', 'replacement'].includes(action)) {
      setRequestType(action)
    }
  }, [order, searchParams])

  const closeRequestForm = () => {
    setRequestType('')
    if (searchParams.has('action')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('action')
      setSearchParams(nextParams, { replace: true })
    }
  }

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

  const downloadInvoice = async () => {
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

  const submitReturnRequest = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const selectedItems = Array.from(form.querySelectorAll('input[name="items"]:checked')).map((input) => input.value)
    data.delete('items')
    data.append('items', JSON.stringify(selectedItems))

    setPending(true)
    try {
      const action = requestType === 'replacement' ? returnRequestService.createReplacement : returnRequestService.createReturn
      await action(order._id, data)
      toast.success(`${requestType === 'replacement' ? 'Replacement' : 'Return'} request submitted`)
      closeRequestForm()
      await loadOrder()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  if (loading || authLoading || !order) return <PageSkeleton />

  const address = order.shippingAddress || {}
  const returnWindowActive = isReturnWindowActive(order)
  const canCancelOrder = isOrderCancellable(order)
  const summary = getOrderSummary(order)
  const progressSteps = getProgressSteps(order)

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-7">
      <div className="mb-5">
        <Link to="/orders" className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm transition hover:border-brand-blue hover:bg-brand-mist">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_24px_80px_rgba(74,166,217,0.14)]">
        <div className="relative bg-[linear-gradient(135deg,#F3FBFF,#FFFFFF_52%,#F5FFF3)] px-5 py-6 sm:px-7">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#4AA6D9,#7CC576)]" />
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">Order Details</p>
              <h1 className="mt-2 break-words font-display text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">{order.orderNumber}</h1>
              <p className="mt-2 text-sm font-medium text-slate-600">Placed on {formatDate(order.createdAt)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill label={formatStatus(order.orderStatus)} tone={order.orderStatus === 'cancelled' ? 'red' : 'blue'} />
                <StatusPill label={`${order.paymentMethod} - ${formatStatus(order.paymentStatus)}`} tone={order.paymentStatus === 'paid' ? 'green' : 'blue'} />
                <StatusPill label={formatStatus(order.deliveryStatus || order.orderStatus)} tone="green" />
              </div>
            </div>
            <div className="grid gap-2 rounded-xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:min-w-[260px]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Amount Paid</p>
              <p className="font-display text-3xl font-semibold text-brand-blue">{formatPrice(order.totalPrice)}</p>
              <p className="text-xs font-medium text-slate-500">Invoice and payment details are ready for this order.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-sky-100 bg-white px-5 py-5 sm:px-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              <div className="rounded-xl border border-sky-100 bg-brand-mist p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  {progressSteps.map((step, index) => (
                    <div key={step.key} className="min-w-0">
                      <div className={`h-2 rounded-full ${step.done ? 'bg-brand-green' : 'bg-white'}`} />
                      <div className="mt-3 flex items-start gap-2">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${step.done ? 'bg-brand-green text-white' : 'bg-white text-slate-400'}`}>
                          {step.done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${step.done ? 'text-brand-ink' : 'text-slate-400'}`}>{step.label}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">{step.copy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-sky-100 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-sky-50/70 px-4 py-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-brand-ink">Ordered Products</h2>
                    <p className="mt-1 text-xs font-medium text-slate-500">{order.orderItems?.length || 0} item(s) in this order</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-blue shadow-sm">Final prices shown</span>
                </div>
                {order.orderItems?.map((item) => (
                  <div key={`${item.product}-${item.name}`} className="grid min-w-0 gap-4 border-b border-sky-50 p-4 last:border-0 sm:grid-cols-[86px_1fr_auto] sm:items-center">
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-sky-100 bg-sky-50">
                      {item.image ? <img src={resolveMediaUrl(item.image)} alt={item.name} className="h-full w-full object-cover" loading="lazy" /> : <PackageCheck className="h-8 w-8 text-brand-blue" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-brand-ink">{item.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-brand-mist px-3 py-1">Qty {item.quantity}</span>
                        <span className="rounded-full bg-brand-leaf px-3 py-1 text-brand-green">{formatPrice(item.price)} each</span>
                      </div>
                      {returnWindowActive && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => setRequestType('return')} className="rounded-full border border-green-100 bg-brand-leaf px-3 py-2 text-xs font-semibold text-brand-green">Return</button>
                          <button type="button" onClick={() => setRequestType('replacement')} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-semibold text-brand-blue">Replace</button>
                        </div>
                      )}
                    </div>
                    <p className="font-display text-lg font-semibold text-brand-blue sm:text-right">{formatPrice(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailPanel icon={CreditCard} title="Payment Summary">
                  <DetailLine label="Method" value={order.paymentMethod} />
                  <DetailLine label="Status" value={formatStatus(order.paymentStatus)} />
                  <DetailLine label="Subtotal" value={formatPrice(summary.subtotal)} />
                  <DetailLine label="Shipping" value={formatPrice(summary.shipping)} />
                  <DetailLine label="Discount" value={formatPrice(summary.discount)} />
                  <DetailLine label="Total" value={formatPrice(summary.total)} strong />
                </DetailPanel>
                <DetailPanel icon={MapPin} title="Delivery Address">
                  <p className="font-semibold text-brand-ink">{address.fullName}</p>
                  <p>{address.addressLine1}</p>
                  <p>{address.city}, {address.state} - {address.postalCode}</p>
                  <p>{address.phone}</p>
                </DetailPanel>
              </div>

              {requests.length > 0 && <ReturnRequestTimeline requests={requests} />}
              {requestType && (
                <ReturnRequestForm
                  order={order}
                  pending={pending}
                  type={requestType}
                  onClose={closeRequestForm}
                  onSubmit={submitReturnRequest}
                />
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <DetailPanel icon={Truck} title="Shipment">
                <DetailLine label="Courier" value={order.courierName || 'Will update soon'} />
                <DetailLine label="AWB" value={order.awbCode || order.trackingId || 'Not assigned yet'} />
                <DetailLine label="Status" value={formatStatus(order.deliveryStatus || order.orderStatus)} />
                <DetailLine label="Estimated" value={order.estimatedDeliveryDate ? formatDate(order.estimatedDeliveryDate) : 'Will update soon'} />
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
                    Track on courier website <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </DetailPanel>

              <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-brand-ink">Order Actions</h3>
                <div className="mt-4 grid gap-3">
                  <Button to={`/orders/${order._id}/tracking`} variant="outline" className="w-full rounded-full">Track Shipment <ArrowRight className="h-4 w-4" /></Button>
                  <button type="button" onClick={downloadInvoice} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-mist px-5 py-3 text-sm font-semibold text-brand-blue transition hover:bg-sky-100">
                    <Download className="h-4 w-4" /> Download Invoice
                  </button>
                  {canCancelOrder && (
                    <button disabled={pending} onClick={cancelOrder} className="flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-100 disabled:opacity-60">
                      <Ban className="h-4 w-4" /> {pending ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  {returnWindowActive && (
                    <>
                      <button disabled={pending} onClick={() => setRequestType('return')} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-leaf px-5 py-3 text-sm font-semibold text-brand-green transition hover:bg-green-100 disabled:opacity-60">
                        <RotateCw className="h-4 w-4" /> Return Product
                      </button>
                      <button disabled={pending} onClick={() => setRequestType('replacement')} className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-50 px-5 py-3 text-sm font-semibold text-brand-blue transition hover:bg-sky-100 disabled:opacity-60">
                        <PackageCheck className="h-4 w-4" /> Replace Product
                      </button>
                    </>
                  )}
                  <button onClick={loadOrder} className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-50 px-5 py-3 text-sm font-semibold text-brand-blue transition hover:bg-sky-100">
                    <RotateCw className="h-4 w-4" /> Refresh Details
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

const returnReasons = [
  ['damaged', 'Product received damaged'],
  ['wrong_product', 'Wrong product delivered'],
  ['missing_items', 'Missing item from order'],
  ['expired_or_defective', 'Expired or defective product'],
  ['other', 'Other eligible reason'],
]

const returnTimeline = ['requested', 'approved', 'pickup_scheduled', 'picked_up', 'received_by_seller', 'refund_completed']
const replacementTimeline = ['requested', 'approved', 'pickup_scheduled', 'picked_up', 'received_by_seller', 'replacement_shipped', 'replacement_delivered']
const RETURN_WINDOW_HOURS = 48

function getOrderSummary(order) {
  return {
    subtotal: order.itemsPrice ?? order.orderItems?.reduce((total, item) => total + item.quantity * item.price, 0) ?? 0,
    shipping: order.shippingPrice || 0,
    discount: order.discountAmount || 0,
    total: order.totalPrice || 0,
  }
}

function getProgressSteps(order) {
  const current = order.orderStatus === 'cancelled' ? 'cancelled' : order.deliveryStatus || order.orderStatus
  const rank = {
    placed: 1,
    processing: 2,
    packed: 2,
    shipped: 3,
    in_transit: 3,
    out_for_delivery: 4,
    delivered: 5,
  }
  const currentRank = rank[current] || 1
  return [
    { key: 'placed', label: 'Placed', copy: 'Order confirmed', done: currentRank >= 1 },
    { key: 'processing', label: 'Processing', copy: 'Preparing items', done: currentRank >= 2 },
    { key: 'shipped', label: 'Shipped', copy: 'Courier assigned', done: currentRank >= 3 },
    { key: 'delivered', label: current === 'cancelled' ? 'Cancelled' : 'Delivered', copy: current === 'cancelled' ? 'Order cancelled' : 'Completed', done: current === 'cancelled' || currentRank >= 5 },
  ]
}

function StatusPill({ label, tone = 'blue' }) {
  const styles = {
    blue: 'bg-sky-50 text-brand-blue border-sky-100',
    green: 'bg-brand-leaf text-brand-green border-green-100',
    red: 'bg-red-50 text-red-500 border-red-100',
  }
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[tone]}`}>{label}</span>
}

function isReturnWindowActive(order) {
  const isDelivered = order?.orderStatus === 'delivered' || order?.deliveryStatus === 'delivered'
  if (!isDelivered) return false
  const deliveredAt = order.deliveredAt || order.updatedAt || order.createdAt
  if (!deliveredAt) return true
  return Date.now() - new Date(deliveredAt).getTime() <= RETURN_WINDOW_HOURS * 60 * 60 * 1000
}

function isOrderCancellable(order) {
  const cancellableOrderStatuses = ['placed', 'processing']
  const cancellableDeliveryStatuses = ['placed', 'processing']
  return cancellableOrderStatuses.includes(order?.orderStatus) && cancellableDeliveryStatuses.includes(order?.deliveryStatus || 'placed')
}

function ReturnRequestForm({ order, type, pending, onClose, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-brand-ink">{type === 'return' ? 'Return Product' : 'Replace Product'}</h2>
        <button type="button" onClick={onClose} className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-brand-blue">Close</button>
      </div>
      <div className="mt-5 grid gap-3">
        {order.orderItems?.map((item) => (
          <label key={`${item.product}-${item.name}`} className="flex items-center gap-3 rounded-lg border border-sky-100 p-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="items" value={item.product?._id || item.product} defaultChecked />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
      <label className="mt-5 block text-sm font-semibold text-slate-700">Reason
        <select name="reason" required className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-medium">
          {returnReasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="mt-4 block text-sm font-semibold text-slate-700">Details
        <textarea name="details" rows="3" className="mt-2 w-full rounded-md border border-slate-200 p-4 text-sm font-medium" placeholder="Explain the issue clearly for faster approval." />
      </label>
      <label className="mt-4 block rounded-lg border border-dashed border-sky-200 bg-brand-mist p-4 text-sm font-medium text-slate-600">
        <span className="flex items-center gap-2 text-brand-blue"><UploadCloud className="h-5 w-5" /> Upload package/product images</span>
        <input name="images" type="file" accept="image/*" multiple className="mt-3 block w-full text-sm" />
      </label>
      <button disabled={pending} className="mt-5 w-full rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}

function ReturnRequestTimeline({ requests }) {
  return (
    <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-ink">Return / Replacement Status</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">Track pickup, courier and refund/replacement updates from here.</p>
      </div>
      <div className="mt-5 grid gap-4">
        {requests.map((request) => {
          const steps = request.type === 'replacement' ? replacementTimeline : returnTimeline
          const currentIndex = steps.indexOf(request.status)
          return (
            <CleanReturnRequestCard key={request._id} request={request} steps={steps} currentIndex={currentIndex} />
          )
        })}
      </div>
    </div>
  )
}

function CleanReturnRequestCard({ request, steps, currentIndex }) {
  const isReturn = request.type === 'return'
  const courier = isReturn ? request.returnCourierName : request.replacementCourierName
  const awb = isReturn ? request.returnAwbCode : request.replacementAwbCode
  const trackingUrl = isReturn ? request.returnTrackingUrl : request.replacementTrackingUrl
  const shipmentStatus = isReturn
    ? request.returnShipmentStatus || request.returnPickupStatus || request.status
    : request.replacementShipmentStatus || request.status

  return (
    <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-brand-ink">{request.requestNumber}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{formatStatus(request.type)} request for this order</p>
        </div>
        <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold text-brand-blue">{formatStatus(request.status)}</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((step, index) => (
          <div key={step} className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${index <= currentIndex ? 'border-green-100 bg-green-50 text-brand-green' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${index <= currentIndex ? 'bg-brand-green text-white' : 'bg-white text-slate-400'}`}>{index + 1}</span>
            <span className="text-xs font-semibold">{formatStatus(step)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 rounded-lg border border-sky-100 bg-brand-mist p-3 text-xs font-medium text-slate-600 sm:grid-cols-2">
        <p><span className="font-semibold text-brand-ink">{isReturn ? 'Return' : 'Replacement'} Courier:</span> {courier || 'Not assigned yet'}</p>
        <p><span className="font-semibold text-brand-ink">{isReturn ? 'Return' : 'Replacement'} AWB:</span> {awb || 'Not assigned yet'}</p>
        <p><span className="font-semibold text-brand-ink">Status:</span> {formatStatus(shipmentStatus)}</p>
        {trackingUrl && (
          <a href={trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-brand-blue">
            Track {isReturn ? 'Return' : 'Replacement'} <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {request.images?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {request.images.map((image) => (
            <a key={image.url} href={resolveMediaUrl(image.url)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <img src={resolveMediaUrl(image.url)} alt="Return evidence" className="h-20 w-20 object-cover" />
            </a>
          ))}
        </div>
      )}

      {request.statusHistory?.length > 0 && (
        <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">{request.statusHistory.at(-1)?.message}</p>
      )}
    </div>
  )
}

function DetailPanel({ icon: Icon, title, children }) {
  return (
    <div className="min-w-0 rounded-xl border border-sky-100 bg-white p-4 text-sm font-medium leading-7 text-slate-600 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-mist text-brand-blue shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-display text-lg font-semibold text-brand-ink">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function DetailLine({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-sky-50 py-1.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className={`text-right text-sm ${strong ? 'font-display text-lg font-semibold text-brand-blue' : 'font-medium text-slate-700'}`}>{value || 'Not available'}</span>
    </div>
  )
}
