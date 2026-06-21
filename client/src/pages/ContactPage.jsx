import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import Input from '../components/Input'
import PageHeader from '../components/PageHeader'

export default function ContactPage() {
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
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
    toast.success('Contact form submitted')
    event.currentTarget.reset()
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Support" title="Contact Us" copy="Brand-safe contact page with validation and helpful touchpoints." backTo="/" backLabel="Back to home" />
      <div className="grid gap-8 rounded-md border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-md bg-gradient-to-br from-blue-50 to-green-50 p-6">
          <h3 className="mb-3 font-display text-2xl font-black text-slate-950">Get in Touch</h3>
          <p className="mb-7 font-medium leading-7 text-slate-600">Reach out for product, order or care questions.</p>
          {[
            [Phone, '+91 98765 43210'],
            [Mail, 'support@babycure.com'],
            [MapPin, '123, Green Park, New Delhi - 110016, India'],
            [Clock, 'Mon - Sat: 9:00 AM - 7:00 PM'],
          ].map(([Icon, text]) => (
            <p key={text} className="mb-5 flex items-center gap-4 font-bold text-slate-700">
              <Icon className="h-5 w-5 text-brand-blue" /> {text}
            </p>
          ))}
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
          <Button type="submit" className="mt-5">Send Message</Button>
        </form>
      </div>
    </section>
  )
}
