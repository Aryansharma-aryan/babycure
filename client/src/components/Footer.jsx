import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Logo from './Logo'

function SocialIcon({ label }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-current text-[10px] font-black uppercase">
      <span className="text-white">{label}</span>
    </span>
  )
}

export default function Footer() {
  const handleSubscribe = (event) => {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    if (!String(email).includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    toast.success('Newsletter subscribed')
    event.currentTarget.reset()
  }

  return (
    <footer className="mt-10 bg-brand-blue text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm font-semibold leading-7 text-blue-100">Premium gentle care for happy babies and confident parents.</p>
          <div className="mt-5 flex gap-3 text-white">{['f', 'ig', 'x', 'yt'].map((item) => <SocialIcon key={item} label={item} />)}</div>
        </div>
        <FooterLinks title="Shop" items={['Baby Care', 'Skin Care', 'Diapering', 'Feeding', 'Toys & Accessories', 'Gift Sets']} />
        <FooterLinks title="Help" items={['Track Order', 'Shipping Policy', 'Return & Refund', 'FAQs', 'Privacy Policy', 'Contact Us']} />
        <div>
          <h3 className="font-black">Subscribe to our newsletter</h3>
          <p className="mt-3 text-sm font-semibold leading-7 text-blue-100">Get product updates, care tips and exclusive offers.</p>
          <form className="mt-5 flex overflow-hidden rounded-md bg-white" onSubmit={handleSubscribe}>
            <input name="email" placeholder="Enter your email" className="min-w-0 flex-1 px-4 text-sm font-semibold text-slate-900 outline-none" />
            <button className="bg-brand-green px-5 py-3 font-black" type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/15 px-4 py-5 text-sm font-semibold text-blue-100">
        <span>2026 Babycure. All rights reserved.</span>
        <span className="font-black text-white">VISA  Mastercard  Paytm  UPI</span>
      </div>
    </footer>
  )
}

function FooterLinks({ title, items }) {
  return (
    <div>
      <h3 className="font-black">{title}</h3>
      {items.map((item) => (
        <Link key={item} className="mt-2 block text-sm font-semibold text-blue-100" to={item === 'Contact Us' ? '/contact' : '/category'}>
          {item}
        </Link>
      ))}
    </div>
  )
}
