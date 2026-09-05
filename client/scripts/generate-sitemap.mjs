import { readFile, writeFile } from 'node:fs/promises'

const siteUrl = 'https://www.babycureindia.com'
const apiUrl = process.env.VITE_API_BASE_URL || process.env.VITE_API_URL || 'https://babycure.onrender.com/api'
const outputFile = new URL('../public/sitemap.xml', import.meta.url)
const today = new Date().toISOString().slice(0, 10)

const staticPages = [
  ['/', 'weekly', '1.0'],
  ['/category', 'daily', '0.9'],
  ['/about', 'monthly', '0.7'],
  ['/why-baby-cure', 'monthly', '0.8'],
  ['/contact', 'monthly', '0.7'],
  ['/blog', 'weekly', '0.6'],
  ['/faqs', 'monthly', '0.6'],
  ['/shipping-policy', 'yearly', '0.3'],
  ['/return-refund-policy', 'yearly', '0.3'],
  ['/privacy-policy', 'yearly', '0.2'],
]

const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
})[character])

async function getProducts() {
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/products?limit=50&sort=-updatedAt`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    return payload.products || []
  } catch (error) {
    console.warn(`Sitemap: live products unavailable (${error.message}); writing static URLs only.`)
    return null
  }
}

const products = await getProducts()
let productEntries = []
if (products) {
  productEntries = products.filter((product) => product.slug || product._id).map((product) => ({
    loc: `${siteUrl}/product/${encodeURIComponent(product.slug || product._id)}`,
    lastmod: String(product.updatedAt || today).slice(0, 10),
    changefreq: 'weekly',
    priority: '0.8',
  }))
} else {
  try {
    const existing = await readFile(outputFile, 'utf8')
    productEntries = [...existing.matchAll(/<url><loc>(https:\/\/www\.babycureindia\.com\/product\/[^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><changefreq>([^<]+)<\/changefreq><priority>([^<]+)<\/priority><\/url>/g)]
      .map((match) => ({ loc: match[1], lastmod: match[2], changefreq: match[3], priority: match[4] }))
    console.warn(`Sitemap: preserved ${productEntries.length} existing product URLs.`)
  } catch { /* Static pages still produce a valid sitemap on a first build. */ }
}
const urls = [
  ...staticPages.map(([path, changefreq, priority]) => ({ loc: `${siteUrl}${path}`, lastmod: today, changefreq, priority })),
  ...productEntries,
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, lastmod, changefreq, priority }) => `  <url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('\n')}
</urlset>
`

await writeFile(outputFile, xml, 'utf8')
console.log(`Sitemap: wrote ${urls.length} URLs (${productEntries.length} products).`)
