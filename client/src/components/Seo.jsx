import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://www.babycureindia.com'
const DEFAULT_IMAGE = `${SITE_URL}/web-app-manifest-512x512.png`
const DEFAULT_DESCRIPTION = 'Shop gentle baby care products from Baby Cure, Kurukshetra. Explore baby shampoo, body wash, lotion, massage oil, diaper rash cream and care combos with delivery across India.'
const DEFAULT_KEYWORDS = 'baby care products, baby products online India, baby care shop Kurukshetra, baby shampoo, baby body wash, baby lotion, baby massage oil, diaper rash cream, newborn baby products, natural baby care, Baby Cure India, baby products Haryana'

const routeSeo = {
  '/': ['Baby Care Products in India | Baby Cure Kurukshetra', DEFAULT_DESCRIPTION],
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

const noIndexPaths = ['/admin', '/account', '/cart', '/checkout', '/login', '/orders', '/wishlist']

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}

export default function Seo({ title, description, image, type = 'website', robots, jsonLd }) {
  const { pathname } = useLocation()
  const [routeTitle, routeDescription] = routeSeo[pathname] || ['Baby Cure | Gentle Baby Care Products India', DEFAULT_DESCRIPTION]
  const canonicalPath = pathname === '/' ? '' : pathname.replace(/\/$/, '')
  const canonical = `${SITE_URL}${canonicalPath}`
  const shouldNoIndex = noIndexPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  useEffect(() => {
    const finalTitle = title || routeTitle
    const finalDescription = description || routeDescription
    const finalImage = image || DEFAULT_IMAGE
    document.title = finalTitle

    setMeta('meta[name="description"]', { name: 'description', content: finalDescription })
    setMeta('meta[name="keywords"]', { name: 'keywords', content: DEFAULT_KEYWORDS })
    setMeta('meta[name="robots"]', { name: 'robots', content: robots || (shouldNoIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1') })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: finalTitle })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: finalDescription })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: finalImage })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: finalTitle })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: finalDescription })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: finalImage })

    let canonicalLink = document.head.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.href = canonical

    document.head.querySelectorAll('script[data-babycure-seo]').forEach((node) => node.remove())
    const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : getDefaultSchemas(pathname)
    schemas.forEach((schema) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.babycureSeo = 'true'
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    })
  }, [description, image, jsonLd, pathname, robots, routeDescription, routeTitle, shouldNoIndex, title, type, canonical])

  return null
}

function getDefaultSchemas(pathname) {
  if (pathname !== '/' && pathname !== '/contact') return []
  const organization = {
    '@context': 'https://schema.org',
    '@type': ['Store', 'OnlineStore'],
    '@id': `${SITE_URL}/#organization`,
    name: 'Baby Cure',
    alternateName: 'BabyCure India',
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
    email: 'info@babycureindia.com',
    telephone: '+91-8607201606',
    sameAs: ['https://www.instagram.com/babycureindia'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1277, Sector 5',
      addressLocality: 'Kurukshetra',
      addressRegion: 'Haryana',
      postalCode: '136118',
      addressCountry: 'IN',
    },
    areaServed: ['Kurukshetra', 'Thanesar', 'Haryana', 'India'],
  }
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Baby Cure India',
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/category?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return [organization, website]
}
