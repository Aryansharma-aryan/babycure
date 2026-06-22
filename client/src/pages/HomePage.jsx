import { motion } from 'framer-motion'
import {
  ArrowRight,
  Baby,
  Droplets,
  Heart,
  Leaf,
  MessageCircleHeart,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { images } from '../data/products'
import heroImage from '../assets/babycure-hero-products.png'

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

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F5FFF3_42%,#F3FBFF_100%)] text-brand-ink">
      <HeroSection />
      <OfferMarquee />
      <CategorySection />
      <FeaturedSection />
      <ParentsLoveSection />
      <BestSellersSection />
      <EmotionalBanner />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="relative isolate min-h-[calc(100svh-104px)] overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FFF4_43%,#EFF9FF_100%)] sm:min-h-[760px] lg:min-h-[calc(100vh-132px)] xl:min-h-[820px]">
      <img
        src={heroImage}
        alt="Mother holding smiling baby with BabyCure products"
        className="absolute inset-0 h-full w-full object-cover object-[58%_center] sm:object-[62%_center]"
        loading="eager"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#FFFFFF_0%,rgba(248,255,246,0.98)_30%,rgba(240,252,255,0.82)_47%,rgba(255,255,255,0.28)_72%,rgba(255,255,255,0.02)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_6%_24%,rgba(124,197,118,0.34),transparent_26rem),radial-gradient(circle_at_34%_18%,rgba(74,166,217,0.14),transparent_28rem),radial-gradient(circle_at_78%_18%,rgba(124,197,118,0.16),transparent_31rem)]" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative mx-auto grid min-h-[calc(100svh-104px)] max-w-7xl items-center px-4 py-10 sm:min-h-[760px] lg:min-h-[calc(100vh-132px)] lg:grid-cols-[0.82fr_1.18fr] lg:px-6 xl:min-h-[820px]"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: 'easeOut' }} className="max-w-2xl pt-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white/88 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.22em] text-brand-green shadow-[0_18px_50px_rgba(124,197,118,0.16)] backdrop-blur">
            <Sparkles className="h-4 w-4" /> Premium baby care
          </span>
          <h1 className="mt-8 font-display text-[54px] font-extrabold leading-[0.95] tracking-[-0.02em] text-brand-ink sm:text-[78px] lg:text-[94px]">
            Pure Love. <span className="text-brand-blue">Gentle</span> <span className="text-brand-green">Care.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">
            Safe, dermatologist-tested baby essentials crafted with love for your little one.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button to="/category" className="rounded-full px-8 py-4 text-base shadow-[0_22px_55px_rgba(74,166,217,0.22)]">
              Shop Now <ArrowRight className="h-5 w-5" />
            </Button>
            <Button to="/category" variant="outline" className="rounded-full border-brand-green/40 px-8 py-4 text-base">
              Explore Collection
            </Button>
          </div>
          <div className="mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['10k+', 'Happy Parents'],
              ['97%', 'Natural Care'],
              ['4.9', 'Rating Score'],
              ['24/7', 'Parent Support'],
            ].map(([value, label]) => (
              <motion.div key={label} variants={fadeUp} className="rounded-3xl border border-sky-100 bg-white/76 p-5 text-center shadow-[0_20px_60px_rgba(74,166,217,0.12)] backdrop-blur">
                <p className="font-display text-3xl font-extrabold text-brand-blue">{value}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
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
            <Link to={`/category?search=${encodeURIComponent(title)}`} className={`group block rounded-[2rem] border border-sky-100 bg-gradient-to-br ${color} p-5 text-center shadow-[0_18px_60px_rgba(74,166,217,0.10)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_28px_80px_rgba(74,166,217,0.18)]`}>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-brand-blue shadow-[0_15px_40px_rgba(74,166,217,0.12)] transition group-hover:scale-110 group-hover:text-brand-green">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-base font-extrabold text-brand-ink">{title}</h3>
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
        <motion.div variants={stagger} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => <PremiumProductCard key={product.name} product={product} />)}
        </motion.div>
      </div>
    </MotionSection>
  )
}

function PremiumProductCard({ product, large = false }) {
  return (
    <motion.article variants={fadeUp} className={`group rounded-[2rem] border border-sky-100 bg-white p-4 shadow-[0_24px_75px_rgba(74,166,217,0.12)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_34px_100px_rgba(74,166,217,0.20)] ${large ? 'lg:grid lg:grid-cols-[0.95fr_1fr] lg:items-center lg:p-6' : ''}`}>
      <Link to="/category" className={`relative block overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-sky-50 to-green-50 ${large ? 'h-80' : 'h-64'}`}>
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-4 py-2 text-xs font-extrabold text-brand-green shadow-[0_12px_30px_rgba(124,197,118,0.18)]">{product.badge}</span>
        <button type="button" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/92 text-brand-green shadow-[0_12px_30px_rgba(124,197,118,0.18)] transition hover:scale-110" aria-label="Wishlist">
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
          <Link to="/category" className="rounded-full bg-brand-blue px-4 py-3 text-center text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(74,166,217,0.22)] transition hover:-translate-y-0.5">
            Add to Cart
          </Link>
          <Link to="/category" className="rounded-full border border-green-100 bg-brand-leaf px-4 py-3 text-center text-sm font-extrabold text-brand-green transition hover:-translate-y-0.5">
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
          <motion.div key={title} variants={fadeUp} className="rounded-[2rem] border border-sky-100 bg-white p-7 shadow-[0_22px_70px_rgba(74,166,217,0.10)] transition hover:-translate-y-2 hover:shadow-[0_32px_95px_rgba(124,197,118,0.16)]">
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
    <MotionSection className="bg-brand-mist py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="Best sellers" title="Loved in daily routines" copy="Large, premium product stories for parent-loved essentials." />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featuredProducts.slice(0, 2).map((product) => <PremiumProductCard key={product.name} product={product} large />)}
        </div>
      </div>
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
          {testimonials.map((item) => (
            <motion.div key={item.name} variants={fadeUp} className="rounded-[2rem] border border-sky-100 bg-white p-7 shadow-[0_22px_70px_rgba(74,166,217,0.10)]">
              <MessageCircleHeart className="h-8 w-8 text-brand-green" />
              <div className="mt-5 flex gap-1 text-yellow-400">{Array.from({ length: item.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-5 text-sm font-medium leading-7 text-slate-600">"{item.text}"</p>
              <p className="mt-5 font-display text-lg font-extrabold text-brand-ink">{item.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MotionSection>
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
