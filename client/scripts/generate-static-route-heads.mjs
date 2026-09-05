import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteUrl = 'https://www.babycureindia.com'
const apiUrl = process.env.VITE_API_BASE_URL || process.env.VITE_API_URL || 'https://babycure.onrender.com/api'
const distPath = fileURLToPath(new URL('../dist/', import.meta.url))
const template = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')

const routes = {
  '/category': ['Shop Baby Care Products Online | Baby Cure India', 'Browse gentle baby shampoo, body wash, lotion, massage oil, diaper rash cream and baby care combos from Baby Cure.'],
  '/about': ['About Baby Cure | Gentle Baby Care from Kurukshetra', 'Meet Baby Cure, a Kurukshetra baby care brand creating thoughtful, gentle everyday care products for babies and families.'],
  '/why-baby-cure': ['Why Choose Baby Cure | Gentle, Parent-Trusted Baby Care', 'Discover Baby Cure’s approach to gentle baby care, thoughtful products, reliable delivery and direct customer support.'],
  '/contact': ['Contact Baby Cure Kurukshetra | Baby Care Support', 'Contact Baby Cure at Sector 5, Kurukshetra for baby product guidance, order help and customer support.'],
  '/blog': ['Baby Care Tips & Guides | Baby Cure India', 'Read practical baby care tips, product guidance and gentle everyday care ideas from Baby Cure India.'],
  '/faqs': ['Baby Care Shopping FAQs | Baby Cure India', 'Find answers about Baby Cure products, ordering, payment, delivery, returns and customer support.'],
  '/shipping-policy': ['Shipping Policy | Baby Cure India', 'Read Baby Cure shipping, delivery charge and order dispatch information for customers across India.'],
  '/return-refund-policy': ['Return & Refund Policy | Baby Cure India', 'Read Baby Cure return, replacement and refund terms for online baby care purchases.'],
  '/privacy-policy': ['Privacy Policy | Baby Cure India', 'Learn how Baby Cure collects, uses and protects customer information.'],
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const plainText = (value) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const jsonForHtml = (value) => JSON.stringify(value).replaceAll('<', '\\u003c')

function resolveMediaUrl(value) {
  if (!value || /^https?:\/\//i.test(value)) return value || ''
  const origin = apiUrl.replace(/\/api\/?$/, '')
  const normalized = String(value).replace(/\\/g, '/')
  const uploadIndex = normalized.indexOf('/uploads/')
  return `${origin}${uploadIndex >= 0 ? normalized.slice(uploadIndex) : `/${normalized.replace(/^\//, '')}`}`
}

function replaceHead(html, { title, description, canonical, image, type = 'website', schema }) {
  const values = { title: escapeHtml(title), description: escapeHtml(description), canonical: escapeHtml(canonical), image: escapeHtml(image || `${siteUrl}/web-app-manifest-512x512.png`) }
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${values.title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${values.description}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${values.canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${values.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${values.description}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${values.canonical}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${values.image}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${values.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${values.description}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${values.image}" />`)
    .replace('</head>', `    <script type="application/ld+json" data-static-route-seo="true">${jsonForHtml(schema)}</script>\n  </head>`)
}

async function writeRoute(path, html) {
  const output = join(distPath, path.replace(/^\//, ''), 'index.html')
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html, 'utf8')
}

async function getProducts() {
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/products?limit=50&sort=-updatedAt`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()).products || []
  } catch (error) {
    console.warn(`Static SEO: products unavailable (${error.message}); product pages were not generated.`)
    return []
  }
}

const products = await getProducts()
const productLinks = products.filter((product) => product.slug || product._id).map((product) => `<li><a href="/product/${encodeURIComponent(product.slug || product._id)}">${escapeHtml(product.name)}</a></li>`).join('')

for (const [path, [title, description]] of Object.entries(routes)) {
  const canonical = `${siteUrl}${path}`
  const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: title.split('|')[0].trim(), item: canonical },
  ] }
  let html = replaceHead(template, { title, description, canonical, schema })
  if (path === '/category' && productLinks) html = html.replace('<div id="root"></div>', `<div id="root"><main data-static-seo-content><h1>Shop Baby Care Products</h1><p>${escapeHtml(description)}</p><ul>${productLinks}</ul></main></div>`)
  await writeRoute(path, html)
}

for (const product of products) {
  const identifier = product.slug || product._id
  if (!identifier) continue
  const path = `/product/${encodeURIComponent(identifier)}`
  const canonical = `${siteUrl}${path}`
  const description = plainText(product.shortDescription || product.description || `Buy ${product.name} online from Baby Cure India.`).slice(0, 160)
  const images = (product.images || []).map((item) => resolveMediaUrl(item.url)).filter(Boolean)
  const schema = [{
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${canonical}#product`, name: product.name, description, image: images, sku: product.sku, url: canonical, category: product.category?.name,
    brand: { '@type': 'Brand', name: product.brand || 'Baby Cure' },
    offers: { '@type': 'Offer', url: canonical, priceCurrency: 'INR', price: product.price, availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'Baby Cure India' } },
    ...(product.ratingsQuantity > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.ratingsAverage, reviewCount: product.ratingsQuantity } } : {}),
  }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'Baby Care Products', item: `${siteUrl}/category` },
    { '@type': 'ListItem', position: 3, name: product.name, item: canonical },
  ] }]
  const title = `${product.name} | Buy Online at Baby Cure India`
  let html = replaceHead(template, { title, description, canonical, image: images[0], type: 'product', schema })
  const image = images[0] ? `<img src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" width="600" height="600" />` : ''
  html = html.replace('<div id="root"></div>', `<div id="root"><main data-static-seo-content><nav><a href="/">Home</a> / <a href="/category">Baby Care Products</a></nav><article>${image}<h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(description)}</p><p>₹${escapeHtml(product.price)} · ${product.stock > 0 ? 'In stock' : 'Out of stock'}</p><div>${escapeHtml(plainText(product.description || product.shortDescription))}</div><p><a href="/category">View all Baby Cure products</a></p></article></main></div>`)
  await writeRoute(path, html)
}

console.log(`Static SEO: wrote ${Object.keys(routes).length} public routes and ${products.length} product routes.`)
