import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

const env = { ...loadEnv('production', fileURLToPath(new URL('../', import.meta.url)), ''), ...process.env }
export const siteUrl = 'https://www.babycureindia.com'
const configuredApi = env.SEO_API_URL || env.VITE_API_BASE_URL || env.VITE_API_URL
export const apiUrl = configuredApi?.startsWith('http') ? configuredApi : 'https://babycure.onrender.com/api'
const snapshot = new URL('../.seo/catalog.json', import.meta.url)

export async function fetchCatalog(fetcher = fetch) {
  const products = new Map()
  let pages = 1
  for (let page = 1; page <= pages; page += 1) {
    const response = await fetcher(`${apiUrl.replace(/\/$/, '')}/products?limit=50&sort=_id&page=${page}`, {
      headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(60000),
    })
    if (!response.ok) throw new Error(`SEO catalog: HTTP ${response.status}; retry the build when the API is available.`)
    const payload = await response.json()
    if (!Array.isArray(payload.products) || !Number.isInteger(payload.pages) || payload.pages < 0) throw new Error('SEO catalog: invalid pagination response')
    pages = payload.pages
    for (const product of payload.products) {
      if (!product._id || !product.name || !(product.slug || product._id)) throw new Error('SEO catalog: invalid product')
      products.set(product._id, product)
    }
    if (page >= pages && products.size !== payload.total) throw new Error('SEO catalog changed during pagination; retry the build')
  }
  if (!products.size) throw new Error('SEO catalog is empty; refusing to publish a build without products')
  return [...products.values()]
}

export async function saveCatalog(products) {
  await mkdir(new URL('../.seo/', import.meta.url), { recursive: true })
  await writeFile(snapshot, JSON.stringify(products))
}

export async function readCatalog() {
  return JSON.parse(await readFile(snapshot, 'utf8'))
}
