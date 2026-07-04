import { Camera, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const contactDetails = {
  email: 'info@babycureindia.com',
  phone: '8607201606',
  address: '1277, Sector 5, Kurukshetra, Haryana 136118',
  instagram: 'https://www.instagram.com/babycureindia?igsh=MWJucmR1eWNuajh3cw%3D%3D&utm_source=qr',
  facebook: 'https://www.facebook.com/profile.php?id=61570768618034',
  pinterest: 'https://in.pinterest.com/Babycureindia/',
  linkedin: 'https://www.linkedin.com/in/baby-cure-54b393416/?isSelfProfile=true',
}

const whatsappLink = `https://wa.me/91${contactDetails.phone}?text=${encodeURIComponent('Hi BabyCure, I need help with baby care products.')}`
const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactDetails.address)}`

function SocialIcon({ icon: Icon, label, href }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-blue transition hover:-translate-y-1 hover:bg-brand-leaf hover:text-brand-green">
      <Icon className="h-4 w-4" />
    </a>
  )
}

function BrandSocialIcon({ label, href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-blue transition hover:-translate-y-1 hover:bg-brand-leaf hover:text-brand-green">
      <span className="text-[15px] font-black leading-none">{children}</span>
    </a>
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
          <div className="mt-5 flex gap-3 text-white">
            <SocialIcon icon={MessageCircle} label="WhatsApp" href={whatsappLink} />
            <SocialIcon icon={Camera} label="Instagram" href={contactDetails.instagram} />
            <SocialIcon icon={Mail} label="Email" href={`mailto:${contactDetails.email}`} />
            <SocialIcon icon={MapPin} label="Map" href={mapLink} />
          </div>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-blue-100">
            <FooterContact icon={Phone} href={`tel:+91${contactDetails.phone}`} text={`+91 ${contactDetails.phone}`} />
            <FooterContact icon={Mail} href={`mailto:${contactDetails.email}`} text={contactDetails.email} />
            <FooterContact icon={MapPin} href={mapLink} text={contactDetails.address} external />
          </div>
        </div>
        <FooterLinks title="Shop" items={[
          ['Baby Care', '/category?search=Baby%20Care'],
          ['Skin Care', '/category?search=Skin%20Care'],
          ['Diapering', '/category?search=Diapering'],
          ['Feeding', '/category?search=Feeding'],
          ['Toys & Accessories', '/category?search=Toys'],
          ['Gift Sets', '/category?search=Gift%20Sets'],
        ]} />
        <FooterLinks title="Help" items={[
          ['Track Order', '/orders'],
          ['Shipping Policy', '/shipping-policy'],
          ['Return & Refund', '/return-refund-policy'],
          ['FAQs', '/faqs'],
          ['Privacy Policy', '/privacy-policy'],
          ['About Baby Cure', '/about'],
          ['Contact Us', '/contact'],
        ]} />
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
        <div className="flex flex-wrap items-center gap-4 sm:ml-auto">
          <div className="flex items-center gap-2" aria-label="Babycure social links">
            <BrandSocialIcon label="Facebook" href={contactDetails.facebook}>f</BrandSocialIcon>
            <BrandSocialIcon label="Pinterest" href={contactDetails.pinterest}>P</BrandSocialIcon>
            <BrandSocialIcon label="LinkedIn" href={contactDetails.linkedin}>in</BrandSocialIcon>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ title, items }) {
  return (
    <div>
      <h3 className="font-black">{title}</h3>
      {items.map(([item, to]) => (
        <Link key={item} className="mt-2 block text-sm font-semibold text-blue-100 transition hover:text-white" to={to}>
          {item}
        </Link>
      ))}
    </div>
  )
}

function FooterContact({ icon: Icon, href, text, external = false }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="flex items-start gap-3 transition hover:text-white">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white" />
      <span className="break-words">{text}</span>
    </a>
  )
}
