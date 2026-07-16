import { ArrowRight, Baby, Droplets, FlaskConical, Heart, Leaf, ShieldCheck, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import aboutHero from '../assets/about-babycure-family-v2.png'
import aboutProducts from '../assets/about-products-promise.png'

const values = [
  [Leaf, 'Gentle by design', 'Care essentials chosen with delicate skin and everyday comfort in mind.'],
  [ShieldCheck, 'Made for real routines', 'Simple, dependable products for the moments parents repeat every day.'],
  [Droplets, 'Softness in the details', 'From bath time to changes, comfort comes first in every choice.'],
]

const careMarkers = [
  [Baby, 'Baby-care focused', 'Essentials for little routines'],
  [FlaskConical, 'Thoughtfully selected', 'A calm, focused collection'],
  [Sprout, 'Inspired by gentle care', 'Softness for every day'],
  [Heart, 'Here for parents', 'Support when you need it'],
]

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-white text-brand-ink">
      <Hero />
      <OurStory />
      <Values />
      <Promise />
      <CareMarkers />
    </main>
  )
}

function Hero() {
  return <section className="mx-auto max-w-7xl px-4 py-5 sm:py-7 lg:px-6"><div className="relative isolate min-h-[590px] overflow-hidden rounded-[2rem] bg-[#edf9f7] sm:min-h-[620px]"><img src={aboutHero} alt="Mother holding her baby in a calm nursery" className="absolute inset-0 h-full w-full object-cover object-[64%_center]" loading="eager" /><div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/78 to-white/10 sm:bg-[linear-gradient(90deg,rgba(255,255,255,.98)_0%,rgba(255,255,255,.92)_35%,rgba(255,255,255,.26)_61%,rgba(255,255,255,.02)_82%)]" /><div className="relative z-10 flex min-h-[590px] items-start px-6 py-12 sm:min-h-[620px] sm:items-center sm:px-12 lg:px-16"><div className="max-w-[520px]"><p className="inline-flex items-center gap-2 border-l-2 border-brand-green pl-3 text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green"><Heart className="h-3.5 w-3.5" /> About BabyCure</p><h1 className="mt-5 font-display text-4xl font-extrabold leading-[.98] tracking-[-.05em] text-brand-ink sm:text-6xl">Care that feels as gentle as your <span className="text-brand-blue">love.</span></h1><p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-600 sm:text-lg">BabyCure brings together gentle everyday essentials for the small routines that matter most.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/category" className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(23,50,77,.20)] transition hover:-translate-y-px hover:bg-brand-blue">Explore our care <ArrowRight className="h-4 w-4" /></Link><Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-brand-ink/15 bg-white/85 px-5 py-3.5 text-sm font-extrabold text-brand-ink transition hover:bg-white">Talk to support</Link></div><p className="mt-7 flex items-center gap-2 text-sm font-bold text-slate-600"><ShieldCheck className="h-4 w-4 text-brand-green" /> Thoughtful care for everyday moments.</p></div></div></div></section>
}

function OurStory() {
  return <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:py-20 lg:grid-cols-[.78fr_1.22fr] lg:items-center"><div className="rounded-2xl bg-brand-mist p-7 sm:p-9"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">Our point of view</p><p className="mt-5 font-display text-2xl font-extrabold leading-snug tracking-[-.03em] text-brand-ink sm:text-3xl">Parenthood is full of small rituals. Care should make those moments feel simpler.</p></div><div><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">Our story</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] text-brand-ink sm:text-4xl">Built around the care you give every day.</h2><div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-600 sm:text-base"><p>BabyCure is a gentle baby-care brand for parents looking for soft, easy-to-understand essentials for bath time, skin care, diaper changes and everyday comfort.</p><p>We keep the experience focused: thoughtful products, calming guidance, and care that fits naturally into family life.</p></div></div></section>
}

function Values() {
  return <section className="border-y border-sky-100 bg-[#f5fbff] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 lg:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">What guides us</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] text-brand-ink sm:text-4xl">The little details matter.</h2><p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">A calmer, more considered way to find baby-care essentials.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{values.map(([Icon, title, copy]) => <article key={title} className="rounded-2xl border border-white bg-white p-6 shadow-[0_16px_42px_rgba(74,166,217,.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(74,166,217,.16)]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-mist text-brand-blue"><Icon className="h-6 w-6" /></span><h3 className="mt-5 text-lg font-extrabold text-brand-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></article>)}</div></div></section>
}

function Promise() {
  return <section className="bg-white px-4 py-16 sm:py-20 lg:px-6"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-brand-ink lg:grid-cols-2"><div className="relative min-h-[320px] lg:order-2 lg:min-h-full"><img src={aboutProducts} alt="Baby-care essentials arranged with soft towels" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-brand-ink/25 to-transparent" /></div><div className="flex items-center px-7 py-14 sm:px-12 sm:py-20"><div className="max-w-lg"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#a9d9f2]">Our promise</p><h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-.04em] text-white sm:text-5xl">Thoughtful care for the moments you&apos;ll remember.</h2><p className="mt-5 text-base leading-7 text-slate-300">We want every part of choosing baby care to feel reassuring, simple and full of comfort.</p><Link to="/about" className="mt-8 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-extrabold text-white transition hover:text-[#a9d9f2]">Discover BabyCure <ArrowRight className="h-4 w-4" /></Link></div></div></div></section>
}

function CareMarkers() {
  return <section className="border-t border-slate-100 bg-white"><div className="mx-auto grid max-w-7xl divide-y divide-slate-100 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-6">{careMarkers.map(([Icon, title, copy]) => <div key={title} className="flex items-center gap-3 py-6 sm:px-5 lg:px-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-mist text-brand-blue"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-extrabold text-brand-ink">{title}</h3><p className="mt-0.5 text-xs font-medium text-slate-500">{copy}</p></div></div>)}</div></section>
}
