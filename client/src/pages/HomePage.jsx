import { ArrowRight, Check, ChevronRight, Heart, Leaf, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BlogCard from '../components/BlogCard'
import ProductCard from '../components/ProductCard'
import { articles, categories, products } from '../data/products'
import heroProducts from '../assets/babycure-hero-products.png'
import familyImage from '../assets/hero.png'
import babycureCareVisual from '../assets/babycure-hero-ai.png'
import shampooVisual from '../assets/about-products-promise.png'
import lotionVisual from '../assets/heroo.png'
import bathVisual from '../assets/about-mother-baby-care.png'

const collections = [
  { title: 'Bath & Wash', copy: 'Gentle cleansing for daily bath time.', category: 'baby-care', image: shampooVisual, position: '42% 64%', size: 'cover' },
  { title: 'Baby Moisturizers', copy: 'Soft, nourishing daily skin care.', category: 'skin-care', image: lotionVisual, position: '72% 68%', size: 'cover' },
  { title: 'Diaper Care', copy: 'Comfort through every change.', category: 'diapering', image: babycureCareVisual, position: '96% 76%', size: '300%' },
  { title: 'Baby Wipes', copy: 'Soft clean-ups at home or away.', category: 'diapering', image: heroProducts, position: '82% 72%', size: '300%' },
  { title: 'Massage & Oil', copy: 'Made for tiny moments together.', category: 'baby-care', image: bathVisual, position: '20% 74%', size: '300%' },
]

const carePrinciples = [
  [ShieldCheck, 'Made for delicate skin', 'Comfort-first essentials for gentle everyday routines.'],
  [Leaf, 'Thoughtfully chosen', 'A focused collection without the shopping overwhelm.'],
  [Heart, 'Care that fits real life', 'Easy-to-find essentials for bath time, changes and cuddles.'],
]

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const productArea = useRef(null)
  const availableCategories = categories.filter((category) => category.id !== 'toys' && category.id !== 'gift-sets')
  const visibleProducts = useMemo(() => products.filter((product) => activeCategory === 'all' || product.category === activeCategory).slice(0, 6), [activeCategory])

  const selectCategory = (id) => {
    setActiveCategory(id)
    productArea.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="overflow-hidden bg-white text-brand-ink">
      <Hero />
      <TrustBar />
      <RoutineGallery onSelect={selectCategory} />
      <ProductDiscovery productArea={productArea} categories={availableCategories} activeCategory={activeCategory} onSelect={setActiveCategory} products={visibleProducts} />
      <BrandStory />
      <CarePrinciples />
      <CareJournal />
    </main>
  )
}

function Hero() {
  return <section className="relative isolate bg-[#eaf8fb]" aria-label="BabyCure premium baby care essentials"><img src={heroProducts} alt="BabyCure baby-care products" className="absolute inset-0 h-full w-full object-cover object-[69%_center]" loading="eager" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(234,248,251,.99)_0%,rgba(246,255,244,.94)_37%,rgba(255,255,255,.34)_62%,rgba(255,255,255,.03)_80%)]" /><div className="relative mx-auto flex min-h-[510px] max-w-7xl items-center px-4 py-14 sm:min-h-[600px] lg:min-h-[650px] lg:px-6"><div className="max-w-[575px]"><p className="inline-flex items-center gap-2 border-l-2 border-brand-green pl-3 text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green"><Sparkles className="h-3.5 w-3.5" /> BabyCure care collection</p><h1 className="mt-5 font-display text-[43px] font-extrabold leading-[.96] tracking-[-.055em] text-brand-ink sm:text-6xl lg:text-[70px]">Everyday care, made <span className="text-brand-blue">gentler.</span></h1><p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-600 sm:text-lg">Thoughtfully chosen essentials for bath, skin, diaper and everyday comfort.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/category" className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(23,50,77,.20)] transition hover:-translate-y-px hover:bg-brand-blue">Shop BabyCure <ArrowRight className="h-4 w-4" /></Link><Link to="/category?sort=-ratingsAverage" className="inline-flex items-center gap-2 rounded-xl border border-brand-ink/20 bg-white/85 px-6 py-3.5 text-sm font-extrabold text-brand-ink transition hover:bg-white">Best sellers</Link></div><div className="mt-9 inline-flex items-center gap-3 rounded-2xl border border-white/70 bg-white/65 px-3.5 py-2.5 text-sm font-bold text-slate-600 backdrop-blur"><span className="flex text-amber-400">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-3.5 w-3.5 fill-current" />)}</span><span>Gentle choices for every little routine</span></div></div></div></section>
}

function TrustBar() {
  const points = [[ShieldCheck, 'Gentle everyday care', 'For delicate little ones'], [Leaf, 'Thoughtfully selected', 'Comfort-first essentials'], [Truck, `Free delivery \u20B9499+`, 'Delivered with care'], [Heart, 'Care support', 'Here when you need us']]
  return <section className="border-b border-slate-100 bg-white"><div className="mx-auto grid max-w-7xl divide-y divide-slate-100 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-6">{points.map(([Icon, title, text]) => <div key={title} className="flex items-center gap-3 py-5 sm:px-5 lg:px-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-mist text-brand-blue"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-extrabold text-brand-ink">{title}</h3><p className="mt-0.5 text-xs font-medium text-slate-500">{text}</p></div></div>)}</div></section>
}

function RoutineGallery({ onSelect }) {
  return <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:px-6"><SectionTitle eyebrow="Shop by routine" title="Care for every little moment" action="View all products" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{collections.map((collection) => <button key={collection.title} type="button" onClick={() => onSelect(collection.category)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-[0_18px_42px_rgba(23,50,77,.14)]"><div role="img" aria-label={`${collection.title} BabyCure products`} className="relative aspect-[4/3] overflow-hidden bg-[#f5fafb] bg-no-repeat transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${collection.image})`, backgroundPosition: collection.position, backgroundSize: collection.size }}><span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.12em] text-brand-green">BabyCure</span></div><div className="p-4"><h3 className="text-base font-extrabold text-brand-ink">{collection.title}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{collection.copy}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-brand-blue">Shop routine <ChevronRight className="h-4 w-4" /></span></div></button>)}</div></section>
}

function ProductDiscovery({ productArea, categories: items, activeCategory, onSelect, products: shown }) {
  const categoryButtons = [['all', 'All essentials'], ...items.map((category) => [category.id, category.title])]

  return <section ref={productArea} className="scroll-mt-28 bg-[#f7fafb] py-14 sm:py-20"><div className="mx-auto max-w-7xl px-4 lg:px-6"><SectionTitle eyebrow="Most loved essentials" title="A little care, beautifully chosen" action="Shop the full collection" /><div className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:hidden">{categoryButtons.map(([id, title]) => <button key={id} type="button" onClick={() => onSelect(id)} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold transition ${activeCategory === id ? 'bg-brand-ink text-white shadow-[0_10px_24px_rgba(23,50,77,.16)]' : 'border border-sky-100 bg-white text-brand-ink hover:border-brand-blue hover:text-brand-blue'}`}>{title}</button>)}</div><div className="mt-7 grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]"><aside className="hidden self-start lg:sticky lg:top-[142px] lg:block"><div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_45px_rgba(74,166,217,.10)]"><div className="border-b border-sky-100 bg-brand-mist px-5 py-5"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-green">Browse BabyCure</p><h3 className="mt-1 text-lg font-extrabold text-brand-ink">Shop by category</h3></div><div className="p-3">{categoryButtons.map(([id, title]) => <button key={id} type="button" onClick={() => onSelect(id)} className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-extrabold transition ${activeCategory === id ? 'bg-brand-ink text-white shadow-[0_8px_18px_rgba(23,50,77,.14)]' : 'text-brand-ink hover:bg-brand-mist hover:text-brand-blue'}`}><span>{title}</span><ChevronRight className="h-4 w-4" /></button>)}</div><div className="border-t border-sky-100 px-5 py-4"><p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Truck className="h-4 w-4 text-brand-green" /> Free delivery {'\u20B9'}499+</p></div></div></aside><div><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{shown.map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="mt-9 text-center"><Link to="/category" className="inline-flex items-center gap-2 rounded-xl border border-brand-ink/20 bg-white px-5 py-3 text-sm font-extrabold text-brand-ink transition hover:border-brand-blue hover:text-brand-blue">Explore all care <ArrowRight className="h-4 w-4" /></Link></div></div></div></div></section>
}

function BrandStory() {
  return <section className="bg-white px-4 py-14 sm:py-20 lg:px-6"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-brand-ink lg:grid-cols-2"><img src={familyImage} alt="Mother with her baby" className="h-80 w-full object-cover sm:h-[430px] lg:order-2 lg:h-full" loading="lazy" /><div className="flex items-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16"><div className="max-w-lg"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#a9d9f2]">The BabyCure promise</p><h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">Premium care starts with understanding.</h2><p className="mt-5 text-base leading-7 text-slate-300">A complete collection designed around the small, important moments you share with your baby every day.</p><Link to="/about" className="mt-8 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-extrabold text-white transition hover:text-[#a9d9f2]">Discover BabyCure <ArrowRight className="h-4 w-4" /></Link></div></div></div></section>
}

function CarePrinciples() {
  return <section className="border-y border-sky-100 bg-[#f3fbff] py-14 sm:py-20"><div className="mx-auto max-w-7xl px-4 lg:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">Why BabyCure</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">Small details make care feel better.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3">{carePrinciples.map(([Icon, title, copy]) => <div key={title} className="rounded-2xl border border-white bg-white p-6 shadow-[0_16px_42px_rgba(74,166,217,.10)]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-mist text-brand-blue"><Icon className="h-6 w-6" /></span><h3 className="mt-5 text-lg font-extrabold text-brand-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-brand-green"><Check className="h-4 w-4" /> Everyday essentials</span></div>)}</div></div></section>
}

function CareJournal() {
  return <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:px-6"><SectionTitle eyebrow="The care journal" title="Helpful notes for growing families" action="Read all articles" /><div className="mt-8 grid gap-5 md:grid-cols-3">{articles.map((article) => <BlogCard key={article.id} article={article} />)}</div></section>
}

function SectionTitle({ eyebrow, title, action }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">{eyebrow}</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">{title}</h2></div>{action && <Link to="/category" className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-brand-blue transition hover:text-brand-green">{action}<ArrowRight className="h-4 w-4" /></Link>}</div>
}
