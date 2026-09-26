import { ShieldCheck, Mail, ArrowLeft, ArrowRight, Check, Heart, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../api/services'
import Button from '../components/Button'
import Input from '../components/Input'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import loginArtwork from '../assets/babycure-login-family.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [retryAt, setRetryAt] = useState(0)
  const [now, setNow] = useState(Date.now)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading, verifyLoginOtp, user } = useAuth()
  const from = location.state?.from
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && from !== '/login' ? from : '/account'
  const seconds = Math.max(0, Math.ceil((retryAt - now) / 1000))

  useEffect(() => {
    if (isAuthenticated) navigate(user?.role === 'admin' ? '/admin' : destination, { replace: true })
  }, [isAuthenticated, user, destination, navigate])

  useEffect(() => {
    if (!retryAt) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [retryAt])

  const sendCode = async () => {
    setPending(true)
    setError('')
    try {
      const response = await authService.sendLoginOtp({ email: email.trim().toLowerCase() })
      setSent(true)
      setOtp('')
      setNow(Date.now())
      setRetryAt(Date.now() + (response.retryAfter || 60) * 1000)
      toast.success('Code sent. Please check your email.', { id: 'login-code' })
    } catch (failure) {
      setError(failure.message)
      if (failure.status === 429) setRetryAt(Date.now() + 60000)
    } finally { setPending(false) }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!sent) return sendCode()
    setPending(true)
    setError('')
    try { await verifyLoginOtp({ email: email.trim().toLowerCase(), otp }) }
    catch (failure) { setError(failure.message) }
    finally { setPending(false) }
  }

  return (
    <section className="relative mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <Link to="/account" className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 transition hover:text-brand-blue"><ArrowLeft className="h-4 w-4" />Back to account</Link>
      <div className="grid overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_20px_80px_-24px_rgba(23,50,77,0.22)] lg:min-h-[690px] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative isolate min-h-[260px] overflow-hidden bg-[#e9ece5] sm:min-h-[320px] lg:min-h-full">
          <img src={loginArtwork} alt="A mother cuddling her smiling baby in a softly lit nursery" width="1060" height="1484" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_56%] lg:object-center" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f5f3ed]/95 via-[#f5f3ed]/40 to-transparent lg:bg-[linear-gradient(180deg,rgba(247,246,240,.4),transparent_48%,rgba(30,53,43,.45))]" />
          <div className="relative p-6 sm:p-9 lg:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#48634c] backdrop-blur"><Heart className="h-3 w-3" />The BabyCure family</span>
            <h1 className="mt-5 max-w-[240px] font-display text-3xl font-bold leading-[1.12] tracking-tight text-brand-ink sm:text-4xl lg:max-w-none lg:text-[42px]">Little moments.<br /><span className="text-[#5d805e]">Lifelong love.</span></h1>
            <p className="mt-3 max-w-[190px] text-xs font-medium leading-6 text-slate-600 sm:max-w-[245px] sm:text-sm">A little everyday care, for the ones who mean everything.</p>
          </div>
          <div className="absolute inset-x-9 bottom-8 hidden rounded-2xl border border-white/30 bg-white/15 p-5 text-white backdrop-blur-md lg:block"><p className="text-lg font-semibold">Welcome to your care corner.</p><p className="mt-1 text-sm leading-6 text-white/90">Your favourites, your orders, and a simpler way to shop for your little one.</p></div>
        </aside>
        <div className="flex flex-col px-6 py-7 sm:px-10 sm:py-9 lg:px-12 lg:py-10">
          <div className="flex items-center justify-between gap-3"><Logo /><span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-green-700"><LockKeyhole className="h-3 w-3" />Secure login</span></div>
          <div className="mt-6 flex items-center gap-3 text-xs font-semibold" aria-label={sent ? 'Step 2 of 2: verify your email' : 'Step 1 of 2: enter your email'}>
            <span className="flex items-center gap-2 text-brand-blue"><span className="grid h-6 w-6 place-items-center rounded-full bg-sky-100">{sent ? <Check className="h-3.5 w-3.5" /> : '1'}</span>Email</span><span className="h-px w-9 bg-slate-200" /><span className={`flex items-center gap-2 ${sent ? 'text-brand-blue' : 'text-slate-400'}`}><span className={`grid h-6 w-6 place-items-center rounded-full ${sent ? 'bg-sky-100' : 'bg-slate-100'}`}>2</span>Verify</span>
          </div>
          <h2 className="mt-6 text-[28px] font-bold leading-tight tracking-tight text-brand-ink sm:text-[32px]">{sent ? 'One step to your care corner.' : 'Login to BabyCure'}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{sent ? <>Enter the 6-digit code sent to <strong className="break-all font-semibold text-brand-ink">{email.trim().toLowerCase()}</strong>.</> : 'Your favourite care, just an email away. We will send you a one-time verification code.'}</p>
          <form className="mt-6 space-y-5" onSubmit={submit} aria-busy={pending}>
            {sent ? <Input key="otp" label="Verification code" name="otp" value={otp} disabled={pending} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required autoFocus className="!rounded-xl !bg-white py-4 text-center text-3xl tracking-[.45em] placeholder:text-slate-200 focus:!ring-4 focus:!ring-sky-50" /> : <Input key="email" label="Email address" name="email" type="email" disabled={pending} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoFocus className="!rounded-xl !bg-white py-4 focus:!ring-4 focus:!ring-sky-50" />}
            {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}
            <Button type="submit" className="w-full !rounded-xl !py-4 !text-sm hover:!translate-y-0" disabled={pending || loading || (sent && otp.length !== 6) || (!sent && seconds > 0)}>{pending ? <><LoaderCircle className="h-4 w-4 animate-spin" />{sent ? 'Verifying...' : 'Sending code...'}</> : <>{sent ? 'Verify & login' : seconds > 0 ? `Try again in ${seconds}s` : 'Get verification code'}<ArrowRight className="h-4 w-4" /></>}</Button>
            {sent && <div className="flex flex-wrap justify-between gap-3 text-sm font-semibold"><button type="button" disabled={pending} className="rounded-md py-1 text-slate-500 hover:text-brand-blue disabled:opacity-50" onClick={() => { setSent(false); setOtp(''); setError('') }}><ArrowLeft className="mr-1 inline h-3.5 w-3.5" />Change email</button><button type="button" disabled={pending || seconds > 0} onClick={sendCode} className="rounded-md py-1 text-brand-blue disabled:text-slate-400">{seconds > 0 ? `Resend in ${seconds}s` : 'Resend code'}</button></div>}
          </form>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#f6f9fb] p-3.5 text-xs leading-5 text-slate-500">{sent ? <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#6a9d64]" />}<p>{sent ? 'Your code is valid for 5 minutes. Check spam or promotions if you do not see it. Only the latest code works.' : 'No password to remember. New here? We will create your account when you verify your email.'}</p></div>
          <p className="mt-5 text-center text-xs leading-5 text-slate-400">Read our <Link to="/terms-and-conditions" className="text-slate-600 underline underline-offset-2">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-slate-600 underline underline-offset-2">Privacy Policy</Link>.</p>
          <div className="mt-auto pt-6 text-center"><Link to="/category" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-blue transition hover:bg-sky-50">Continue shopping<ArrowRight className="h-3.5 w-3.5" /></Link><p className="mt-2 text-[10px] text-slate-400">On a shared device? Remember to log out when you finish.</p></div>
        </div>
      </div>
    </section>
  )
}
