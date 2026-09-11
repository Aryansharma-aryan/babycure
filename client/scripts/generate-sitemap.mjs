import { writeFile } from 'node:fs/promises'

import { siteUrl, apiUrl, fetchCatalog, saveCatalog } from './seo-catalog.mjs'
const outputFile = new URL('../public/sitemap.xml', import.meta.url)

const staticPages = [
  ['/', 'weekly', '1.0'],
  ['/products', 'weekly', '0.9'],
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

const products = await fetchCatalog()
await saveCatalog(products)
const productEntries = products.map((product) => ({
  loc: siteUrl + '/product/' + encodeURIComponent(product.slug || product._id),
  lastmod: product.updatedAt && !Number.isNaN(Date.parse(product.updatedAt)) ? new Date(product.updatedAt).toISOString() : undefined,
  images: (product.images || []).map((image) => image.url).filter(Boolean).map((url) => new URL(String(url).replaceAll('\\', '/'), apiUrl.replace(/\/api\/?$/, '') + '/').href),
}))
const urls = [...staticPages.map(([path]) => ({ loc: siteUrl + path })), ...productEntries]
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + urls.map(({loc,lastmod,images=[]}) => '  <url><loc>' + escapeXml(loc) + '</loc>' + (lastmod ? '<lastmod>' + lastmod + '</lastmod>' : '') + images.map(image => '<image:image><image:loc>' + escapeXml(image) + '</image:loc></image:image>').join('') + '</url>').join('\n') + '\n</urlset>\n'
await writeFile(outputFile, xml, 'utf8')
console.log('Sitemap: wrote ' + urls.length + ' URLs (' + products.length + ' products).')
