import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteUrl = 'https://www.babycureindia.com'
const distDir = new URL('../dist/', import.meta.url)
const distPath = fileURLToPath(distDir)
const template = await readFile(new URL('index.html', distDir), 'utf8')

const routes = {
  '/category': {
    title: 'Shop Baby Care Products Online | Baby Cure India',
    description: 'Browse gentle baby shampoo, body wash, lotion, massage oil, diaper rash cream and baby care combos from Baby Cure.',
  },
  '/about': {
    title: 'About Baby Cure | Gentle Baby Care from Kurukshetra',
    description: 'Meet Baby Cure, a Kurukshetra baby care brand creating thoughtful, gentle everyday care products for babies and families.',
  },
  '/why-baby-cure': {
    title: 'Why Choose Baby Cure | Gentle, Parent-Trusted Baby Care',
    description: 'Discover Baby Cure’s approach to gentle baby care, thoughtful products, reliable delivery and direct customer support.',
  },
  '/contact': {
    title: 'Contact Baby Cure Kurukshetra | Baby Care Support',
    description: 'Contact Baby Cure at Sector 5, Kurukshetra for baby product guidance, order help and customer support.',
  },
  '/blog': {
    title: 'Baby Care Tips & Guides | Baby Cure India',
    description: 'Read practical baby care tips, product guidance and gentle everyday care ideas from Baby Cure India.',
  },
  '/faqs': {
    title: 'Baby Care Shopping FAQs | Baby Cure India',
    description: 'Find answers about Baby Cure products, ordering, payment, delivery, returns and customer support.',
  },
  '/shipping-policy': {
    title: 'Shipping Policy | Baby Cure India',
    description: 'Read Baby Cure shipping, delivery charge and order dispatch information for customers across India.',
  },
  '/return-refund-policy': {
    title: 'Return & Refund Policy | Baby Cure India',
    description: 'Read Baby Cure return, replacement and refund terms for online baby care purchases.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Baby Cure India',
    description: 'Learn how Baby Cure collects, uses and protects customer information.',
  },
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character])

for (const [path, seo] of Object.entries(routes)) {
  const canonical = `${siteUrl}${path}`
  const title = escapeHtml(seo.title)
  const description = escapeHtml(seo.description)
  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: seo.title.split('|')[0].trim(), item: canonical },
    ],
  }).replaceAll('<', '\\u003c')

  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`)
    .replace('</head>', `    <script type="application/ld+json" data-static-route-seo="true">${breadcrumb}</script>\n  </head>`)

  const output = join(distPath, path.slice(1), 'index.html')
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html, 'utf8')
}

console.log(`Static SEO: wrote route-specific HTML for ${Object.keys(routes).length} public routes.`)
