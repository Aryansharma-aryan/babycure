import { HeartHandshake, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import aboutHero from '../assets/about-mother-baby-care.png'
import PageHeader from '../components/PageHeader'

const values = [
  [Leaf, 'Gentle by Nature', 'Baby Cure products are created with a soft-care mindset for delicate baby routines.'],
  [ShieldCheck, 'Pure by Care', 'Every product page and pack guides parents with clear usage and ingredient information.'],
  [HeartHandshake, 'Parent Support', 'Our team helps with product guidance, orders, shipping and post-delivery support.'],
]

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="About Baby Cure" title="Gentle care for little routines" copy="Baby Cure is built for parents who want simple, safe-feeling and trustworthy baby care essentials." backTo="/" backLabel="Back to home" />

      <div className="grid overflow-hidden rounded-md border border-sky-100 bg-white shadow-sm lg:grid-cols-[1fr_0.95fr]">
        <div className="p-5 sm:p-8 lg:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-leaf px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-green">
            <Sparkles className="h-4 w-4" /> Baby Cure
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-brand-ink sm:text-5xl">
            Gentle by Nature, Pure by Care.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600">
            Baby Cure is a baby care brand offering gentle and safe products designed for babies and young children. Our range includes baby shampoo, body wash, diaper rash cream, lotion, massage oil, toothpaste and everyday baby essentials.
          </p>
          <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600">
            We focus on clean shopping, reliable delivery, helpful support and a care-first experience for parents. Product-specific claims, age recommendations, ingredients and expiry details are mentioned on the product packaging and product pages.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/category" className="rounded-md bg-brand-blue px-5 py-3 text-sm font-bold text-white">Shop Products</Link>
            <Link to="/contact" className="rounded-md border border-sky-100 bg-white px-5 py-3 text-sm font-bold text-brand-blue">Contact Support</Link>
          </div>
        </div>
        <div className="min-h-[340px] bg-brand-mist">
          <img src={aboutHero} alt="Mother caring for baby with Baby Cure baby-care products nearby" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {values.map(([Icon, title, copy]) => (
          <article key={title} className="rounded-md border border-sky-100 bg-white p-5 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-brand-mist text-brand-blue">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-brand-ink">{title}</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{copy}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-md border border-sky-100 bg-brand-mist p-5 sm:p-7">
        <h2 className="font-display text-2xl font-bold text-brand-ink">What we care about</h2>
        <div className="mt-5 grid gap-3 text-sm font-medium leading-7 text-slate-700 md:grid-cols-2">
          <p>Safe-feeling baby care routines with clear product information for parents.</p>
          <p>Helpful order, payment, shipping and tracking experience from website to doorstep.</p>
          <p>Responsive customer support through email, phone, WhatsApp and the website contact form.</p>
          <p>Products proudly made in India, with manufacturing and expiry details printed on packaging.</p>
        </div>
      </div>
    </section>
  )
}
