import { CreditCard, LockKeyhole, PackageCheck, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import OrderSummary from '../components/OrderSummary'
import PageHeader from '../components/PageHeader'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totals, clearCart } = useCart()
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    if (items.length === 0) {
      toast.error('Your cart is empty')
      navigate('/category')
      return
    }

    const data = Object.fromEntries(new FormData(event.currentTarget))
    const nextErrors = {}
    ;['name', 'phone', 'address', 'city', 'pincode'].forEach((field) => {
      if (!data[field]?.trim()) nextErrors[field] = 'Required'
    })
    if (data.phone && data.phone.trim().length < 10) nextErrors.phone = 'Enter valid phone'
    if (data.pincode && data.pincode.trim().length < 6) nextErrors.pincode = 'Enter valid pincode'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      toast.error('Please complete shipping details')
      return
    }

    clearCart()
    toast.success('Order placed successfully')
    navigate('/')
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Checkout" title="Shipping and Payment" copy="Validated checkout with order summary and secure payment options." backTo="/cart" backLabel="Back to cart" />
      <CheckoutSteps />
      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_380px]">
        <form className="rounded-md border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
          <h3 className="mb-5 font-display text-2xl font-black text-slate-950">Delivery details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full Name" name="name" placeholder="Full Name" error={errors.name} />
            <Input label="Phone Number" name="phone" placeholder="Phone Number" error={errors.phone} />
          </div>
          <div className="mt-4">
            <Input label="Address" name="address" placeholder="House no, street, area" error={errors.address} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="City" name="city" placeholder="City" error={errors.city} />
            <Input label="Pincode" name="pincode" placeholder="Pincode" error={errors.pincode} />
          </div>

          <h3 className="mb-5 mt-8 font-display text-2xl font-black text-slate-950">Payment method</h3>
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            {[[CreditCard, 'Card'], [ShieldCheck, 'UPI'], [PackageCheck, 'Cash']].map(([Icon, label], index) => (
              <button key={label} type="button" className={`rounded-md border p-4 text-left ${index === 0 ? 'border-brand-blue bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <Icon className="mb-3 h-6 w-6 text-brand-blue" />
                <span className="font-black text-slate-950">{label}</span>
              </button>
            ))}
          </div>
          <label className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-600">
            <input type="checkbox" className="accent-brand-blue" /> Save address for next order
          </label>
          <Button type="submit" variant="green" className="mt-7 w-full">
            <LockKeyhole className="h-5 w-5" /> Place Order {formatPrice(totals.total)}
          </Button>
        </form>
        <OrderSummary />
      </div>
    </section>
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
