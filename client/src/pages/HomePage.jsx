import { ArrowRight, ChevronRight, Droplets, Heart, Leaf, ShieldCheck, Truck } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'
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
    </main>
  )
}

function Hero() {
  const highlights = [
    [Leaf, 'Natural', 'Ingredients', 'text-[#67c788]'],
    [ShieldCheck, 'Safe &', 'Gentle', 'text-[#4aa6d9]'],
    [Heart, 'Trusted By', 'Parents', 'text-[#ef7fa7]'],
    [Droplets, 'Daily Care', 'Essentials', 'text-[#efb94f]'],
  ]

  return <section className="relative isolate bg-[#eaf8fb]" aria-label="Welcome to Baby Cure"><img src={heroProducts} alt="Baby Cure baby-care products" className="absolute inset-0 h-full w-full object-cover object-[69%_center]" loading="eager" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,252,252,.99)_0%,rgba(247,255,245,.97)_42%,rgba(255,255,255,.38)_65%,rgba(255,255,255,.04)_82%)]" /><div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-4 py-12 sm:min-h-[720px] lg:px-6"><div className="max-w-[610px]"><p className="inline-flex items-center gap-2 rounded-full border border-brand-green/50 bg-white/75 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-brand-green backdrop-blur"><Leaf className="h-3.5 w-3.5" /> Welcome to Baby Cure</p><h1 className="mt-6 font-display text-5xl font-extrabold leading-[.98] tracking-[-.05em] text-brand-ink sm:text-6xl lg:text-[72px]">Welcome to <span className="block text-brand-green">Baby Cure</span></h1><p className="mt-5 text-base font-extrabold text-brand-ink sm:text-lg">Gentle by nature, pure by care.</p><p className="mt-4 max-w-lg text-sm font-medium leading-7 text-slate-600 sm:text-base">At Baby Cure, we understand that your baby deserves the purest care. Our thoughtfully crafted products are made with natural ingredients to nurture, protect, and pamper your little one every day.</p><div className="mt-7 grid max-w-lg grid-cols-2 gap-3 border-y border-slate-200/80 py-5 sm:grid-cols-4">{highlights.map(([Icon, lineOne, lineTwo, iconColor]) => <div key={`${lineOne}-${lineTwo}`} className="text-center"><span className={`mx-auto grid h-9 w-9 place-items-center ${iconColor}`}><Icon className="h-7 w-7" /></span><p className="mt-1 text-[11px] font-extrabold leading-4 text-brand-ink"><span className="block">{lineOne}</span>{lineTwo}</p></div>)}</div><p className="mt-4 text-sm font-bold text-slate-600">Because every baby deserves the best.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/category" className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(74,166,217,.24)] transition hover:-translate-y-px hover:bg-brand-ink">Shop Now <ArrowRight className="h-4 w-4" /></Link><Link to="/category" className="inline-flex items-center gap-2 rounded-full border border-brand-green/50 bg-white/80 px-6 py-3.5 text-sm font-extrabold text-brand-green transition hover:border-brand-green hover:bg-white">Explore Collection</Link></div></div></div></section>
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

  return <section ref={productArea} className="scroll-mt-28 bg-[#f7fafb] py-14 sm:py-20"><div className="mx-auto max-w-7xl px-4 lg:px-6"><SectionTitle eyebrow="Most loved essentials" title="A little care, beautifully chosen" action="Shop the full collection" /><div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">{categoryButtons.map(([id, title]) => <button key={id} type="button" onClick={() => onSelect(id)} className={`min-w-0 rounded-xl px-3 py-2.5 text-sm font-extrabold transition ${activeCategory === id ? 'bg-brand-ink text-white shadow-[0_10px_24px_rgba(23,50,77,.16)]' : 'border border-sky-100 bg-white text-brand-ink hover:border-brand-blue hover:text-brand-blue'}`}>{title}</button>)}</div><div className="mt-7 grid min-w-0 gap-6 lg:grid-cols-[248px_minmax(0,1fr)]"><aside className="hidden self-start lg:sticky lg:top-[142px] lg:block"><div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_45px_rgba(74,166,217,.10)]"><div className="border-b border-sky-100 bg-brand-mist px-5 py-5"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-green">Browse BabyCure</p><h3 className="mt-1 text-lg font-extrabold text-brand-ink">Shop by category</h3></div><div className="p-3">{categoryButtons.map(([id, title]) => <button key={id} type="button" onClick={() => onSelect(id)} className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-extrabold transition ${activeCategory === id ? 'bg-brand-ink text-white shadow-[0_8px_18px_rgba(23,50,77,.14)]' : 'text-brand-ink hover:bg-brand-mist hover:text-brand-blue'}`}><span>{title}</span><ChevronRight className="h-4 w-4" /></button>)}</div><div className="border-t border-sky-100 px-5 py-4"><p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Truck className="h-4 w-4 text-brand-green" /> Free delivery {'\u20B9'}499+</p></div></div></aside><div className="min-w-0"><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{shown.map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="mt-9 text-center"><Link to="/category" className="inline-flex items-center gap-2 rounded-xl border border-brand-ink/20 bg-white px-5 py-3 text-sm font-extrabold text-brand-ink transition hover:border-brand-blue hover:text-brand-blue">Explore all care <ArrowRight className="h-4 w-4" /></Link></div></div></div></div></section>
}

function BrandStory() {
  return <section className="bg-white px-4 py-14 sm:py-20 lg:px-6"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-brand-ink lg:grid-cols-2"><img src={familyImage} alt="Mother with her baby" className="h-80 w-full object-cover sm:h-[430px] lg:order-2 lg:h-full" loading="lazy" /><div className="flex items-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16"><div className="max-w-lg"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#a9d9f2]">The BabyCure promise</p><h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">Premium care starts with understanding.</h2><p className="mt-5 text-base leading-7 text-slate-300">A complete collection designed around the small, important moments you share with your baby every day.</p><Link to="/about" className="mt-8 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-extrabold text-white transition hover:text-[#a9d9f2]">Discover BabyCure <ArrowRight className="h-4 w-4" /></Link></div></div></div></section>
}

function SectionTitle({ eyebrow, title, action }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-green">{eyebrow}</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">{title}</h2></div>{action && <Link to="/category" className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-brand-blue transition hover:text-brand-green">{action}<ArrowRight className="h-4 w-4" /></Link>}</div>
}
