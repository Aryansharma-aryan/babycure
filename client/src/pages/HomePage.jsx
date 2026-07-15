import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Baby,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Droplets,
  Gift,
  Heart,
  Leaf,
  MessageCircle,
  MessageCircleHeart,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import ProductArt from '../components/ProductArt'
import { articles, images } from '../data/products'
import heroProducts from '../assets/babycure-hero-products.png'
import heroAi from '../assets/babycure-hero-ai.png'
import heroMoments from '../assets/hero.png'
import heroRoutine from '../assets/heroo.png'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const categories = [
  { title: 'Baby Lotion', icon: Droplets, color: 'from-sky-50 to-white' },
  { title: 'Baby Shampoo', icon: Sparkles, color: 'from-green-50 to-white' },
  { title: 'Baby Oil', icon: Leaf, color: 'from-sky-50 to-green-50' },
  { title: 'Diapers', icon: PackageCheck, color: 'from-white to-sky-50' },
  { title: 'Baby Wipes', icon: Baby, color: 'from-green-50 to-white' },
  { title: 'Skin Care', icon: Heart, color: 'from-white to-green-50' },
]

const featuredProducts = [
  {
    name: 'Gentle Baby Wash',
    price: 399,
    oldPrice: 549,
    badge: '27% OFF',
    image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
  },
  {
    name: 'Moisturizing Baby Lotion',
    price: 499,
    oldPrice: 649,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
  },
  {
    name: 'Soothing Diaper Rash Cream',
    price: 299,
    oldPrice: 399,
    badge: 'Gentle Care',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
  },
  {
    name: 'Premium Baby Wipes',
    price: 199,
    oldPrice: 249,
    badge: 'Soft Touch',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
  },
]

const loveCards = [
  { icon: ShieldCheck, title: 'Dermatologist Approved', copy: 'Formulas tested for daily baby care routines.' },
  { icon: Leaf, title: 'Natural Ingredients', copy: 'Soft plant-inspired care for delicate skin.' },
  { icon: Baby, title: 'Safe for Sensitive Skin', copy: 'Balanced, gentle and made for newborn comfort.' },
  { icon: Heart, title: 'Cruelty Free', copy: 'Kind care for babies, parents and the planet.' },
]

const careConcerns = [
  { title: 'Dry & Delicate Skin', copy: 'Hydration that feels soft from the first touch.', type: 'lotion', color: 'green', query: 'lotion', tone: 'from-[#F6FFF4] via-white to-[#EAF8FF]' },
  { title: 'Happy Bath Time', copy: 'A simple, tear-free ritual for little splashes.', type: 'pump', color: 'blue', query: 'wash', tone: 'from-[#EAF8FF] via-white to-[#F5FFF3]' },
  { title: 'Diaper Comfort', copy: 'Everyday protection for happy little bottoms.', type: 'tube', color: 'green', query: 'diaper', tone: 'from-[#FFF9EC] via-white to-[#F5FFF3]' },
  { title: 'Massage & Bonding', copy: 'Nourishing care for your gentle daily massage.', type: 'spray', color: 'gold', query: 'oil', tone: 'from-[#FFF8E9] via-white to-[#EAF8FF]' },
]

const routineBundles = [
  { name: 'Bath Time Set', copy: 'A soft start for calm bubbles and post-bath comfort.', price: 749, oldPrice: 948, save: 'Save Rs.199', types: [['pump', 'blue'], ['lotion', 'green']], accent: 'from-[#EAF8FF] to-[#F5FFF3]' },
  { name: 'Newborn Starter Set', copy: 'Three gentle essentials for your baby’s first days.', price: 999, oldPrice: 1247, save: 'Save Rs.248', types: [['pump', 'blue'], ['tube', 'green'], ['wipes', 'blue']], accent: 'from-[#F5FFF3] to-[#FFF8E9]' },
  { name: 'Massage Ritual Set', copy: 'A comforting daily ritual made for bonding moments.', price: 599, oldPrice: 798, save: 'Save Rs.199', types: [['spray', 'gold'], ['lotion', 'green']], accent: 'from-[#FFF8E9] to-[#EAF8FF]' },
]

const comparisonItems = [
  { name: 'Gentle Baby Wash', use: 'Bath time', texture: 'Light, easy-rinse wash', type: 'pump', color: 'blue' },
  { name: 'Moisturizing Lotion', use: 'Daily moisture', texture: 'Soft everyday lotion', type: 'lotion', color: 'green' },
  { name: 'Baby Oil', use: 'Massage routine', texture: 'Nourishing light oil', type: 'spray', color: 'gold' },
  { name: 'Rash Relief Cream', use: 'Diaper changes', texture: 'Comforting protective cream', type: 'tube', color: 'green' },
]

const faqs = [
  { question: 'Which product should I start with for a newborn?', answer: 'For a simple everyday routine, begin with gentle bath care and daily moisture. You can explore the Newborn Starter Set for a curated starting point.' },
  { question: 'How do I choose the right care routine?', answer: 'Shop by your baby’s immediate need—bath time, dry-feeling skin, diaper comfort or massage—and build your routine one gentle step at a time.' },
  { question: 'Do you offer delivery support and order tracking?', answer: 'Yes. Orders can be tracked from your account after dispatch. Our support team can also help with product guidance and order questions.' },
  { question: 'Need help before placing an order?', answer: 'Use the WhatsApp support button for quick product guidance, or contact BabyCure through the support page.' },
]

const testimonials = [
  { name: 'Aarohi M.', text: 'The lotion feels soft and premium. My baby skin stays calm after every bath.', rating: 5 },
  { name: 'Neha S.', text: 'Beautiful packaging, gentle fragrance and very smooth checkout experience.', rating: 5 },
  { name: 'Ritika P.', text: 'BabyCure feels trustworthy. The wipes and wash became our daily essentials.', rating: 5 },
]

const marqueeItems = [
  'Today only: Flat 20% off on BabyCure essentials',
  'Dermatologist-tested shampoo, lotion and skincare',
  'Free shipping on orders above Rs.499',
  'Natural care for bath, massage and diaper routines',
  'Fresh baby wipes and soothing cream for daily comfort',
]

const heroSlides = [
  {
    image: heroProducts,
    alt: 'Mother holding a smiling baby with BabyCure products',
    eyebrow: 'Loved by little ones',
    title: <>Pure love. <span className="text-brand-blue">Gentle</span> <span className="text-brand-green">care.</span></>,
    copy: 'Thoughtfully made, dermatologist-tested essentials for every little care ritual.',
    align: 'left',
    stats: [['10k+', 'Happy Parents'], ['97%', 'Natural Care'], ['4.9', 'Rating Score'], ['24/7', 'Parent Support']],
  },
  {
    image: heroAi,
    alt: 'Mother and baby enjoying a calm BabyCure care routine',
    eyebrow: 'Bath time, made softer',
    title: <>A little ritual. <span className="text-brand-green">A lot of love.</span></>,
    copy: 'From first bubbles to bedtime cuddles, discover gentle care made for everyday closeness.',
    align: 'left',
    stats: [['0%', 'Harsh Feel'], ['100%', 'Daily Comfort'], ['4.9/5', 'Parent Love'], ['Newborn', 'Friendly']],
  },
  {
    image: heroMoments,
    alt: 'Happy mother and baby sharing a tender moment',
    eyebrow: 'Care they can feel',
    title: <>Soft skin starts with <span className="text-brand-blue">soft choices.</span></>,
    copy: 'Premium essentials that turn the small moments of care into moments to remember.',
    align: 'left',
    stats: [['Clean', 'Gentle Formulas'], ['Kind', 'For Sensitive Skin'], ['Fast', 'Easy Delivery'], ['Real', 'Parent Trusted']],
  },
  {
    image: heroRoutine,
    alt: 'Mother caring for baby during a peaceful home routine',
    eyebrow: 'Everyday baby wellness',
    title: <>Made for tiny hands & <span className="text-brand-green">big dreams.</span></>,
    copy: 'Beautifully simple products for the routines that help babies feel safe, calm and loved.',
    align: 'left',
    stats: [['Gentle', 'On Delicate Skin'], ['Pure', 'Care Rituals'], ['Easy', 'To Shop'], ['Free', 'Shipping Rs.499+']],
  },
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F5FFF3_42%,#F3FBFF_100%)] text-brand-ink">
      <HeroSection />
      <RoutineShelf />
      <OfferMarquee />
      <CategorySection />
      <ConcernSection />
      <BundleSection />
      <FeaturedSection />
      <ParentsLoveSection />
      <TrustBand />
      <PromiseSection />
      <BestSellersSection />
      <EmotionalBanner />
      <TestimonialsSection />
      <CareJournalSection />
      <ComparisonSection />
      <FaqSection />
      <NewsletterSection />
      <WhatsAppHelp />
    </main>
  )
}

function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const carousel = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 4000)
    return () => window.clearInterval(carousel)
  }, [])

  const goToSlide = (direction) => {
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length)
  }

  const slide = heroSlides[activeSlide]

  return (
    <section className="relative isolate min-h-[calc(100svh-104px)] overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FFF4_43%,#EFF9FF_100%)] sm:min-h-[620px] lg:min-h-[calc(100vh-120px)] xl:min-h-[700px]" aria-roledescription="carousel" aria-label="BabyCure featured care stories">
      <AnimatePresence mode="wait">
        <motion.div key={activeSlide} initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }} className="absolute inset-0">
          <img src={slide.image} alt={slide.alt} className={`h-full w-full object-cover ${slide.align === 'right' ? 'object-[38%_center] sm:object-center' : 'object-[70%_center] sm:object-[62%_center]'}`} loading={activeSlide === 0 ? 'eager' : 'lazy'} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,42,68,0.18)_0%,rgba(255,255,255,0.04)_38%,rgba(255,255,255,0.04)_64%,rgba(9,42,68,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_24%,rgba(124,197,118,0.14),transparent_28rem),radial-gradient(circle_at_40%_18%,rgba(74,166,217,0.08),transparent_28rem)]" />
        </motion.div>
      </AnimatePresence>
      <motion.div key={`copy-${activeSlide}`} initial="hidden" animate="visible" variants={stagger} className={`relative mx-auto grid min-h-[calc(100svh-104px)] max-w-7xl items-center px-4 py-20 sm:min-h-[620px] sm:py-10 lg:min-h-[calc(100vh-120px)] lg:px-6 xl:min-h-[700px] ${slide.align === 'right' ? 'justify-items-end text-right' : 'justify-items-start text-left'}`}>
        <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: 'easeOut' }} className="max-w-2xl rounded-[1.7rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_56px_rgba(23,50,77,0.16)] backdrop-blur-md sm:rounded-[2rem] sm:p-7 lg:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white/88 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-green shadow-[0_14px_32px_rgba(124,197,118,0.14)] backdrop-blur sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.22em]"><Sparkles className="h-4 w-4" /> {slide.eyebrow}</span>
          <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[0.97] tracking-[-0.035em] text-brand-ink sm:mt-6 sm:text-[60px] lg:text-[68px]">{slide.title}</h1>
          <p className={`mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg sm:leading-8 ${slide.align === 'right' ? 'ml-auto' : ''}`}>{slide.copy}</p>
          <div className={`mt-7 grid gap-3 sm:flex sm:flex-wrap ${slide.align === 'right' ? 'sm:justify-end' : ''}`}>
            <Button to="/category" className="w-full rounded-full px-6 py-3.5 text-base shadow-[0_22px_55px_rgba(74,166,217,0.22)] sm:w-auto sm:px-8 sm:py-4">Shop Now <ArrowRight className="h-5 w-5" /></Button>
            <Button to="/category" variant="outline" className="w-full rounded-full border-brand-green/40 bg-white/65 px-6 py-3.5 text-base backdrop-blur sm:w-auto sm:px-8 sm:py-4">Explore Collection</Button>
          </div>
          <div className="mt-6 grid max-w-2xl grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3 sm:grid-cols-4">
            {slide.stats.map(([value, label]) => <motion.div key={label} variants={fadeUp} className="rounded-2xl border border-sky-100 bg-white/76 p-3 text-center shadow-[0_14px_34px_rgba(74,166,217,0.12)] backdrop-blur sm:rounded-3xl sm:p-4"><p className="font-display text-xl font-extrabold text-brand-blue sm:text-3xl">{value}</p><p className="mt-1 text-[10px] font-bold text-slate-500 sm:text-xs">{label}</p></motion.div>)}
          </div>
        </motion.div>
      </motion.div>
      <div className="absolute inset-x-0 bottom-4 z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:bottom-6 lg:px-6">
        <div className="hidden gap-2 sm:flex">{heroSlides.map((item, index) => <button type="button" key={item.alt} onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-10 bg-brand-green' : 'w-2.5 bg-brand-ink/25 hover:bg-brand-ink/45'}`} aria-label={`Show slide ${index + 1}`} aria-current={index === activeSlide} />)}</div>
        <div className="ml-auto flex gap-2"><button type="button" onClick={() => goToSlide(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/85 text-brand-ink shadow-lg backdrop-blur transition hover:scale-105" aria-label="Previous slide"><ChevronLeft className="h-5 w-5" /></button><button type="button" onClick={() => goToSlide(1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/85 text-brand-ink shadow-lg backdrop-blur transition hover:scale-105" aria-label="Next slide"><ChevronRight className="h-5 w-5" /></button></div>
      </div>
    </section>
  )
}

function RoutineShelf() {
  const essentials = [
    { name: 'Gentle Baby Wash', type: 'pump', color: 'blue', note: 'Tear-free bath care' },
    { name: 'Daily Soft Lotion', type: 'lotion', color: 'green', note: '24-hour moisture' },
    { name: 'Nourishing Baby Oil', type: 'spray', color: 'gold', note: 'For loving massages' },
    { name: 'Rash Relief Cream', type: 'tube', color: 'green', note: 'Comforting barrier care' },
  ]

  return (
    <section className="relative z-20 mx-auto -mt-3 max-w-7xl px-4 pb-3 sm:-mt-6 sm:pb-6 lg:px-6">
      <div className="overflow-hidden rounded-[1.65rem] border border-white/90 bg-white/94 shadow-[0_24px_70px_rgba(23,50,77,0.14)] backdrop-blur-xl">
        <div className="flex flex-col gap-2 border-b border-sky-100 bg-[linear-gradient(90deg,#F5FFF3,#FFFFFF,#F3FBFF)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand-green">Build a gentle routine</p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-brand-ink sm:text-2xl">BabyCure essentials, made to be seen</h2>
          </div>
          <Link to="/category" className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue transition hover:text-brand-green">Shop all essentials <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-sky-100 sm:grid-cols-4 sm:divide-y-0">
          {essentials.map((item) => (
            <Link key={item.name} to="/category" className="group flex min-w-0 items-center gap-3 bg-white px-4 py-4 transition hover:bg-brand-mist sm:justify-center sm:px-3 lg:gap-4 lg:px-5">
              <div className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#F3FBFF,#F5FFF3)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_30px_rgba(74,166,217,0.16)]"><div className="scale-[0.5]"><ProductArt type={item.type} color={item.color} /></div></div>
              <div className="min-w-0"><h3 className="truncate text-sm font-extrabold text-brand-ink">{item.name}</h3><p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{item.note}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function OfferMarquee() {
  const loopItems = [...marqueeItems, ...marqueeItems]

  return (
    <section className="relative z-10 border-y border-sky-100 bg-white/90 py-2 shadow-[0_12px_34px_rgba(74,166,217,0.10)] backdrop-blur">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent" />
      <div className="overflow-hidden">
        <div className="baby-offer-track flex w-max items-center gap-7">
          {loopItems.map((item, index) => (
            <Link
              key={`${item}-${index}`}
              to="/category"
              className="inline-flex items-center gap-3 text-sm font-extrabold text-brand-ink transition hover:text-brand-green"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-brand-leaf to-sky-50 text-brand-green">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span>{item}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/35" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategorySection() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-20">
      <SectionHeading eyebrow="Soft routines" title="Shop by Category" copy="Everything parents need for bath time, skin care, diapering and daily comfort." />
      <motion.div variants={stagger} className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ title, icon: Icon, color }) => (
          <motion.div key={title} variants={fadeUp}>
            <Link to={`/category?search=${encodeURIComponent(title)}`} className={`group relative isolate block overflow-hidden rounded-[2rem] border border-white/90 bg-gradient-to-br ${color} p-5 text-center shadow-[0_12px_26px_rgba(74,166,217,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] transition duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-[0_24px_48px_rgba(74,166,217,0.18),0_8px_18px_rgba(124,197,118,0.08)] before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-white/95 before:content-['']`}>
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/90 bg-white/90 text-brand-blue shadow-[0_12px_26px_rgba(74,166,217,0.12),inset_0_1px_0_white] transition duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-brand-green">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="relative mt-4 font-display text-base font-extrabold text-brand-ink transition group-hover:text-brand-blue">{title}</h3>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </MotionSection>
  )
}

function FeaturedSection() {
  return (
    <MotionSection className="bg-[linear-gradient(180deg,#FFFFFF,#F3FBFF)] py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="Parent favorites" title="Featured Products" copy="Premium essentials with clean textures, gentle formulas and beautiful care rituals." action="View Collection" />
        <motion.div variants={stagger} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => <PremiumProductCard key={product.name} product={product} />)}
        </motion.div>
      </div>
    </MotionSection>
  )
}

function PremiumProductCard({ product, large = false }) {
  return (
    <motion.article variants={fadeUp} className={`group relative overflow-hidden rounded-[2rem] border border-white bg-white p-4 shadow-[0_16px_34px_rgba(74,166,217,0.12),inset_0_1px_0_white] transition duration-300 hover:-translate-y-2 hover:border-sky-100 hover:shadow-[0_28px_58px_rgba(74,166,217,0.20),0_8px_18px_rgba(124,197,118,0.08)] ${large ? 'lg:grid lg:grid-cols-[0.95fr_1fr] lg:items-center lg:p-6' : ''}`}>
      <Link to="/category" className={`relative block overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-sky-50 to-green-50 ${large ? 'h-80' : 'h-64'}`}>
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-4 py-2 text-xs font-extrabold text-brand-green shadow-[0_12px_30px_rgba(124,197,118,0.18)]">{product.badge}</span>
        <button type="button" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/92 text-red-500 shadow-[0_12px_30px_rgba(239,68,68,0.16)] transition hover:scale-110 hover:bg-red-50 hover:text-red-600" aria-label="Wishlist">
          <Heart className="h-5 w-5" />
        </button>
      </Link>
      <div className={large ? 'lg:pl-6' : ''}>
        <div className="mt-5 flex items-center gap-1 text-yellow-400">
          {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
          <span className="ml-2 text-xs font-bold text-slate-500">{product.rating}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-extrabold text-brand-ink">{product.name}</h3>
        <div className="mt-3 flex items-center gap-3">
          <p className="font-display text-2xl font-extrabold text-brand-blue">Rs.{product.price}</p>
          <p className="font-bold text-slate-300 line-through">Rs.{product.oldPrice}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link to="/category" className="rounded-full border border-sky-300/25 bg-[linear-gradient(135deg,#2799d3,#5cb6e3)] px-4 py-3 text-center text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(25,132,190,0.24)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_18px_34px_rgba(25,132,190,0.30)]">
            Add to Cart
          </Link>
          <Link to="/category" className="rounded-full border border-green-200/80 bg-[linear-gradient(135deg,#FFFFFF,#F2FBEF)] px-4 py-3 text-center text-sm font-extrabold text-brand-green shadow-[0_8px_18px_rgba(124,197,118,0.08)] transition hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-[0_14px_26px_rgba(124,197,118,0.15)]">
            Quick View
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function ParentsLoveSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-20">
      <SectionHeading eyebrow="Why parents love BabyCure" title="Clean, gentle and made with care" copy="Every touchpoint is designed to feel safe, soft and reassuring." />
      <motion.div variants={stagger} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {loveCards.map(({ icon: Icon, title, copy }) => (
          <motion.div key={title} variants={fadeUp} className="rounded-[2rem] border border-white bg-white p-7 shadow-[0_16px_34px_rgba(74,166,217,0.10),inset_0_1px_0_white] transition hover:-translate-y-2 hover:border-green-100 hover:shadow-[0_28px_54px_rgba(124,197,118,0.16)]">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-sky-50 to-green-50 text-brand-blue">
              <Icon className="h-7 w-7" />
            </span>
            <h3 className="mt-6 font-display text-xl font-extrabold text-brand-ink">{title}</h3>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{copy}</p>
          </motion.div>
        ))}
      </motion.div>
    </MotionSection>
  )
}

function BestSellersSection() {
  return (
    <MotionSection className="overflow-hidden bg-brand-mist py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="Best sellers" title="Loved in daily routines" copy="Parent-loved essentials with real ratings, clear pricing and quick add-to-cart." action="View all products" />
        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-5 [scrollbar-width:thin] sm:-mx-0 sm:px-0">
          {featuredProducts.map((product) => (
            <motion.div key={product.name} variants={fadeUp} className="w-[290px] shrink-0 snap-start sm:w-[315px]">
              <PremiumProductCard product={product} />
            </motion.div>
          ))}
        </div>
        <p className="mt-1 text-center text-xs font-bold text-slate-400 sm:hidden">Swipe to explore best sellers</p>
      </div>
    </MotionSection>
  )
}

function ConcernSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
      <SectionHeading eyebrow="Find their gentle match" title="Shop by little concern" copy="Start with what your baby needs today, then find a routine made for comfort." />
      <motion.div variants={stagger} className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {careConcerns.map((concern) => (
          <motion.div key={concern.title} variants={fadeUp}>
            <Link to={`/category?search=${concern.query}`} className={`group relative flex min-h-[230px] overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br ${concern.tone} p-6 shadow-[0_14px_32px_rgba(74,166,217,0.10),inset_0_1px_0_white] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(74,166,217,0.17)]`}>
              <div className="relative z-10 flex max-w-[62%] flex-col justify-between"><div><span className="inline-flex rounded-full border border-white bg-white/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-brand-green shadow-sm">Shop care</span><h3 className="mt-4 font-display text-2xl font-extrabold leading-tight text-brand-ink">{concern.title}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{concern.copy}</p></div><span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div>
              <div className="absolute bottom-1 right-3 grid h-40 w-28 place-items-center rounded-[2.5rem] bg-white/45 shadow-[inset_0_1px_0_white]"><div className="scale-[0.86] transition duration-300 group-hover:-translate-y-2 group-hover:scale-[0.95]"><ProductArt type={concern.type} color={concern.color} /></div></div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </MotionSection>
  )
}

function BundleSection() {
  return (
    <MotionSection className="bg-[linear-gradient(110deg,#17324D,#1E4768_56%,#2B6284)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#A5E59E]">Curated care sets</p><h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-[-0.02em] text-white sm:text-5xl">Everything they need, beautifully bundled.</h2><p className="mt-4 max-w-xl text-base font-medium leading-8 text-sky-100">Thoughtful combinations for the rituals parents come back to every day.</p></div>
          <Link to="/category" className="inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-extrabold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">View all bundles <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <motion.div variants={stagger} className="mt-10 grid gap-5 lg:grid-cols-3">
          {routineBundles.map((bundle) => (
            <motion.article key={bundle.name} variants={fadeUp} className="group overflow-hidden rounded-[2rem] border border-white/30 bg-white p-5 shadow-[0_22px_55px_rgba(0,0,0,0.20)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_32px_70px_rgba(0,0,0,0.28)]">
              <div className={`relative grid h-48 place-items-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${bundle.accent}`}>
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-brand-green shadow-sm">{bundle.save}</span>
                <div className="flex items-end justify-center gap-1.5">{bundle.types.map(([type, color], index) => <div key={`${type}-${index}`} className={`transition duration-300 group-hover:-translate-y-2 ${index === 1 ? 'scale-110' : 'scale-90'}`}><ProductArt type={type} color={color} /></div>)}</div>
              </div>
              <div className="px-1 pb-1 pt-5"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-2xl font-extrabold text-brand-ink">{bundle.name}</h3><Gift className="h-5 w-5 text-brand-green" /></div><p className="mt-3 min-h-12 text-sm font-medium leading-6 text-slate-500">{bundle.copy}</p><div className="mt-4 flex items-end justify-between"><div><span className="font-display text-2xl font-extrabold text-brand-blue">Rs.{bundle.price}</span><span className="ml-2 text-sm font-bold text-slate-300 line-through">Rs.{bundle.oldPrice}</span></div><Link to="/category" className="rounded-full bg-brand-green px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(79,158,72,0.24)] transition hover:-translate-y-0.5 hover:brightness-105">Choose set</Link></div></div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </MotionSection>
  )
}

function TrustBand() {
  const promises = [
    { icon: ShieldCheck, title: 'Dermatologist tested', copy: 'Made for delicate skin' },
    { icon: Truck, title: 'Free shipping above Rs.499', copy: 'Delivered with care' },
    { icon: RotateCcw, title: 'Easy returns', copy: 'Simple, parent-friendly support' },
    { icon: Heart, title: 'Care you can trust', copy: 'Thoughtful from formula to delivery' },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:py-9">
      <div className="grid overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_18px_45px_rgba(74,166,217,0.10)] sm:grid-cols-2 lg:grid-cols-4">
        {promises.map(({ icon: Icon, title, copy }) => <div key={title} className="flex items-center gap-4 border-b border-sky-100 p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#F3FBFF,#F5FFF3)] text-brand-blue"><Icon className="h-5 w-5" /></span><div><p className="text-sm font-extrabold text-brand-ink">{title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{copy}</p></div></div>)}
      </div>
    </section>
  )
}

function PromiseSection() {
  const promises = [
    ['Thoughtful routines', 'Easy-to-understand essentials for bath, moisture, massage and diaper care.'],
    ['Clear care guidance', 'Helpful product information so parents can choose with confidence.'],
    ['Support when needed', 'A quick, human support route for product and order questions.'],
  ]
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="grid overflow-hidden rounded-[2.5rem] border border-sky-100 bg-[linear-gradient(120deg,#F3FBFF,#FFFFFF_48%,#F5FFF3)] shadow-[0_24px_65px_rgba(74,166,217,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-brand-ink p-8 text-white sm:p-12"><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#A5E59E]">The BabyCure promise</p><h2 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">Care that feels simple, considered and close to home.</h2><p className="mt-5 max-w-md text-base font-medium leading-8 text-sky-100">A premium experience should make choosing baby care feel calmer—not more complicated.</p></div><Link to="/about" className="mt-8 inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold transition hover:bg-white/20">Our story <ArrowRight className="h-4 w-4" /></Link></div>
        <motion.div variants={stagger} className="grid content-center gap-4 p-6 sm:p-10">{promises.map(([title, copy], index) => <motion.div key={title} variants={fadeUp} className="flex gap-4 rounded-3xl border border-white bg-white/85 p-5 shadow-[0_12px_28px_rgba(74,166,217,0.08)]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-leaf text-brand-green"><CheckCircle2 className="h-5 w-5" /></span><div><p className="font-display text-lg font-extrabold text-brand-ink">0{index + 1}. {title}</p><p className="mt-1 text-sm font-medium leading-6 text-slate-500">{copy}</p></div></motion.div>)}</motion.div>
      </div>
    </MotionSection>
  )
}

function ComparisonSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <SectionHeading eyebrow="A clearer way to choose" title="Find the right care step" copy="A quick guide for building a gentle everyday routine." action="Shop all care" />
      <motion.div variants={stagger} className="mt-10 overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_18px_48px_rgba(74,166,217,0.10)]">
        <div className="hidden grid-cols-[1.2fr_1fr_1.3fr_auto] gap-4 border-b border-sky-100 bg-brand-mist px-7 py-4 text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue md:grid"><span>Essential</span><span>Best for</span><span>Feel</span><span>Explore</span></div>
        {comparisonItems.map((item) => <motion.div key={item.name} variants={fadeUp} className="grid gap-4 border-b border-sky-100 px-5 py-5 last:border-b-0 md:grid-cols-[1.2fr_1fr_1.3fr_auto] md:items-center md:px-7"><div className="flex items-center gap-4"><span className="grid h-14 w-12 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#F3FBFF,#F5FFF3)]"><span className="scale-[0.36]"><ProductArt type={item.type} color={item.color} /></span></span><span className="font-display text-lg font-extrabold text-brand-ink">{item.name}</span></div><p className="text-sm font-semibold text-slate-600"><span className="mr-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-green md:hidden">Best for</span>{item.use}</p><p className="text-sm font-semibold text-slate-500"><span className="mr-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-green md:hidden">Feel</span>{item.texture}</p><Link to="/category" className="inline-flex w-max items-center gap-2 text-sm font-extrabold text-brand-blue transition hover:text-brand-green">View <ArrowRight className="h-4 w-4" /></Link></motion.div>)}
      </motion.div>
    </MotionSection>
  )
}

function CareJournalSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <SectionHeading eyebrow="The BabyCure journal" title="Gentle guidance for everyday care" copy="Practical parent-friendly reads for the little rituals that matter most." action="Explore all articles" />
      <motion.div variants={stagger} className="mt-10 grid gap-6 md:grid-cols-3">
        {articles.map((article, index) => (
          <motion.article key={article.id} variants={fadeUp} className="group overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_16px_34px_rgba(74,166,217,0.10),inset_0_1px_0_white] transition duration-300 hover:-translate-y-2 hover:shadow-[0_28px_54px_rgba(74,166,217,0.18)]">
            <Link to="/blog" className="block"><div className="relative h-64 overflow-hidden"><img src={article.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-ink/35 to-transparent" /><span className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-green shadow-sm">Care guide</span></div></Link>
            <div className="p-6"><div className="flex items-center gap-2 text-xs font-bold text-slate-400"><span>{article.date}</span><span className="h-1 w-1 rounded-full bg-brand-green" /><span>{index === 0 ? '4 min read' : '3 min read'}</span></div><h3 className="mt-4 min-h-[3.5rem] font-display text-2xl font-extrabold leading-tight text-brand-ink">{article.title}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{article.copy}</p><Link to="/blog" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue transition hover:text-brand-green">Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></div>
          </motion.article>
        ))}
      </motion.div>
    </MotionSection>
  )
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)
  return (
    <MotionSection className="bg-[linear-gradient(180deg,#F5FFF3,#FFFFFF)] py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-green">Helpful answers</p><h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.02em] text-brand-ink sm:text-5xl">Questions parents ask before they shop.</h2><p className="mt-5 max-w-md text-base font-medium leading-8 text-slate-600">Still deciding? Our care team is one message away.</p><a href="https://wa.me/918607201606?text=Hi%20BabyCure%2C%20I%20need%20help%20choosing%20baby%20care%20products." target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(79,158,72,0.22)] transition hover:-translate-y-0.5"><MessageCircle className="h-4 w-4" /> Ask on WhatsApp</a></div><div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_18px_48px_rgba(74,166,217,0.10)]">{faqs.map((faq, index) => <div key={faq.question} className="border-b border-sky-100 last:border-b-0"><button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-extrabold text-brand-ink"><span>{faq.question}</span><ChevronDown className={`h-5 w-5 shrink-0 text-brand-blue transition ${openIndex === index ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{openIndex === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-6 pb-5 text-sm font-medium leading-7 text-slate-600">{faq.answer}</p></motion.div>}</AnimatePresence></div>)}</div></div>
    </MotionSection>
  )
}

function EmotionalBanner() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-20">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_35px_110px_rgba(74,166,217,0.18)]">
        <img src={images.soft} alt="Mother and baby smiling together" className="h-[520px] w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/78 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center px-7 sm:px-12">
          <span className="mb-5 w-max rounded-full bg-brand-leaf px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">Emotional care</span>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-brand-ink sm:text-6xl">Made With Love, Trusted By Parents</h2>
          <p className="mt-5 text-base font-medium leading-8 text-slate-600">Gentle essentials that make every bath, massage and cuddle feel calmer.</p>
          <Button to="/category" className="mt-8 w-max rounded-full px-8 py-4">Shop Best Sellers</Button>
        </div>
      </div>
    </MotionSection>
  )
}

function TestimonialsSection() {
  return (
    <MotionSection className="bg-[linear-gradient(180deg,#FFFFFF,#F5FFF3)] py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="Happy parents" title="Real love from BabyCure families" copy="Trust grows from gentle products and smooth shopping moments." />
        <motion.div variants={stagger} className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div key={item.name} variants={fadeUp} className="rounded-[2rem] border border-white bg-white p-7 shadow-[0_16px_34px_rgba(74,166,217,0.10),inset_0_1px_0_white] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(74,166,217,0.16)]">
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-[linear-gradient(135deg,#EAF8FF,#F5FFF3)] font-display text-lg font-extrabold text-brand-blue">{item.name.charAt(0)}</span><span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand-green"><CheckCircle2 className="h-3.5 w-3.5" /> Parent note</span></div>
              <div className="mt-5 flex gap-1 text-yellow-400">{Array.from({ length: item.rating }).map((_, starIndex) => <Star key={starIndex} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-5 text-sm font-medium leading-7 text-slate-600">"{item.text}"</p>
              <p className="mt-5 font-display text-lg font-extrabold text-brand-ink">{item.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MotionSection>
  )
}

function WhatsAppHelp() {
  const whatsappLink = `https://wa.me/918607201606?text=${encodeURIComponent('Hi BabyCure, I need help choosing baby care products.')}`
  return (
    <a href={whatsappLink} target="_blank" rel="noreferrer" className="fixed bottom-24 right-4 z-40 inline-flex items-center gap-3 rounded-full border border-white/70 bg-[#25D366] px-4 py-3 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(37,211,102,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(37,211,102,0.42)] sm:bottom-6 sm:right-6" aria-label="Chat with BabyCure on WhatsApp"><MessageCircle className="h-5 w-5 fill-current" /><span className="hidden sm:block">Need help choosing?</span></a>
  )
}

function NewsletterSection() {
  return (
    <MotionSection className="mx-auto max-w-7xl px-4 py-20">
      <div className="grid overflow-hidden rounded-[2.5rem] border border-sky-100 bg-[linear-gradient(120deg,#F3FBFF,#FFFFFF,#F5FFF3)] p-8 shadow-[0_32px_100px_rgba(74,166,217,0.16)] lg:grid-cols-[1fr_0.8fr] lg:p-12">
        <div>
          <span className="rounded-full bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue shadow-[0_12px_32px_rgba(74,166,217,0.12)]">BabyCure club</span>
          <h2 className="mt-7 max-w-2xl font-display text-4xl font-extrabold leading-tight text-brand-ink sm:text-5xl">Get Exclusive Offers & Parenting Tips</h2>
          <p className="mt-4 max-w-xl font-medium leading-8 text-slate-600">Join for gentle care advice, launch updates and soft little savings.</p>
        </div>
        <form className="mt-8 flex flex-col gap-3 self-center rounded-full bg-white p-2 shadow-[0_20px_65px_rgba(74,166,217,0.14)] sm:flex-row lg:mt-0">
          <input type="email" placeholder="Enter your email" className="min-h-14 flex-1 rounded-full px-5 text-sm font-semibold outline-none" />
          <button type="submit" className="rounded-full bg-brand-green px-7 py-4 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(124,197,118,0.24)] transition hover:-translate-y-0.5">
            Subscribe
          </button>
        </form>
      </div>
    </MotionSection>
  )
}

function SectionHeading({ eyebrow, title, copy, action }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-green">{eyebrow}</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-[-0.02em] text-brand-ink sm:text-5xl">{title}</h2>
        {copy && <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600">{copy}</p>}
      </div>
      {action && (
        <Link to="/category" className="inline-flex w-max items-center gap-2 rounded-full border border-sky-100 bg-white px-6 py-3 text-sm font-extrabold text-brand-blue shadow-[0_16px_44px_rgba(74,166,217,0.10)] transition hover:-translate-y-0.5">
          {action} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  )
}

function MotionSection({ children, className }) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
    >
      {children}
    </motion.section>
  )
}
