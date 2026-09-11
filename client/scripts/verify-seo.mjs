import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fetchCatalog, readCatalog, siteUrl } from './seo-catalog.mjs'

// Exercise pagination beyond the API's 50-product limit and incomplete responses.
let requests = 0
const catalog = await fetchCatalog(async () => {
  requests += 1
  return { ok: true, json: async () => ({ pages: 2, total: 2, products: [{ _id: String(requests), name: 'Baby shampoo' }] }) }
})
assert.equal(requests, 2)
assert.equal(catalog.length, 2)
await assert.rejects(() => fetchCatalog(async () => ({ ok: false, status: 503 })), /HTTP 503/)
await assert.rejects(() => fetchCatalog(async () => ({ ok: true, json: async () => ({ products: [], total: 1, pages: 1 }) })), /changed during pagination/)

const products = await readCatalog()
const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
assert.equal(urls.length, new Set(urls).size, 'Duplicate sitemap URLs')
for (const url of urls) {
  const path = new URL(url).pathname
  const html = await readFile(new URL(`../dist${path === '/' ? '' : path}/index.html`, import.meta.url), 'utf8')
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `Incorrect canonical: ${url}`)
  assert.ok(!html.includes('content="noindex'), `Indexable page marked noindex: ${url}`)
  const scripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  assert.equal(scripts.length, 1, `Duplicate or missing schema: ${url}`)
  JSON.parse(scripts[0][1])
}
const directory = await readFile(new URL('../dist/products/index.html', import.meta.url), 'utf8')
for (const product of products) {
  const path = `/product/${encodeURIComponent(product.slug || product._id)}`
  assert.ok(urls.includes(`${siteUrl}${path}`))
  assert.ok(directory.includes(`href="${path}"`), `Directory link missing: ${path}`)
  const html = await readFile(new URL(`../dist${path}/index.html`, import.meta.url), 'utf8')
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])[0]
  assert.equal(schema['@type'], 'Product')
  assert.equal(schema.name, product.name)
  assert.equal(schema.offers.price, product.price)
  assert.ok(html.includes('<h1>'), `Missing visible product heading: ${path}`)
}
console.log(`SEO checks passed: ${urls.length} canonical pages, ${products.length} products, directory links, JSON-LD, pagination and API failure handling.`)
