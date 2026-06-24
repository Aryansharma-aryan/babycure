import { Baby, ChevronRight, Droplets, FlaskConical, Heart, Leaf, ShieldCheck, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import aboutHero from '../assets/about-mother-baby-care.png'
import aboutProducts from '../assets/about-products-promise.png'

const whyCards = [
  [Leaf, 'Gentle Care', 'Made for delicate baby skin.'],
  [ShieldCheck, 'Parent Trusted', 'Designed with care for everyday use.'],
  [Droplets, 'Safe & Mild', 'Focused on comfort, softness, and protection.'],
  [Sprout, 'Inspired by Nature', 'Our brand believes in pure and gentle care.'],
]

const trustBadges = [
  [Leaf, 'Gentle & Safe', 'for Newborns'],
  [FlaskConical, 'Dermatologically', 'Tested'],
  [Sprout, 'No Harmful', 'Chemicals'],
  [Baby, 'Baby Care', 'Focused'],
]

export default function AboutPage() {
  return (
    <section className="about-page overflow-hidden bg-[#fffefa] text-brand-ink">
      <Hero />
      <Mission />
      <WhyBabyCure />
      <Promise />
      <TrustStrip />
    </section>
  )
}

function Hero() {
  return (
    <div className="about-hero relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-12 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:pb-20 lg:pt-16">
      <LeafSketch className="-left-16 bottom-8 h-52 w-52 rotate-12 opacity-20" />
      <div className="relative z-10 max-w-[560px]">
        <p className="about-kicker">About Baby Cure</p>
        <h1 className="about-title mt-4">
          Gentle by <span>Nature,</span><br />
          Pure by <span>Care</span>
        </h1>
        <div className="mt-7 space-y-5 text-[15px] leading-8 text-slate-700 sm:text-base">
          <p>
            Baby Cure is a gentle baby care brand made for parents who want safe, soft, and caring products for their little ones. We believe every baby deserves products that are mild, skin-friendly, and made with love.
          </p>
          <p>
            Our products are thoughtfully designed for daily baby care needs, keeping your baby&apos;s delicate skin clean, soft, and protected.
          </p>
        </div>
        <Link to="/category" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#74a82f] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_38px_rgba(116,168,47,0.28)] transition hover:-translate-y-0.5 hover:bg-[#689b27]">
          Discover Our Products <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative min-h-[430px] lg:min-h-[640px]">
        <div className="about-blob-bg absolute inset-4 bg-[#eef5e1]" />
        <div className="about-hero-photo absolute inset-0 overflow-hidden">
          <img
            src={aboutHero}
            alt="Mother holding baby beside Baby Cure shampoo bottles"
            className="h-full w-full object-cover object-[67%_center]"
          />
        </div>
        <div className="absolute bottom-20 left-8 hidden text-[#8eac55]/45 md:block">
          <Leaf className="h-16 w-16 -rotate-45" />
          <Leaf className="ml-14 -mt-2 h-12 w-12 rotate-12" />
          <Leaf className="ml-4 mt-1 h-11 w-11 rotate-[38deg]" />
        </div>
      </div>
    </div>
  )
}

function Mission() {
  return (
    <section className="about-wave relative px-5 py-20 text-center">
      <LeafSketch className="left-5 top-12 h-44 w-44 opacity-25" />
      <LeafSketch className="bottom-10 right-5 h-44 w-44 -rotate-45 opacity-25" />
      <SectionKicker>Our Mission</SectionKicker>
      <p className="mx-auto mt-6 max-w-3xl font-serif text-2xl font-normal leading-10 text-brand-ink sm:text-3xl">
        To provide gentle, trusted, and high-quality baby care products that make parenting easier and safer.
      </p>
    </section>
  )
}

function WhyBabyCure() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 text-center lg:py-20">
      <h2 className="about-section-title">Why Baby Cure?</h2>
      <HeartDivider />
      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {whyCards.map(([Icon, title, copy]) => (
          <article key={title} className="rounded-[10px] border border-[#e4eadb] bg-white px-6 py-8 shadow-[0_18px_42px_rgba(23,50,77,0.055)]">
            <span className="mx-auto grid h-[82px] w-[82px] place-items-center rounded-full bg-[#eef6e2] text-[#7da63b]">
              <Icon className="h-10 w-10 stroke-[1.6]" />
            </span>
            <h3 className="mt-5 font-serif text-[21px] font-normal text-brand-ink">{title}</h3>
            <p className="mx-auto mt-3 max-w-[170px] text-sm font-normal leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Promise() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-3 lg:grid-cols-[1fr_1fr] lg:px-8 lg:pb-20">
      <div className="about-product-oval overflow-hidden bg-[#eef5e8] shadow-[0_22px_60px_rgba(23,50,77,0.07)]">
        <img src={aboutProducts} alt="Baby Cure shampoo products with soft towel and leaves" className="h-[360px] w-full object-cover object-center sm:h-[430px]" />
      </div>
      <div className="mx-auto max-w-[560px] text-center lg:text-left">
        <SectionKicker align="left">Our Promise</SectionKicker>
        <p className="mt-6 text-[15px] font-normal leading-8 text-slate-700 sm:text-base">
          At Baby Cure, we promise to bring products that help parents care for their babies with confidence, comfort, and love.
        </p>
        <div className="mt-8 flex items-center gap-5 rounded-[14px] bg-white/90 p-5 shadow-[0_18px_46px_rgba(23,50,77,0.06)]">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#eef6e2] text-[#7da63b]">
            <Heart className="h-8 w-8 stroke-[1.6]" />
          </span>
          <p className="text-left font-serif text-2xl font-normal leading-9 text-brand-ink sm:text-3xl">
            Because every precious moment deserves gentle care.
          </p>
        </div>
      </div>
    </section>
  )
}

function TrustStrip() {
  return (
    <section className="bg-[#f3f7eb] px-5 py-11">
      <div className="mx-auto grid max-w-5xl gap-7 text-center sm:grid-cols-2 lg:grid-cols-4">
        {trustBadges.map(([Icon, top, bottom]) => (
          <div key={`${top}-${bottom}`}>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-[#7da63b] shadow-[0_14px_34px_rgba(23,50,77,0.05)]">
              <Icon className="h-8 w-8 stroke-[1.6]" />
            </span>
            <p className="mt-4 text-sm font-normal leading-6 text-brand-ink">
              {top}<br />{bottom}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionKicker({ children, align = 'center' }) {
  return (
    <div className={align === 'left' ? 'text-center lg:text-left' : 'text-center'}>
      <p className="about-kicker">{children}</p>
      <div className={`mt-3 flex items-center justify-center gap-2 ${align === 'left' ? 'lg:justify-start' : ''}`}>
        <span className="h-px w-16 bg-[#9db569]/45" />
        <Heart className="h-3.5 w-3.5 fill-[#7da63b] text-[#7da63b]" />
        <span className="h-px w-16 bg-[#9db569]/45" />
      </div>
    </div>
  )
}

function HeartDivider() {
  return (
    <div className="mt-2 flex items-center justify-center gap-2">
      <span className="h-px w-16 bg-[#9db569]/45" />
      <Heart className="h-3.5 w-3.5 fill-[#7da63b] text-[#7da63b]" />
      <span className="h-px w-16 bg-[#9db569]/45" />
    </div>
  )
}

function LeafSketch({ className }) {
  return (
    <div className={`pointer-events-none absolute text-[#90a95e] ${className}`}>
      <Leaf className="h-full w-full stroke-[1.1]" />
    </div>
  )
}
