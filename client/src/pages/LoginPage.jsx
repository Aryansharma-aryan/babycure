import { KeyRound, Mail, Phone, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Logo from '../components/Logo'
import PageHeader from '../components/PageHeader'
import { images } from '../data/products'
import { useAuth } from '../hooks/useAuth'

const phonePattern = /^[6-9]\d{9}$/

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [authType, setAuthType] = useState('email')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpHint, setOtpHint] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, login, logout, register, sendPhoneOtp, user, verifyPhoneOtp } = useAuth()

  const title = useMemo(() => {
    if (isAuthenticated) return 'Your Babycure account'
    if (authType === 'phone') return otpSent ? 'Verify phone OTP' : 'Continue with phone'
    return mode === 'login' ? 'Sign in to continue' : 'Create your account'
  }, [authType, isAuthenticated, mode, otpSent])

  const handleEmailSubmit = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))

    if (!data.email || !String(data.email).includes('@') || !data.password) {
      toast.error('Please enter valid email and password')
      return
    }

    if (mode === 'register' && (!data.name || !phonePattern.test(String(data.phone || '')))) {
      toast.error('Please enter your name and a valid 10 digit phone number')
      return
    }

    setPending(true)
    try {
      if (mode === 'login') {
        const response = await login({ email: data.email, password: data.password })
        navigate(response.user?.role === 'admin' ? '/admin' : '/')
        return
      } else {
        const response = await register({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        })
        navigate(response.user?.role === 'admin' ? '/admin' : '/')
        return
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  const handleSendOtp = async (event) => {
    event.preventDefault()

    if (!phonePattern.test(phone)) {
      toast.error('Please enter a valid 10 digit phone number')
      return
    }

    setPending(true)
    try {
      const response = await sendPhoneOtp({ phone })
      setOtpHint(response.devOtp || '')
      setOtpSent(true)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))

    if (!/^\d{6}$/.test(String(data.otp || ''))) {
      toast.error('Please enter the 6 digit OTP')
      return
    }

    setPending(true)
    try {
      const response = await verifyPhoneOtp({ phone, otp: data.otp })
      navigate(response.user?.role === 'admin' ? '/admin' : '/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  const handleLogout = async () => {
    setPending(true)
    try {
      await logout()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Account" title="Login / Register" copy="Manage orders, addresses and saved care lists." backTo="/" backLabel="Back to store" />
      <div className="grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[520px]">
          <img src={images.nursery} alt="Soft nursery interior" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 to-brand-blue/10" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="font-display text-4xl font-black">Welcome to Babycure</h2>
            <p className="mt-3 max-w-md font-semibold text-blue-50">Track orders and keep your baby's care essentials ready.</p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <Logo />

          {isAuthenticated ? (
            <div className="mt-8 rounded-md border border-green-100 bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-brand-green">
                <ShieldCheck className="h-7 w-7" />
              </span>
              <h2 className="mt-5 font-display text-3xl font-black text-slate-950">{title}</h2>
              <p className="mt-3 font-semibold text-slate-600">
                Signed in as <span className="text-brand-blue">{user?.name || user?.phone || user?.email}</span>
              </p>
              <div className="mt-5 grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-2">
                {user?.email && <p>Email: {user.email}</p>}
                {user?.phone && <p>Phone: {user.phone}</p>}
                <p>Role: {user?.role}</p>
                <p>Phone verified: {user?.isPhoneVerified ? 'Yes' : 'No'}</p>
              </div>
              <Button type="button" variant="outline" className="mt-7" onClick={handleLogout} disabled={pending}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
                {[
                  ['email', Mail, 'Email'],
                  ['phone', Phone, 'Phone OTP'],
                ].map(([item, Icon, label]) => (
                  <button
                    key={item}
                    type="button"
                    className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-black ${authType === item ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setAuthType(item)}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>

              <h2 className="mt-6 font-display text-3xl font-black text-slate-950">{title}</h2>

              {authType === 'email' ? (
                <form className="mt-7" onSubmit={handleEmailSubmit}>
                  <div className="mb-5 inline-flex rounded-md bg-slate-100 p-1">
                    {['login', 'register'].map((item) => (
                      <button key={item} type="button" className={`rounded-md px-5 py-2 text-sm font-black capitalize ${mode === item ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500'}`} onClick={() => setMode(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                  {mode === 'register' && <Input label="Full Name" name="name" placeholder="Full Name" />}
                  <div className="mt-4">
                    <Input label="Email Address" name="email" type="email" placeholder="Email Address" autoComplete="email" />
                  </div>
                  {mode === 'register' && (
                    <div className="mt-4">
                      <Input label="Phone Number" name="phone" inputMode="numeric" maxLength="10" placeholder="9876543210" autoComplete="tel" />
                    </div>
                  )}
                  <div className="mt-4">
                    <Input label="Password" name="password" type="password" placeholder="Password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm font-bold">
                    <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="accent-brand-blue" /> Remember me</label>
                    <button type="button" className="text-brand-blue">Forgot password?</button>
                  </div>
                  <Button type="submit" className="mt-7 w-full" disabled={pending}>
                    {pending ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
                  </Button>
                </form>
              ) : (
                <form className="mt-7" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                  <Input
                    label="Phone Number"
                    name="phone"
                    inputMode="numeric"
                    maxLength="10"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={otpSent}
                    autoComplete="tel"
                  />
                  {otpSent && (
                    <div className="mt-4 space-y-3">
                      {otpHint && (
                        <div className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm font-black text-brand-green">
                          Development OTP: <span className="font-display text-lg text-slate-950">{otpHint}</span>
                        </div>
                      )}
                      <Input label="6 Digit OTP" name="otp" inputMode="numeric" maxLength="6" placeholder="123456" autoComplete="one-time-code" />
                    </div>
                  )}
                  <Button type="submit" variant="green" className="mt-7 w-full" disabled={pending}>
                    {pending ? 'Please wait...' : otpSent ? 'Verify OTP' : 'Send OTP'}
                  </Button>
                  {otpSent && (
                    <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand-blue" onClick={() => { setOtpSent(false); setOtpHint('') }}>
                      <KeyRound className="h-4 w-4" /> Change phone number
                    </button>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
