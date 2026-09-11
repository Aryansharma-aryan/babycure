import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../api/services'

export default function ProductDirectoryPage() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('Loading products…')
  useEffect(() => {
    let active = true
    async function load() {
      const catalog = []
      let pages = 1
      for (let page = 1; page <= pages; page += 1) {
        const response = await productService.list({ page, limit: 50, sort: '_id' })
        if (!active) return
        catalog.push(...response.products)
        pages = response.pages
      }
      setProducts(catalog)
      setStatus('')
    }
    load().catch(() => active && setStatus('Products could not be loaded. Please refresh or visit the shop.'))
    return () => { active = false }
  }, [])

  const groups = new Map()
  for (const product of products) {
    const category = product.category?.name || 'Baby Care'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(product)
  }
  return <section className="mx-auto max-w-7xl px-4 py-10 text-brand-ink">
    <nav aria-label="Breadcrumb" className="mb-5 text-sm"><Link to="/">Home</Link> / All products</nav>
    <h1 className="font-display text-3xl font-black">All BabyCure baby care products</h1>
    <p className="mt-4 max-w-3xl leading-7">Explore BabyCure baby shampoo, body wash, lotion, massage oil, diaper rash cream and baby care combos. Choose a product to see its price, ingredients, sizes and directions for use.</p>
    <p className="mt-3"><Link to="/category" className="font-bold text-brand-blue underline">Shop BabyCure products with filters</Link></p>
    {status && <p role="status" className="mt-6">{status}</p>}
    <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{[...groups].map(([category, items]) => <section key={category} className="rounded-xl border border-sky-100 p-5">
      <h2 className="text-xl font-bold">{category}</h2>
      <ul className="mt-4 space-y-3">{items.map((product) => <li key={product._id}><Link className="text-brand-blue underline underline-offset-4" to={`/product/${encodeURIComponent(product.slug || product._id)}`}>{product.name}</Link></li>)}</ul>
    </section>)}</div>
  </section>
}
