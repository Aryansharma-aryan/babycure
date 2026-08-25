import { ArrowRight, Baby, Check, CircleHelp, CreditCard, Droplets, Headphones, Heart, Info, Mail, MapPin, PackageCheck, RotateCcw, Search, ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import careImage from '../assets/care2.png'
import familyImage from '../assets/care1.png'

const reasons = [
  [Baby, 'Made around real routines', 'The collection is organized around bath time, skin care, diaper changes and the everyday moments parents already know.'],
  [Info, 'Information you can use', 'Product pages bring key details, benefits and usage guidance together so you can compare options more clearly.'],
  [ShoppingBag, 'A focused collection', 'Baby Cure keeps everyday essentials in one place, helping parents browse by need instead of facing an overwhelming catalogue.'],
  [Headphones, 'Support from real people', 'Questions about products or orders can be taken directly to Baby Cure through phone, email, WhatsApp or the contact page.'],
]

const routines = [
  [Droplets, 'Bath & wash', 'Gentle cleansing essentials for a simple bath-time routine.', '/category?search=wash'],
  [Heart, 'Skin comfort', 'Daily moisturising and care options for delicate baby skin.', '/category?search=lotion'],
  [ShieldCheck, 'Diaper care', 'Practical essentials for changes, clean-ups and comfort.', '/category?search=diaper'],
]

const commitments = [
  'Keep product information clear and easy to find.',
  'Make order tracking and customer support accessible.',
  'Focus on practical baby-care needs and everyday usability.',
  'Encourage parents to check labels and choose for their baby’s individual needs.',
]

const facts = [
  [MapPin, 'Made in India', 'A baby-care brand serving families across India.'],
  [Truck, 'Delivery across India', 'Shipping is available across most serviceable locations.'],
  [PackageCheck, 'Trackable orders', 'Follow your order after dispatch from your account.'],
  [Headphones, 'Direct support', 'Reach the Baby Cure team by phone, email or WhatsApp.'],
]

const journey = [
  [Search, 'Discover', 'Browse by routine, category, concern or product search.'],
  [Info, 'Understand', 'Review descriptions, prices, availability and product-specific details.'],
  [CreditCard, 'Order', 'Add products to your bag and use the payment options shown at checkout.'],
  [Truck, 'Track & get help', 'View order progress and contact support if something needs attention.'],
]

const faqs = [
  ['What is Baby Cure?', 'Baby Cure is an India-based baby-care brand offering everyday essentials across bath, skin, diapering, feeding, health and other family-care routines.'],
  ['How do I choose a product for my baby?', 'Start with the routine or concern, then read the product description and packaging carefully. Check age guidance and product-specific information before use.'],
  ['Are all products suitable for newborns?', 'Not necessarily. Suitability can vary by product, so parents should follow the age recommendation and directions shown on the product packaging.'],
  ['Can Baby Cure help with a medical skin concern?', 'The team can help with product and order information, but it cannot diagnose or treat a medical condition. Please consult a paediatrician or dermatologist for persistent irritation, allergies or other concerns.'],
  ['How does delivery and tracking work?', 'Orders are generally processed within 1–2 business days. Once dispatched, tracking details are shared where applicable, and signed-in customers can follow eligible orders from the Orders area.'],
  ['What if an order arrives damaged or incorrect?', 'Contact Baby Cure within 48 hours of delivery with the order number and clear photographs. Eligible damaged, defective, expired, missing or incorrect-item cases are reviewed under the Return & Refund Policy.'],
]

export default function WhyBabyCurePage() {
  return (
    <main className="overflow-hidden bg-[#fbfdfc] text-brand-ink">
      <Hero />
      <FactStrip />
      <Reasons />
      <RoutineSection />
      <CareJourney />
      <HonestPromise />
      <SupportAndPolicies />
      <FrequentlyAsked />
      <CallToAction />
    </main>
  )
}

function FactStrip() {
  return <section className="border-y border-sky-100 bg-white"><div className="mx-auto grid max-w-7xl divide-y divide-sky-100 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-6">{facts.map(([Icon, title, copy]) => <div key={title} className="flex items-start gap-3 py-5 sm:px-5 lg:px-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-mist text-brand-blue"><Icon className="h-[18px] w-[18px]" /></span><div><h2 className="text-sm font-extrabold">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p></div></div>)}</div></section>
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="overflow-hidden rounded-3xl border border-sky-100 bg-[#f2fafc] shadow-[0_20px_60px_rgba(23,50,77,.10)] lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="flex items-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-green"><Sparkles className="h-4 w-4" /> Why Baby Cure</p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-brand-ink sm:text-5xl">Simple, thoughtful care for everyday baby routines.</h1>
            <p className="mt-5 text-base font-medium leading-7 text-slate-600 sm:text-lg">Baby Cure brings useful baby-care essentials into one easy place. Parents can browse by routine, understand each product, order online and contact the team whenever help is needed.</p>
            <div className="mt-7 space-y-3">
              <p className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100 text-brand-green"><Check className="h-3.5 w-3.5" /></span>Products arranged around bath, skin and diaper-care needs.</p>
              <p className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100 text-brand-green"><Check className="h-3.5 w-3.5" /></span>Clear product details to help parents compare their options.</p>
              <p className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100 text-brand-green"><Check className="h-3.5 w-3.5" /></span>Accessible order tracking and direct customer support.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/category" className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-blue">View products <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-extrabold text-brand-ink transition hover:border-brand-blue hover:text-brand-blue">Contact us</Link>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 lg:p-8">
          <img src={careImage} alt="Baby Cure everyday baby-care collection" className="h-full min-h-80 w-full rounded-2xl object-cover object-center sm:min-h-96" loading="eager" />
        </div>
      </div>
    </section>
  )
}

function Reasons() {
  return (
    <section className="bg-white px-4 py-16 sm:py-24 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">The Baby Cure difference</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">Thoughtful in the places that matter.</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">Our value is simple: make it easier to discover, understand and order care for the routines families repeat every day.</p></div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{reasons.map(([Icon, title, copy], index) => <article key={title} className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_20px_50px_rgba(23,50,77,.10)]"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-mist text-brand-blue"><Icon className="h-6 w-6" /></span><span className="font-display text-sm font-extrabold text-slate-300">0{index + 1}</span></div><h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></article>)}</div>
      </div>
    </section>
  )
}

function RoutineSection() {
  return (
    <section className="border-y border-sky-100 bg-[#f4fbfe] px-4 py-16 sm:py-20 lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div className="relative min-h-[390px] overflow-hidden rounded-[2rem]"><img src={familyImage} alt="Parent caring for a baby during an everyday routine" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /><div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/90 p-5 shadow-xl backdrop-blur"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-brand-green">Care in real life</p><p className="mt-1 font-display text-xl font-extrabold">Built for the small routines repeated every day.</p></div></div>
        <div><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">Start with the moment</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">Find care by what your day needs.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Baby Cure makes it easier to move from a familiar routine to relevant products, without asking parents to decode a complicated catalogue.</p><div className="mt-7 space-y-3">{routines.map(([Icon, title, copy, to]) => <Link key={title} to={to} className="group flex items-center gap-4 rounded-2xl border border-white bg-white p-4 shadow-[0_10px_30px_rgba(74,166,217,.08)] transition hover:-translate-y-0.5 hover:border-brand-blue/40"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-mist text-brand-blue"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-extrabold">{title}</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500">{copy}</span></span><ArrowRight className="h-4 w-4 text-brand-blue transition group-hover:translate-x-1" /></Link>)}</div></div>
      </div>
    </section>
  )
}

function HonestPromise() {
  return (
    <section className="px-4 py-16 sm:py-20 lg:px-6">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-brand-ink lg:grid-cols-2">
        <div className="px-7 py-12 sm:px-12 sm:py-16"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#a9d9f2]">An honest promise</p><h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-.04em] text-white sm:text-4xl">Helpful care begins with clear expectations.</h2><p className="mt-4 text-sm leading-7 text-slate-300">Every baby is different. Baby Cure helps parents explore products and understand the available information; it does not replace advice from a paediatrician or dermatologist when a baby has a medical concern.</p></div>
        <div className="bg-white p-7 sm:p-12"><h3 className="font-display text-2xl font-extrabold">What we commit to</h3><div className="mt-6 space-y-4">{commitments.map((item) => <p key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-600"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-leaf text-brand-green"><Check className="h-3.5 w-3.5" /></span>{item}</p>)}</div><Link to="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue">Ask us a question <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </section>
  )
}

function CareJourney() {
  return (
    <section className="px-4 py-16 sm:py-20 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">From first click to after delivery</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">A complete care-shopping experience.</h2><p className="mt-4 text-base leading-7 text-slate-600">Baby Cure connects product discovery, ordering, tracking and support so parents always know the next step.</p></div>
        <div className="relative mt-12 grid gap-4 md:grid-cols-4"><div className="absolute left-[12%] right-[12%] top-7 hidden border-t-2 border-dashed border-sky-200 md:block" />{journey.map(([Icon, title, copy], index) => <article key={title} className="relative rounded-2xl border border-sky-100 bg-white p-6 text-center shadow-[0_14px_38px_rgba(74,166,217,.08)]"><span className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-brand-blue text-white shadow-lg"><Icon className="h-6 w-6" /></span><span className="mt-4 inline-block text-[10px] font-extrabold uppercase tracking-[.18em] text-brand-green">Step {index + 1}</span><h3 className="mt-1 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></article>)}</div>
      </div>
    </section>
  )
}

function SupportAndPolicies() {
  const policyLinks = [
    [Truck, 'Shipping policy', 'Processing, delivery estimates and tracking details.', '/shipping-policy'],
    [RotateCcw, 'Returns & refunds', 'Eligibility and the process for reporting order issues.', '/return-refund-policy'],
    [CircleHelp, 'Help centre', 'Answers about products, payments, delivery and orders.', '/faqs'],
  ]

  return (
    <section className="border-y border-sky-100 bg-[#f4fbfe] px-4 py-16 sm:py-20 lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">Support that stays visible</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">Questions should have a clear place to go.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Baby Cure provides direct support for product questions, checkout help, tracking and eligible post-delivery concerns.</p><div className="mt-7 rounded-2xl bg-brand-ink p-6 text-white shadow-xl"><p className="text-sm font-extrabold">Baby Cure Customer Care</p><div className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2"><a href="tel:+918607201606" className="flex items-center gap-2 transition hover:text-white"><Headphones className="h-4 w-4 text-[#a9d9f2]" /> +91 86072 01606</a><a href="mailto:info@babycureindia.com" className="flex items-center gap-2 transition hover:text-white"><Mail className="h-4 w-4 text-[#a9d9f2]" /> info@babycureindia.com</a></div><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-300"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a9d9f2]" /> 1277, Sector 5, Kurukshetra, Haryana 136118, India</p><Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-white">Open contact page <ArrowRight className="h-4 w-4" /></Link></div></div>
        <div className="space-y-3">{policyLinks.map(([Icon, title, copy, to]) => <Link key={title} to={to} className="group flex items-center gap-4 rounded-2xl border border-white bg-white p-5 shadow-[0_12px_32px_rgba(74,166,217,.08)] transition hover:-translate-y-0.5 hover:border-brand-blue/40"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-mist text-brand-blue"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><strong className="block text-base font-extrabold">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{copy}</span></span><ArrowRight className="h-4 w-4 text-brand-blue transition group-hover:translate-x-1" /></Link>)}</div>
      </div>
    </section>
  )
}

function FrequentlyAsked() {
  return (
    <section className="px-4 py-16 sm:py-20 lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]">
        <div className="lg:sticky lg:top-40 lg:self-start"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">Good to know</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">Straight answers for parents.</h2><p className="mt-4 text-base leading-7 text-slate-600">The most important details about Baby Cure, choosing products and getting help.</p><Link to="/faqs" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue">View every FAQ <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="space-y-3">{faqs.map(([question, answer], index) => <details key={question} open={index === 0} className="group rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_10px_28px_rgba(74,166,217,.07)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-extrabold marker:hidden"><span>{question}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-mist text-xl text-brand-blue transition group-open:rotate-45">+</span></summary><p className="mt-4 border-t border-sky-100 pt-4 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div>
      </div>
    </section>
  )
}

function CallToAction() {
  return <section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:pb-20"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-mist text-brand-blue"><PackageCheck className="h-7 w-7" /></span><h2 className="mt-5 font-display text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">Choose with confidence, one routine at a time.</h2><p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">Browse Baby Cure’s collection or speak with the support team if you need help finding the right place to start.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/category" className="rounded-xl bg-brand-blue px-6 py-3.5 text-sm font-extrabold text-white">Shop all products</Link><Link to="/about" className="rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-extrabold">Read our story</Link></div></section>
}
