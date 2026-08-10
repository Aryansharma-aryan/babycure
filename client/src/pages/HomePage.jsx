import { ArrowRight, Baby, ChevronRight, Droplets, Globe2, Heart, Leaf, ShieldCheck, Truck } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Logo from '../components/Logo'
import { categories, products } from '../data/products'
import heroProducts from '../assets/babycure-hero-products.png'
import familyImage from '../assets/hero.png'
import newHeroImage from '../assets/newPhoto.jfif'

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const productArea = useRef(null)
  const availableCategories = categories.filter((category) => category.id !== 'toys' && category.id !== 'gift-sets')
  const visibleProducts = useMemo(() => products.filter((product) => activeCategory === 'all' || product.category === activeCategory).slice(0, 6), [activeCategory])

  return (
    <main className="overflow-hidden bg-white text-brand-ink">
      <HeroWithPastedProducts />
      <TrustBar />
      <OurStory />
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

  return <section className="relative isolate overflow-hidden bg-[#eaf8fb]" aria-label="Welcome to Baby Cure"><img src={familyImage} alt="Baby Cure products with a mother and baby" className="absolute inset-0 h-full w-full object-cover object-[69%_center]" loading="eager" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,252,252,.88)_0%,rgba(247,255,245,.78)_38%,rgba(255,255,255,.22)_62%,rgba(255,255,255,.02)_82%)]" /><div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-4 py-12 sm:min-h-[720px] lg:px-6"><div className="max-w-[610px]"><p className="inline-flex items-center gap-2 rounded-full border border-brand-green/50 bg-white/75 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-brand-green backdrop-blur"><Leaf className="h-3.5 w-3.5" /> Welcome to Baby Cure</p><h1 className="mt-6 font-display text-5xl font-extrabold leading-[.98] tracking-[-.05em] text-brand-ink sm:text-6xl lg:text-[72px]">Welcome to <span className="block text-brand-green">Baby Cure</span></h1><p className="mt-5 text-base font-extrabold text-brand-ink sm:text-lg">Gentle by nature, pure by care.</p><p className="mt-4 max-w-lg text-sm font-medium leading-7 text-slate-600 sm:text-base">At Baby Cure, we understand that your baby deserves the purest care. Our thoughtfully crafted products are made with natural ingredients to nurture, protect, and pamper your little one every day.</p><div className="mt-7 grid max-w-lg grid-cols-2 gap-3 border-y border-slate-200/80 py-5 sm:grid-cols-4">{highlights.map(([Icon, lineOne, lineTwo, iconColor]) => <div key={`${lineOne}-${lineTwo}`} className="text-center"><span className={`mx-auto grid h-9 w-9 place-items-center ${iconColor}`}><Icon className="h-7 w-7" /></span><p className="mt-1 text-[11px] font-extrabold leading-4 text-brand-ink"><span className="block">{lineOne}</span>{lineTwo}</p></div>)}</div><p className="mt-4 text-sm font-bold text-slate-600">Because every baby deserves the best.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/category" className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(74,166,217,.24)] transition hover:-translate-y-px hover:bg-brand-ink">Shop Now <ArrowRight className="h-4 w-4" /></Link><Link to="/category" className="inline-flex items-center gap-2 rounded-full border border-brand-green/50 bg-white/80 px-6 py-3.5 text-sm font-extrabold text-brand-green transition hover:border-brand-green hover:bg-white">Explore Collection</Link></div></div></div></section>
}

function HeroWithPastedProducts() {
  const highlights = [
    [Leaf, 'Natural', 'Ingredients', 'text-[#67c788]'],
    [ShieldCheck, 'Safe &', 'Gentle', 'text-[#4aa6d9]'],
    [Heart, 'Trusted By', 'Parents', 'text-[#ef7fa7]'],
    [Droplets, 'Daily Care', 'Essentials', 'text-[#efb94f]'],
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#eaf8fb]" aria-label="Welcome to Baby Cure">
      <img src={newHeroImage} alt="BabyCure gentle baby care" className="absolute inset-0 h-full w-full object-cover object-center" loading="eager" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,252,252,.94)_0%,rgba(247,255,245,.82)_38%,rgba(255,255,255,.2)_62%,rgba(255,255,255,.02)_86%)]" />
      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-10 sm:min-h-[720px] sm:py-12 lg:min-h-[720px] lg:px-6">
        <div className="w-full max-w-[610px] rounded-[1.5rem] border border-white/70 bg-white/72 p-5 shadow-[0_18px_50px_rgba(23,50,77,.08)] backdrop-blur-[2px] sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-green/50 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[.16em] text-brand-green shadow-sm sm:text-[11px]"><Leaf className="h-3.5 w-3.5" /> Welcome to Baby Cure</p>
          <h1 className="mt-5 font-display text-[2.7rem] font-black leading-[.98] tracking-[-.03em] text-brand-ink sm:mt-6 sm:text-6xl lg:text-[72px]">Welcome to <span className="block text-brand-green">Baby Cure</span></h1>
          <p className="mt-4 text-base font-black text-brand-ink sm:mt-5 sm:text-lg">Gentle by nature, pure by care.</p>
          <p className="mt-3 max-w-lg text-sm font-bold leading-6 text-slate-700 sm:mt-4 sm:text-base sm:leading-7">At Baby Cure, we understand that your baby deserves the purest care. Our thoughtfully crafted products are made with natural ingredients to nurture, protect, and pamper your little one every day.</p>
          <div className="mt-7 grid max-w-lg grid-cols-2 gap-3 border-y border-slate-200/80 py-5 sm:grid-cols-4">{highlights.map(([Icon, lineOne, lineTwo, iconColor]) => <div key={`${lineOne}-${lineTwo}`} className="text-center"><span className={`mx-auto grid h-9 w-9 place-items-center ${iconColor}`}><Icon className="h-7 w-7" /></span><p className="mt-1 text-[11px] font-extrabold leading-4 text-brand-ink"><span className="block">{lineOne}</span>{lineTwo}</p></div>)}</div>
          <p className="mt-4 text-sm font-black text-slate-700">Because every baby deserves the best.</p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-7"><Link to="/category" className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(74,166,217,.24)] transition hover:-translate-y-px hover:bg-brand-ink sm:px-6 sm:py-3.5">Shop Now <ArrowRight className="h-4 w-4" /></Link><Link to="/category" className="inline-flex items-center gap-2 rounded-full border border-brand-green/50 bg-white/90 px-5 py-3 text-sm font-black text-brand-green transition hover:border-brand-green hover:bg-white sm:px-6 sm:py-3.5">Explore Collection</Link></div>
        </div>
      </div>
    </section>
  )
}

function TrustBar() {
  const points = [[ShieldCheck, 'Gentle everyday care', 'For delicate little ones'], [Leaf, 'Thoughtfully selected', 'Comfort-first essentials'], [Truck, `Free delivery \u20B9499+`, 'Delivered with care'], [Heart, 'Care support', 'Here when you need us']]
  return <section className="border-b border-slate-100 bg-white"><div className="mx-auto grid max-w-7xl divide-y divide-slate-100 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-6">{points.map(([Icon, title, text]) => <div key={title} className="flex items-center gap-3 py-5 sm:px-5 lg:px-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-mist text-brand-blue"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-extrabold text-brand-ink">{title}</h3><p className="mt-0.5 text-xs font-medium text-slate-500">{text}</p></div></div>)}</div></section>
}

function OurStory() {
  const journey = [
    [Heart, 'It All Started with Love', 'Inspired by the purest bond between a parent and child, Baby Cure was born.'],
    [Leaf, 'Carefully Chosen Ingredients', 'We handpick natural, safe and gentle ingredients that nurture delicate baby skin.'],
    [ShieldCheck, 'Safe & Trusted Formulations', 'Every product is thoughtfully formulated and tested to ensure the highest safety and quality standards.'],
    [Baby, 'Made for Little Ones', 'Designed for babies’ delicate skin and daily needs, because they deserve nothing but the best.'],
    [Globe2, 'Caring for Every Baby', 'Today, Baby Cure is trusted by parents everywhere and our promise continues for every baby, every day.'],
  ]

  return <section className="bg-[#fffdf8] px-4 py-14 sm:py-20 lg:px-6"><div className="mx-auto max-w-7xl"><div className="grid overflow-hidden rounded-[2rem] border border-[#f0eadf] bg-[#fffdf8] shadow-[0_22px_70px_rgba(132,103,54,.10)] lg:grid-cols-[.92fr_1.08fr]"><div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16"><p className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-extrabold text-brand-blue shadow-[0_8px_22px_rgba(23,50,77,.12)]">Our Story <Heart className="h-4 w-4 text-brand-green" /></p><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.05] text-brand-ink sm:text-5xl">The <span className="text-brand-blue">Baby Cure</span> Story <Heart className="inline h-7 w-7 text-brand-green sm:h-8 sm:w-8" /></h2><p className="mt-4 text-lg font-semibold text-brand-blue">A Promise Born from Love, Dedicated to Every Baby.</p><div className="mt-6 flex items-center gap-2 text-brand-blue/40"><span className="h-px w-28 bg-brand-blue/20" /><Heart className="h-4 w-4" /><span className="h-px w-28 bg-brand-blue/20" /></div><p className="mt-6 max-w-xl text-sm font-medium leading-7 text-slate-700 sm:text-base">Baby Cure began with a simple thought - every baby deserves pure, gentle and safe care. As parents, we understand the love, worry and endless responsibility that comes with raising a little one. That is why we created Baby Cure - to give every parent the confidence that their baby is in the safest, most caring hands.</p><div className="mt-7 w-fit"><Logo /></div><Link to="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue transition hover:text-brand-green">Read our story <ArrowRight className="h-4 w-4" /></Link></div><div className="relative min-h-[360px] overflow-hidden sm:min-h-[500px]"><img src={familyImage} alt="Mother caring for her baby" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" /><div className="absolute bottom-5 right-5 max-w-[270px] rounded-[1.5rem] bg-white/95 px-6 py-5 shadow-[0_18px_45px_rgba(23,50,77,.16)] backdrop-blur"><span className="font-display text-4xl leading-none text-brand-green">“</span><p className="mt-1 text-sm font-semibold leading-6 text-brand-ink">Our journey is built on trust, quality and the well-being of your baby.</p></div></div></div><div className="mt-10"><h3 className="text-center font-display text-2xl font-extrabold text-brand-blue sm:text-3xl">Our Journey <Heart className="mb-1 inline h-5 w-5 text-brand-green" /></h3><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{journey.map(([Icon, title, copy], index) => <div key={title} className="relative rounded-2xl border border-slate-100 bg-white px-4 py-5 text-center shadow-[0_10px_30px_rgba(74,166,217,.08)] lg:after:absolute lg:after:right-[-18px] lg:after:top-1/2 lg:after:h-px lg:after:w-9 lg:after:bg-brand-blue/35 lg:after:content-[''] lg:last:after:hidden"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#eef8e9] text-brand-green"><Icon className="h-6 w-6" /></span><h4 className="mt-4 text-xs font-extrabold leading-5 text-brand-blue">{title}</h4><p className="mt-2 text-[11px] leading-5 text-slate-600">{copy}</p><span className="absolute left-1/2 top-[-9px] h-[18px] w-[18px] -translate-x-1/2 rounded-full border-4 border-[#fffdf8] bg-brand-blue/25 lg:hidden" />{index < journey.length - 1 && <span className="hidden" />}</div>)}</div></div></div></section>
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
