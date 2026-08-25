import { KeyRound, Mail, Phone, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Logo from '../components/Logo'
import PageHeader from '../components/PageHeader'
import authImage from '../assets/babycure-hero-products.png'
import { useAuth } from '../hooks/useAuth'

const phonePattern = /^[6-9]\d{9}$/
const isAdminUser = (user) => String(user?.role || '').trim().toLowerCase() === 'admin'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [authType, setAuthType] = useState('email')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpHint, setOtpHint] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtpSent, setResetOtpSent] = useState(false)
  const [formResetKey, setFormResetKey] = useState(0)
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login, logout, register, resetPassword, sendPasswordResetOtp, sendPhoneOtp, user, verifyPhoneOtp } = useAuth()
  const requestedPath = typeof location.state?.from === 'string' && location.state.from.startsWith('/')
    ? location.state.from
    : '/'
  const postAuthPath = isAdminUser(user) ? '/admin' : requestedPath

  useEffect(() => {
    if (isAuthenticated) {
      navigate(postAuthPath, { replace: true })
    }
  }, [isAuthenticated, navigate, postAuthPath])

  const title = useMemo(() => {
    if (isAuthenticated) return 'Your Babycure account'
    if (authType === 'forgot') return resetOtpSent ? 'Reset your password' : 'Forgot password'
    if (authType === 'phone') return otpSent ? 'Verify phone OTP' : 'Continue with phone'
    return mode === 'login' ? 'Sign in to continue' : 'Create your account'
  }, [authType, isAuthenticated, mode, otpSent, resetOtpSent])

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
        navigate(isAdminUser(response.user) ? '/admin' : requestedPath, { replace: true })
        return
      } else {
        const response = await register({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        })
        navigate(isAdminUser(response.user) ? '/admin' : requestedPath, { replace: true })
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
      navigate(isAdminUser(response.user) ? '/admin' : requestedPath, { replace: true })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  const handleSendPasswordOtp = async (event) => {
    event.preventDefault()
    await sendResetOtp()
  }

  const sendResetOtp = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error('Please enter your registered email address')
      return
    }

    setPending(true)
    try {
      await sendPasswordResetOtp({ email: resetEmail })
      setResetOtpSent(true)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))

    if (!/^\d{6}$/.test(String(data.otp || ''))) {
      toast.error('Please enter the 6 digit OTP from your email')
      return
    }

    if (!data.password || String(data.password).length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setPending(true)
    try {
      await resetPassword({ email: resetEmail, otp: data.otp, password: data.password })
      setAuthType('email')
      setMode('login')
      setResetEmail('')
      setResetOtpSent(false)
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
      setMode('login')
      setAuthType('email')
      setPhone('')
      setOtpSent(false)
      setOtpHint('')
      setResetEmail('')
      setResetOtpSent(false)
      setFormResetKey((key) => key + 1)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  const switchEmailMode = (nextMode) => {
    setMode(nextMode)
    setFormResetKey((key) => key + 1)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Account" title="Login / Register" copy="Manage orders, addresses and saved care lists." backTo="/" backLabel="Back to store" />
      <div className="grid overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_30px_100px_rgba(74,166,217,0.14)] lg:grid-cols-[0.98fr_1.02fr]">
        <div className="relative min-h-[560px] overflow-hidden bg-[linear-gradient(135deg,#F5FFF3,#F3FBFF)]">
          <img src={authImage} alt="BabyCure shampoo and skincare products with mother and baby" className="absolute inset-0 h-full w-full object-cover object-[59%_center]" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(23,50,77,0.34)),linear-gradient(90deg,rgba(255,255,255,0.72),rgba(255,255,255,0.08)_55%,rgba(255,255,255,0))]" />
          <div className="absolute left-6 top-6 rounded-full border border-white/70 bg-white/84 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-brand-green shadow-[0_18px_55px_rgba(124,197,118,0.18)] backdrop-blur">
            Gentle by nature
          </div>
          <div className="absolute bottom-8 left-6 right-6 rounded-[1.7rem] border border-white/65 bg-white/82 p-6 shadow-[0_24px_70px_rgba(74,166,217,0.18)] backdrop-blur">
            <h2 className="font-display text-4xl font-black leading-tight text-brand-ink">Welcome to BabyCure</h2>
            <p className="mt-3 max-w-md font-semibold leading-7 text-slate-600">Sign in for faster checkout, order tracking, wishlist care and fresh baby-care offers.</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs font-black text-brand-ink">
              {['Shampoo', 'Skincare', 'Baby Wipes'].map((item) => (
                <span key={item} className="rounded-full bg-gradient-to-r from-brand-leaf to-sky-50 px-3 py-2 text-brand-blue">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[linear-gradient(135deg,#FFFFFF,#F7FCFF_54%,#F6FFF4)] p-7 md:p-12">
          <div className="inline-flex rounded-3xl bg-white p-2 shadow-[0_18px_50px_rgba(74,166,217,0.10)]">
            <Logo />
          </div>

          {isAuthenticated ? (
            <div className="mt-8 rounded-[1.5rem] border border-green-100 bg-gradient-to-br from-green-50 via-white to-blue-50 p-6 shadow-[0_20px_65px_rgba(124,197,118,0.12)]">
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
              {requestedPath === '/checkout' && (
                <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-brand-blue">
                  Sign in once to continue directly to checkout. Your bag and delivery details are preserved.
                </div>
              )}
              <div className="mt-8 grid grid-cols-2 gap-2 rounded-full bg-white p-1.5 shadow-[inset_0_0_0_1px_rgba(74,166,217,0.12),0_16px_38px_rgba(74,166,217,0.08)]">
                {[
                  ['email', Mail, 'Email'],
                  ['phone', Phone, 'Phone OTP'],
                ].map(([item, Icon, label]) => (
                  <button
                    key={item}
                    type="button"
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition hover:text-brand-blue ${authType === item ? 'bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-[0_14px_35px_rgba(74,166,217,0.20)]' : 'text-slate-500'}`}
                    onClick={() => setAuthType(item)}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>

              <h2 className="mt-6 font-display text-3xl font-black text-slate-950">{title}</h2>

              {authType === 'email' ? (
                <form key={`email-${mode}-${formResetKey}`} className="mt-7" onSubmit={handleEmailSubmit} autoComplete="off">
                  <div className="mb-5 inline-flex rounded-full bg-white p-1.5 shadow-[inset_0_0_0_1px_rgba(74,166,217,0.12)]">
                    {['login', 'register'].map((item) => (
                      <button key={item} type="button" className={`rounded-full px-5 py-2 text-sm font-black capitalize transition hover:text-brand-blue ${mode === item ? 'bg-brand-leaf text-brand-green shadow-sm' : 'text-slate-500'}`} onClick={() => switchEmailMode(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                  {mode === 'register' && <Input label="Full Name" name="name" placeholder="Full Name" autoComplete="off" />}
                  <div className="mt-4">
                    <Input label="Email Address" name="email" type="email" placeholder="Email Address" autoComplete="off" />
                  </div>
                  {mode === 'register' && (
                    <div className="mt-4">
                      <Input label="Phone Number" name="phone" inputMode="numeric" maxLength="10" placeholder="9876543210" autoComplete="off" />
                    </div>
                  )}
                  <div className="mt-4">
                    <Input label="Password" name="password" type="password" placeholder="Password" autoComplete="new-password" />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm font-bold">
                    <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="accent-brand-blue" /> Remember me</label>
                    <button type="button" className="text-brand-blue transition hover:text-brand-green" onClick={() => { setAuthType('forgot'); setResetEmail(''); setResetOtpSent(false) }}>Forgot password?</button>
                  </div>
                  <Button type="submit" className="mt-7 w-full" disabled={pending}>
                    {pending ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
                  </Button>
                </form>
              ) : authType === 'forgot' ? (
                <form className="mt-7 rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_18px_55px_rgba(74,166,217,0.10)]" onSubmit={resetOtpSent ? handleResetPassword : handleSendPasswordOtp}>
                  <p className="mb-5 text-sm font-semibold leading-7 text-slate-600">
                    We will send a 6 digit OTP to your registered email. Use it to create a new secure password.
                  </p>
                  <Input
                    label="Registered Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value.trim().toLowerCase())}
                    disabled={resetOtpSent}
                    autoComplete="email"
                  />
                  {resetOtpSent && (
                    <div className="mt-4 space-y-4">
                      <Input label="Email OTP" name="otp" inputMode="numeric" maxLength="6" placeholder="123456" autoComplete="one-time-code" />
                      <Input label="New Password" name="password" type="password" placeholder="At least 8 characters" autoComplete="new-password" />
                      <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm new password" autoComplete="new-password" />
                    </div>
                  )}
                  <Button type="submit" variant="green" className="mt-7 w-full" disabled={pending}>
                    {pending ? 'Please wait...' : resetOtpSent ? 'Verify OTP & Reset Password' : 'Send Reset OTP'}
                  </Button>
                  {resetOtpSent && (
                    <button
                      type="button"
                      className="mt-4 w-full rounded-full border border-sky-100 bg-sky-50 px-5 py-3 text-sm font-black text-brand-blue transition hover:border-brand-blue hover:bg-white disabled:opacity-60"
                      onClick={sendResetOtp}
                      disabled={pending}
                    >
                      {pending ? 'Sending OTP...' : 'Resend OTP'}
                    </button>
                  )}
                  <button type="button" className="mt-4 text-sm font-black text-brand-blue transition hover:text-brand-green" onClick={() => { setAuthType('email'); setResetEmail(''); setResetOtpSent(false) }}>
                    Back to login
                  </button>
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
