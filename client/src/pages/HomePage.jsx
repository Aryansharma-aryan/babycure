import { Heart, Leaf, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import Button from '../components/Button'
import CategoryCard from '../components/CategoryCard'
import FeatureCard from '../components/FeatureCard'
import ProductArt from '../components/ProductArt'
import ProductCard from '../components/ProductCard'
import { categories, images, products } from '../data/products'
import heroImage from '../assets/heroo.png'

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid min-h-[620px] overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_32px_110px_rgba(7,87,168,0.13)] lg:grid-cols-[0.98fr_1.02fr]">
          <div className="relative flex flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_14%_20%,rgba(8,160,75,0.13),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(7,87,168,0.09),transparent_32%),linear-gradient(135deg,#ffffff,#f6fbff)] p-7 md:p-12">
            <div className="absolute -left-12 top-10 h-48 w-48 rounded-full border border-green-100/80" />
            <div className="absolute bottom-10 right-8 hidden h-28 w-28 rounded-full bg-blue-50/80 lg:block" />
            <p className="relative mb-5 inline-flex w-max items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-brand-green ring-1 ring-green-100 shadow-[0_10px_30px_rgba(8,160,75,0.08)]">
              <Leaf className="h-4 w-4" /> Natural and safe
            </p>
            <h1 className="relative max-w-2xl font-display text-5xl font-black leading-[1.04] text-brand-blue md:text-6xl xl:text-7xl">
              Gentle baby care, <span className="text-brand-green">pure daily protection</span>
            </h1>
            <p className="relative mt-6 max-w-xl text-lg font-semibold leading-8 text-slate-600 md:text-xl">
              Thoughtfully made bath, skin and diapering essentials for delicate baby skin and confident parents.
            </p>
            <div className="relative mt-8 flex flex-wrap gap-4">
              <Button to="/category">Shop Baby Care</Button>
              <Button to={`/product/${products[0].id}`} variant="outline">Explore Best Seller</Button>
            </div>
            <div className="relative mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                ['96%', 'Parent loved'],
                ['0%', 'Harsh sulphates'],
                ['24/7', 'Care support'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-blue-100 bg-white/90 px-4 py-3 shadow-[0_16px_40px_rgba(7,87,168,0.08)] backdrop-blur">
                  <p className="font-display text-2xl font-black text-brand-blue">{value}</p>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative grid min-h-[500px] place-items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_40%,rgba(8,160,75,0.22),transparent_28%),radial-gradient(circle_at_58%_64%,rgba(7,87,168,0.20),transparent_38%)]" />
            <div className="absolute left-10 top-10 h-28 w-28 rounded-full border border-green-100 bg-white/40" />
            <div className="absolute bottom-10 right-10 h-36 w-36 rounded-full border border-blue-100 bg-white/50" />
            <img
              src={heroImage}
              alt="Babycure premium hero"
              className="relative z-10 h-[82%] max-h-[520px] w-[92%] max-w-[680px] object-contain drop-shadow-[0_44px_80px_rgba(7,87,168,0.26)]"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-4 md:grid-cols-4">
        <FeatureCard icon={Truck} title="Free Shipping" copy="On orders above Rs.999" />
        <FeatureCard icon={PackageCheck} title="Easy Returns" copy="7 day return policy" />
        <FeatureCard icon={ShieldCheck} title="Secure Checkout" copy="Protected payments" />
        <FeatureCard icon={Heart} title="Parent Support" copy="Care team assistance" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionTitle title="Best Selling Babycare" action="View all products" to="/category" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionTitle title="Shop by Category" action="View all categories" to="/category" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid overflow-hidden rounded-md border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-green-50 p-8 shadow-soft lg:grid-cols-[0.9fr_1fr]">
          <div>
            <p className="font-black text-brand-green">Limited Care Box</p>
            <h2 className="mt-3 font-display text-5xl font-black text-brand-blue">Flat 20% OFF</h2>
            <p className="mt-3 font-semibold text-slate-600">On complete newborn bath and skin care bundles.</p>
            <Button to="/category" className="mt-7">Shop Now</Button>
          </div>
          <div className="relative mt-8 flex items-end justify-center gap-3 lg:mt-0">
            <span className="absolute right-6 top-0 grid h-20 w-20 place-items-center rounded-full bg-brand-blue text-center text-lg font-black leading-tight text-white">20%<br />OFF</span>
            {products.slice(0, 3).map((product) => <ProductArt key={product.id} type={product.type} color={product.color} />)}
          </div>
        </div>
        <div className="grid items-center gap-6 overflow-hidden rounded-md border border-slate-200 bg-white p-8 shadow-soft md:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="font-display text-3xl font-black text-brand-blue">Why parents choose Babycure</h2>
            {['Natural and safe ingredients', 'Dermatologically tested formulas', 'Trusted daily baby care', 'Designed for newborn comfort'].map((item) => (
              <p key={item} className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                <ShieldCheck className="h-5 w-5 text-brand-green" /> {item}
              </p>
            ))}
          </div>
          <img src={images.soft} alt="Mother with baby" className="h-64 w-full rounded-md object-cover" loading="lazy" />
        </div>
      </section>

    </>
  )
}

function SectionTitle({ title, action, to }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 className="font-display text-3xl font-black text-slate-950">{title}</h2>
      <Button to={to} variant="ghost" className="px-4 py-2">{action}</Button>
    </div>
  )
}
