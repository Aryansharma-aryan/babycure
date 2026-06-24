import { Camera, Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { contactService } from '../api/services'
import Button from '../components/Button'
import Input from '../components/Input'
import PageHeader from '../components/PageHeader'

const contactDetails = {
  email: 'info@babycureindia.com',
  phone: '8607201606',
  address: '1277, Sector 5, Kurukshetra, Haryana 136118',
  instagram: 'https://www.instagram.com/babycureindia?igsh=MWJucmR1eWNuajh3cw%3D%3D&utm_source=qr',
}

const whatsappLink = `https://wa.me/91${contactDetails.phone}?text=${encodeURIComponent('Hi BabyCure, I need help with baby care products.')}`
const mapQuery = encodeURIComponent(contactDetails.address)

export default function ContactPage() {
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const nextErrors = {}
    ;['name', 'email', 'phone', 'message'].forEach((field) => {
      if (!data[field]?.trim()) nextErrors[field] = 'Required'
    })
    if (data.email && !String(data.email).includes('@')) nextErrors.email = 'Enter valid email'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      toast.error('Please complete the contact form')
      return
    }

    setErrors({})
    setPending(true)
    try {
      await contactService.create(data)
      toast.success('Message sent. Our team will contact you soon.')
      form.reset()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
      <PageHeader eyebrow="Support" title="Contact Us" copy="Reach BabyCure for orders, product guidance and gentle baby-care support." backTo="/" backLabel="Back to home" />
      <div className="grid gap-6 rounded-md border border-slate-200 bg-white p-4 shadow-soft sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-md bg-gradient-to-br from-blue-50 to-green-50 p-5 sm:p-6">
          <h3 className="mb-3 font-display text-2xl font-black text-slate-950">Get in Touch</h3>
          <p className="mb-7 font-medium leading-7 text-slate-600">Reach out for product, order or care questions.</p>
          <div className="grid gap-4">
            <ContactLink icon={Phone} href={`tel:+91${contactDetails.phone}`} label={`+91 ${contactDetails.phone}`} />
            <ContactLink icon={MessageCircle} href={whatsappLink} label="Chat on WhatsApp" external />
            <ContactLink icon={Mail} href={`mailto:${contactDetails.email}`} label={contactDetails.email} />
            <ContactLink icon={Camera} href={contactDetails.instagram} label="Instagram" external />
            <p className="flex items-start gap-4 font-bold text-slate-700">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-blue" /> {contactDetails.address}
            </p>
            <p className="flex items-center gap-4 font-bold text-slate-700">
              <Clock className="h-5 w-5 text-brand-blue" /> Mon - Sat: 9:00 AM - 7:00 PM
            </p>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm">
            <iframe
              title="BabyCure location map"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <h3 className="mb-5 font-display text-2xl font-black text-slate-950">Send us a message</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Your Name" name="name" placeholder="Your Name" error={errors.name} />
            <Input label="Email Address" name="email" placeholder="Email Address" error={errors.email} />
          </div>
          <div className="mt-4">
            <Input label="Phone Number" name="phone" placeholder="Phone Number" error={errors.phone} />
          </div>
          <div className="mt-4">
            <Input as="textarea" rows="7" label="Message" name="message" placeholder="Your Message" error={errors.message} />
          </div>
          <Button type="submit" className="mt-5" disabled={pending}>{pending ? 'Sending...' : 'Send Message'}</Button>
        </form>
      </div>
    </section>
  )
}

function ContactLink({ icon: Icon, href, label, external = false }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="flex items-center gap-4 font-bold text-slate-700 transition hover:text-brand-blue">
      <Icon className="h-5 w-5 shrink-0 text-brand-blue" />
      <span className="break-all">{label}</span>
      {external && <ExternalLink className="ml-auto h-4 w-4 text-slate-400" />}
    </a>
  )
}
