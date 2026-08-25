import { CheckCircle2, CreditCard, LockKeyhole, MapPin, PackageCheck, Plus, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { addressService, couponService, orderService, paymentService } from '../api/services'
import Button from '../components/Button'
import Input from '../components/Input'
import OrderSummary from '../components/OrderSummary'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'

const phonePattern = /^[6-9]\d{9}$/
const postalPattern = /^\d{6}$/

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { items, totals, syncCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('ONLINE')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [pending, setPending] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState('')
  const [successPaymentMethod, setSuccessPaymentMethod] = useState('')

  const payable = useMemo(() => coupon?.payableAmount ?? totals.total, [coupon, totals.total])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    addressService
      .list()
      .then((response) => {
        setAddresses(response.addresses || [])
        const defaultAddress = response.addresses?.find((address) => address.isDefault) || response.addresses?.[0]
        if (defaultAddress) setSelectedAddress(defaultAddress._id)
      })
      .catch((error) => toast.error(error.message))
  }, [authLoading, isAuthenticated, navigate])

  const refreshAddresses = async () => {
    const response = await addressService.list()
    setAddresses(response.addresses || [])
    return response.addresses || []
  }

  const handleAddAddress = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (!data.fullName || !phonePattern.test(data.phone || '') || !data.addressLine1 || !data.city || !data.state || !postalPattern.test(data.postalCode || '')) {
      toast.error('Please enter valid delivery details')
      return
    }
    try {
      const response = await addressService.create({ ...data, isDefault: true })
      const nextAddresses = await refreshAddresses()
      setSelectedAddress(response.address?._id || nextAddresses[0]?._id || '')
      setShowAddressForm(false)
      toast.success('Address saved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Enter coupon code')
    try {
      const response = await couponService.apply({ code: couponCode, cartTotal: totals.subtotal })
      setCoupon(response)
      toast.success('Coupon applied')
    } catch (error) {
      setCoupon(null)
      toast.error(error.message)
    }
  }

  const openRazorpay = async (checkoutPayload) => {
    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Razorpay could not load')
      return false
    }

    const payment = await paymentService.createRazorpayOrder(checkoutPayload)
    const options = {
      key: payment.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: payment.razorpayOrder.amount,
      currency: payment.razorpayOrder.currency,
      name: 'BabyCure',
      description: 'BabyCure checkout',
      order_id: payment.razorpayOrder.id,
      handler: async (response) => {
        try {
          let verified
          try {
            verified = await paymentService.verifyRazorpayPayment(response)
          } catch (error) {
            if (error.status < 500) throw error
            // Verification is idempotent. Retry once when a transient proxy,
            // database, or process failure interrupts the first response.
            verified = await paymentService.verifyRazorpayPayment(response)
          }
          await syncCart()
          const orderId = verified.order._id
          setPending(false)
          setSuccessPaymentMethod('ONLINE')
          setSuccessOrderId(orderId)
          toast.success('Payment successful! Your order is confirmed.')
          window.setTimeout(() => navigate(`/orders/${orderId}`), 2200)
        } catch (error) {
          toast.error(error.message)
          setPending(false)
        }
      },
      modal: {
        ondismiss: () => {
          toast.error('Payment was not completed')
          setPending(false)
        },
      },
      theme: { color: '#0757a8' },
    }
    new window.Razorpay(options).open()
    return true
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) return toast.error('Your bag is empty')
    if (!selectedAddress) return toast.error('Please select or add an address')
    setPending(true)
    try {
      const checkoutPayload = {
        shippingAddress: selectedAddress,
        couponCode: coupon?.coupon?.code || couponCode || undefined,
      }
      if (paymentMethod === 'ONLINE') {
        const opened = await openRazorpay(checkoutPayload)
        if (opened) return
        setPending(false)
      } else if (paymentMethod === 'COD') {
        const response = await orderService.create({
          ...checkoutPayload,
          paymentMethod: 'COD',
        })
        await syncCart()
        const orderId = response.order._id
        setPending(false)
        setSuccessPaymentMethod('COD')
        setSuccessOrderId(orderId)
        toast.success('Congratulations! Your COD order is confirmed.')
        window.setTimeout(() => navigate(`/orders/${orderId}`), 2200)
      }
    } catch (error) {
      toast.error(error.status === 401 ? 'Your session has expired. Please login again.' : error.message)
      if (error.status === 401) navigate('/login', { state: { from: '/checkout' } })
      setPending(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
      {successOrderId && <OrderSuccessBlast paymentMethod={successPaymentMethod} />}
      <PageHeader eyebrow="Checkout" title="Shipping and Payment" copy="Select an address, apply a coupon, and pay securely online or on delivery." backTo="/cart" backLabel="Back to bag" />
      <CheckoutSteps />
      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-black text-slate-950">Delivery address</h3>
              <Button variant="ghost" onClick={() => setShowAddressForm((value) => !value)}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {addresses.map((address) => (
                <button key={address._id} type="button" onClick={() => setSelectedAddress(address._id)} className={`min-w-0 rounded-md border p-4 text-left transition ${selectedAddress === address._id ? 'border-brand-blue bg-blue-50 shadow-[0_14px_32px_rgba(7,87,168,0.10)]' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                  <MapPin className="mb-3 h-5 w-5 text-brand-green" />
                  <p className="font-black text-slate-950">{address.fullName}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{address.addressLine1}, {address.city}, {address.state} - {address.postalCode}</p>
                  <p className="mt-2 text-sm font-black text-brand-blue">{address.phone}</p>
                </button>
              ))}
            </div>
            {showAddressForm && <AddressForm onSubmit={handleAddAddress} />}
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
            <h3 className="mb-5 font-display text-2xl font-black text-slate-950">Payment method</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                [PackageCheck, 'COD', 'Cash on Delivery'],
                [CreditCard, 'ONLINE', 'Razorpay Online'],
              ].map(([Icon, value, label]) => (
                <button key={value} type="button" onClick={() => setPaymentMethod(value)} className={`rounded-md border p-5 text-left transition ${paymentMethod === value ? 'border-brand-blue bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <Icon className="mb-3 h-6 w-6 text-brand-blue" />
                  <span className="font-black text-slate-950">{label}</span>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{value === 'COD' ? 'Pay when your parcel is delivered.' : 'Pay now with Razorpay.'}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input label="Coupon Code" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="SAVE10" />
              <Button className="self-end" variant="outline" onClick={applyCoupon}>Apply</Button>
            </div>
            {coupon && <p className="mt-3 text-sm font-black text-brand-green">Coupon saved {formatPrice(coupon.discountAmount)}. Payable {formatPrice(payable)}.</p>}
            <Button type="button" variant="green" className="mt-7 w-full" onClick={handlePlaceOrder} disabled={pending}>
              <LockKeyhole className="h-5 w-5" /> {pending ? 'Placing order...' : `${paymentMethod === 'COD' ? 'Place COD Order' : 'Pay & Place Order'} ${formatPrice(payable)}`}
            </Button>
          </div>
        </div>
        <OrderSummary />
      </div>
    </section>
  )
}

function OrderSuccessBlast({ paymentMethod }) {
  const isCod = paymentMethod === 'COD'
  const confetti = useMemo(
    () => Array.from({ length: 42 }, (_, index) => ({
      id: index,
      left: `${(index * 29) % 100}%`,
      delay: `${(index % 9) * 0.08}s`,
      duration: `${1.2 + (index % 5) * 0.16}s`,
      color: ['#4aa6d9', '#70c96a', '#ffd166', '#ff6b6b', '#0757a8'][index % 5],
      rotate: `${(index * 37) % 180}deg`,
    })),
    [],
  )

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-white/88 px-4 text-center backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="order-confetti"
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotate})`,
            }}
          />
        ))}
      </div>
      <div className="relative w-full max-w-md rounded-md border border-green-100 bg-white p-7 shadow-[0_24px_70px_rgba(74,166,217,0.22)] sm:p-9">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-50 text-brand-green">
          <CheckCircle2 className="h-11 w-11" />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-brand-blue">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-black uppercase tracking-[0.16em]">{isCod ? 'Order confirmed' : 'Payment successful'}</span>
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="mt-3 font-display text-3xl font-black text-brand-ink sm:text-4xl">Congratulations!</h2>
        <p className="mt-3 text-base font-bold leading-7 text-slate-600">
          {isCod
            ? 'Your BabyCure order has been placed successfully. Please pay when your parcel is delivered.'
            : 'Your payment is complete and your BabyCure order has been placed successfully.'}
        </p>
        <div className={`mt-5 rounded-md px-4 py-3 text-sm font-black ${isCod ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-brand-green'}`}>
          {isCod ? 'Cash on Delivery • Payment pending until delivery' : 'Prepaid • Payment completed'}
        </div>
      </div>
    </div>
  )
}

function AddressForm({ onSubmit }) {
  return (
    <form className="mt-6 rounded-md bg-blue-50/60 p-4 sm:p-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Full Name" name="fullName" placeholder="Full Name" />
        <Input label="Phone" name="phone" placeholder="9876543210" />
      </div>
      <div className="mt-4">
        <Input label="Address" name="addressLine1" placeholder="House no, street, area" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Input label="City" name="city" placeholder="City" />
        <Input label="State" name="state" placeholder="State" />
        <Input label="Pincode" name="postalCode" placeholder="110016" />
      </div>
      <Button type="submit" className="mt-5">Save Address</Button>
    </form>
  )
}

function CheckoutSteps() {
  return (
    <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
      {['Shipping Address', 'Payment Method', 'Order Summary'].map((step, index) => (
        <div key={step} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-blue text-sm font-black text-white">{index + 1}</span>
          <span className="font-black text-brand-blue">{step}</span>
        </div>
      ))}
    </div>
  )
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
