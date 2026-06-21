import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import Input from '../components/Input'
import Logo from '../components/Logo'
import PageHeader from '../components/PageHeader'
import { images } from '../data/products'

export default function LoginPage() {
  const [mode, setMode] = useState('login')

  const handleSubmit = (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (!data.email || !String(data.email).includes('@') || !data.password) {
      toast.error('Please enter valid account details')
      return
    }
    toast.success(mode === 'login' ? 'Logged in successfully' : 'Account created')
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
        <form className="p-8 md:p-12" onSubmit={handleSubmit}>
          <Logo />
          <div className="mt-8 inline-flex rounded-md bg-slate-100 p-1">
            {['login', 'register'].map((item) => (
              <button key={item} type="button" className={`rounded-md px-5 py-2 text-sm font-black capitalize ${mode === item ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500'}`} onClick={() => setMode(item)}>
                {item}
              </button>
            ))}
          </div>
          <h2 className="mt-6 font-display text-3xl font-black text-slate-950">{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2>
          {mode === 'register' && <Input className="mt-7" label="Full Name" name="name" placeholder="Full Name" />}
          <div className={mode === 'login' ? 'mt-7' : 'mt-4'}>
            <Input label="Email Address" name="email" placeholder="Email Address" />
          </div>
          <div className="mt-4">
            <Input label="Password" name="password" type="password" placeholder="Password" />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-bold">
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="accent-brand-blue" /> Remember me</label>
            <button type="button" className="text-brand-blue">Forgot password?</button>
          </div>
          <Button type="submit" className="mt-7 w-full">{mode === 'login' ? 'Login' : 'Create Account'}</Button>
        </form>
      </div>
    </section>
  )
}
