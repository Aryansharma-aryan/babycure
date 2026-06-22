import { CreditCard, LockKeyhole, MapPin, PackageCheck, Plus, ShieldCheck } from 'lucide-react'
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
  const { isAuthenticated } = useAuth()
  const { items, totals, syncCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [pending, setPending] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const payable = useMemo(() => coupon?.payableAmount ?? totals.total, [coupon, totals.total])

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue checkout')
      navigate('/login')
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
  }, [isAuthenticated, navigate])

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

  const openRazorpay = async (order) => {
    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Razorpay could not load')
      return
    }

    const payment = await paymentService.createRazorpayOrder(order._id)
    const options = {
      key: payment.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: payment.razorpayOrder.amount,
      currency: payment.razorpayOrder.currency,
      name: 'BabyCure',
      description: `Order ${order.orderNumber}`,
      order_id: payment.razorpayOrder.id,
      handler: async (response) => {
        try {
          await paymentService.verifyRazorpayPayment({ orderId: order._id, ...response })
          await syncCart()
          toast.success('Payment successful')
          navigate(`/orders/${order._id}`)
        } catch (error) {
          toast.error(error.message)
        }
      },
      theme: { color: '#0757a8' },
    }
    new window.Razorpay(options).open()
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) return toast.error('Your cart is empty')
    if (!selectedAddress) return toast.error('Please select or add an address')
    setPending(true)
    try {
      const response = await orderService.create({
        shippingAddress: selectedAddress,
        paymentMethod,
        couponCode: coupon?.coupon?.code || couponCode || undefined,
      })
      toast.success(paymentMethod === 'COD' ? 'COD order placed' : 'Order created. Complete payment.')
      if (paymentMethod === 'ONLINE') {
        await openRazorpay(response.order)
      } else {
        await syncCart()
        navigate(`/orders/${response.order._id}`)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Checkout" title="Shipping and Payment" copy="Select address, apply coupon, choose COD or Razorpay online payment." backTo="/cart" backLabel="Back to cart" />
      <CheckoutSteps />
      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-black text-slate-950">Delivery address</h3>
              <Button variant="ghost" onClick={() => setShowAddressForm((value) => !value)}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {addresses.map((address) => (
                <button key={address._id} type="button" onClick={() => setSelectedAddress(address._id)} className={`rounded-md border p-4 text-left transition ${selectedAddress === address._id ? 'border-brand-blue bg-blue-50 shadow-[0_14px_32px_rgba(7,87,168,0.10)]' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                  <MapPin className="mb-3 h-5 w-5 text-brand-green" />
                  <p className="font-black text-slate-950">{address.fullName}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{address.addressLine1}, {address.city}, {address.state} - {address.postalCode}</p>
                  <p className="mt-2 text-sm font-black text-brand-blue">{address.phone}</p>
                </button>
              ))}
            </div>
            {showAddressForm && <AddressForm onSubmit={handleAddAddress} />}
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="mb-5 font-display text-2xl font-black text-slate-950">Payment method</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {[[PackageCheck, 'COD', 'Cash on Delivery'], [CreditCard, 'ONLINE', 'Razorpay Online']].map(([Icon, value, label]) => (
                <button key={value} type="button" onClick={() => setPaymentMethod(value)} className={`rounded-md border p-5 text-left transition ${paymentMethod === value ? 'border-brand-blue bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <Icon className="mb-3 h-6 w-6 text-brand-blue" />
                  <span className="font-black text-slate-950">{label}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input label="Coupon Code" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="SAVE10" />
              <Button className="self-end" variant="outline" onClick={applyCoupon}>Apply</Button>
            </div>
            {coupon && <p className="mt-3 text-sm font-black text-brand-green">Coupon saved {formatPrice(coupon.discountAmount)}. Payable {formatPrice(payable)}.</p>}
            <Button type="button" variant="green" className="mt-7 w-full" onClick={handlePlaceOrder} disabled={pending}>
              <LockKeyhole className="h-5 w-5" /> {pending ? 'Placing order...' : `Place Order ${formatPrice(payable)}`}
            </Button>
          </div>
        </div>
        <OrderSummary />
      </div>
    </section>
  )
}

function AddressForm({ onSubmit }) {
  return (
    <form className="mt-6 rounded-md bg-blue-50/60 p-5" onSubmit={onSubmit}>
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
