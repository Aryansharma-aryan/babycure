import { HelpCircle, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const contact = {
  email: 'info@babycureindia.com',
  phone: '+91-8607201606',
}

const policies = {
  '/shipping-policy': {
    eyebrow: 'Shipping',
    title: 'Shipping Policy',
    copy: 'Delivery timelines, charges, tracking and shipping support for Baby Cure orders.',
    icon: Truck,
    sections: [
      {
        title: 'Shipping Coverage',
        body: ['Baby Cure currently ships across most locations in India through our trusted logistics partners.'],
      },
      {
        title: 'Order Processing Time',
        list: [
          'Orders are processed within 1-2 business days after successful payment confirmation.',
          'Orders placed on Sundays or public holidays will be processed on the next working day.',
        ],
      },
      {
        title: 'Delivery Timeline',
        intro: 'Estimated delivery times:',
        list: [
          'Metro Cities: 2-5 business days',
          'Tier 2 & Tier 3 Cities: 3-7 business days',
          'Remote Areas: 5-10 business days',
        ],
        note: 'Delivery timelines may vary due to weather conditions, public holidays, courier delays, or other unforeseen circumstances.',
      },
      {
        title: 'Shipping Charges',
        list: [
          'Shipping charges, if applicable, will be displayed during checkout.',
          'Delivery is free on orders above ₹799. A ₹60 delivery charge applies to orders below ₹799.',
        ],
      },
      {
        title: 'Cash on Delivery',
        list: [
          'Cash on Delivery may be available only on selected serviceable pin codes when enabled by Baby Cure.',
          'Additional COD charges, if applicable, will be shown at checkout.',
        ],
      },
      {
        title: 'Order Tracking',
        intro: 'Once your order is shipped, you will receive:',
        list: [
          'A tracking number',
          'Courier partner details',
          'Tracking link via Email, SMS, or WhatsApp where applicable',
        ],
      },
      {
        title: 'Damaged or Missing Items',
        body: ['If you receive a damaged package, an incorrect product, or missing items, please contact us within 48 hours of delivery with photographs of the package and products.'],
      },
      {
        title: 'Delayed Shipments',
        intro: 'While we strive to deliver orders on time, Baby Cure shall not be held responsible for delays caused by:',
        list: [
          'Natural disasters',
          'Government restrictions',
          'Transportation disruptions',
          'Courier partner issues',
        ],
      },
    ],
  },
  '/return-refund-policy': {
    eyebrow: 'Returns',
    title: 'Return & Refund Policy',
    copy: 'Eligibility, request timelines and refund handling for Baby Cure orders.',
    icon: RotateCcw,
    sections: [
      {
        title: 'Our Commitment',
        body: ['At Baby Cure, we are committed to providing safe and high-quality baby care products. If you are not completely satisfied with your purchase, please review our Return & Refund Policy below.'],
      },
      {
        title: 'Eligibility for Returns',
        body: ['Due to hygiene and safety reasons, baby care products such as shampoos, body washes, lotions, creams, and other personal care items are generally non-returnable once delivered.'],
        intro: 'Returns are accepted only in the following cases:',
        list: [
          'Product received is damaged during transit.',
          'Wrong product delivered.',
          'Product is missing from the order.',
          'Product received is expired or defective.',
        ],
      },
      {
        title: 'Return Request Timeline',
        body: ['Customers must raise a return request within 48 hours of delivery by contacting our customer support team. Please share your order number, clear product photographs, package photographs and a short description of the issue.'],
      },
      {
        title: 'Return Review',
        body: ['Baby Cure will review the request and may ask for additional information if needed. Approved return or replacement requests will be processed as per product condition and eligibility.'],
      },
      {
        title: 'Refunds',
        body: ['Refunds, where applicable, will be processed to the original payment method after the request is approved. Refund timelines may depend on the payment gateway, bank, or wallet provider.'],
      },
      {
        title: 'Non-Returnable Cases',
        list: [
          'Products used, opened, tampered with, or damaged after delivery.',
          'Requests raised after 48 hours of delivery.',
          'Products returned without approval from Baby Cure support.',
          'Hygiene-sensitive baby care products unless damaged, defective, expired, missing, or incorrectly delivered.',
        ],
      },
    ],
  },
  '/faqs': {
    eyebrow: 'Help',
    title: 'Frequently Asked Questions',
    copy: 'Quick answers about Baby Cure products, orders, delivery, payments and support.',
    icon: HelpCircle,
    faqs: [
      ['What is Baby Cure?', 'Baby Cure is a baby care brand offering gentle and safe products designed for babies and young children. Our product range includes baby shampoo, body wash, diaper rash cream, lotion, massage oil, toothpaste, and other baby essentials.'],
      ['Are Baby Cure products safe for babies?', 'Yes. Our products are carefully formulated to be gentle on delicate baby skin and are designed for everyday use.'],
      ['Are Baby Cure products suitable for newborns?', 'Please check the age recommendations mentioned on each product label. Products specifically formulated for newborns can be used from birth unless otherwise stated.'],
      ['Are Baby Cure products safe and tested?', 'Product-specific claims information is mentioned on the product packaging and product pages.'],
      ['Do Baby Cure products contain harmful chemicals?', 'We strive to create baby-friendly formulations. Please refer to the ingredient list on each product page for complete details.'],
      ['How can I place an order?', 'Select your desired products, add them to your bag, proceed to checkout, and complete payment. Cash on Delivery may be available where enabled and serviceable.'],
      ['What payment methods do you accept?', 'We accept UPI, credit cards, debit cards, net banking, wallets and other payment methods supported by our payment gateway.'],
      ['How long does delivery take?', 'Most orders are delivered within 2-5 business days in metro cities and 3-7 business days in other locations. Delivery timelines may vary based on location and courier availability.'],
      ['How can I track my order?', 'Once your order is shipped, you will receive a tracking link and tracking number via email, SMS, or WhatsApp where applicable.'],
      ['Can I cancel my order?', 'Orders can be cancelled before they are dispatched. Once shipped, cancellation may not be possible.'],
      ['What should I do if I receive a damaged product?', 'Please contact us within 48 hours of delivery and share your order number, product photographs and package photographs. Our team will review and assist you promptly.'],
      ['Do you offer returns and refunds?', 'Returns and refunds are available only for eligible cases such as damaged, defective, incorrect, expired, or missing products. Please refer to our Return & Refund Policy for details.'],
      ['Is Cash on Delivery available?', 'COD may be available on selected serviceable pin codes when enabled by Baby Cure. Availability and charges, if any, will be shown at checkout.'],
      ['Can I change my delivery address after placing an order?', 'Address changes may be possible before the order is shipped. Please contact customer support immediately.'],
      ['How can I contact Baby Cure?', `Email us at ${contact.email} or call ${contact.phone}.`],
      ['How should I store Baby Cure products?', 'Store products in a cool, dry place away from direct sunlight and keep them out of reach of children.'],
      ['Do Baby Cure products have an expiry date?', 'Yes. Manufacturing and expiry details are printed on the product packaging.'],
      ['Are Baby Cure products made in India?', 'Yes, Baby Cure products are proudly made in India.'],
    ],
  },
  '/privacy-policy': {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    copy: 'How Baby Cure collects, uses, stores and protects your information.',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Welcome to Baby Cure',
        body: ['We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how Baby Cure collects, uses, stores, and protects your information when you visit our website or purchase our products.'],
      },
      {
        title: 'Information We Collect',
        intro: 'When you use our website, we may collect personal and non-personal information including:',
        list: [
          'Full name, email address and phone number',
          'Shipping address and billing address',
          'Payment information processed securely through third-party payment gateways',
          'IP address, browser type, device information, website usage data, cookies and tracking data',
        ],
      },
      {
        title: 'How We Use Your Information',
        list: [
          'Process and deliver orders',
          'Provide customer support',
          'Send order confirmations and shipping updates',
          'Improve our products and services',
          'Prevent fraud and unauthorized transactions',
          'Respond to customer inquiries',
          'Send promotional communications only where permitted',
        ],
      },
      {
        title: 'Payment Information',
        body: ['Baby Cure does not store your complete credit card, debit card, or banking information. Payments are processed securely through trusted payment service providers.'],
      },
      {
        title: 'Sharing of Information',
        body: ['We do not sell, rent, or trade your personal information. We may share your information with shipping and logistics partners, payment gateway providers, technology and website service providers, and government authorities when legally required. Such parties are authorized to use your information only for providing services on our behalf.'],
      },
      {
        title: 'Cookies',
        body: ['Our website may use cookies to improve functionality, remember user preferences, analyze traffic, and enhance the shopping experience. You may disable cookies through your browser settings; however, some website features may not function properly.'],
      },
      {
        title: 'Data Security',
        body: ['We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. While we strive to protect your information, no internet transmission or electronic storage method is completely secure.'],
      },
      {
        title: 'Marketing Communications',
        body: ['If you subscribe to our newsletters or promotional updates, we may send marketing communications via email, SMS, or WhatsApp. You may opt out at any time by following the unsubscribe instructions or contacting us.'],
      },
      {
        title: 'Third-Party Services',
        body: ['Our website may contain links to third-party websites or services. Baby Cure is not responsible for the privacy practices or content of such third-party platforms.'],
      },
      {
        title: "Children's Privacy",
        body: ['Our website is intended for use by parents, guardians, and adults. We do not knowingly collect personal information directly from children under the age of 18.'],
      },
      {
        title: 'Your Rights',
        body: ['You may request to access your personal information, correct inaccurate information, delete your personal information subject to legal obligations, or withdraw consent for marketing communications. To exercise these rights, please contact us using the details below.'],
      },
    ],
  },
}

export default function PolicyPage() {
  const { pathname } = useLocation()
  const policy = policies[pathname] || policies['/shipping-policy']
  const Icon = policy.icon

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader eyebrow={policy.eyebrow} title={policy.title} copy={policy.copy} backTo="/" backLabel="Back to home" />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {policy.faqs ? (
            policy.faqs.map(([question, answer], index) => (
              <article key={question} className="rounded-md border border-sky-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-brand-blue">Q{index + 1}</p>
                <h2 className="mt-1 font-display text-xl font-black text-brand-ink">{question}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{answer}</p>
              </article>
            ))
          ) : (
            policy.sections.map((section) => <PolicySection key={section.title} section={section} />)
          )}
        </div>
        <aside className="h-max rounded-md border border-sky-100 bg-brand-mist p-5 shadow-sm lg:sticky lg:top-32">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-brand-blue shadow-sm">
            <Icon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-xl font-black text-brand-ink">Need help?</h2>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">For policy or order-related support, contact Baby Cure customer care.</p>
          <div className="mt-4 grid gap-2 text-sm font-bold">
            <a href={`mailto:${contact.email}`} className="rounded-md bg-white px-4 py-3 text-brand-blue">{contact.email}</a>
            <a href={`tel:${contact.phone.replaceAll('-', '')}`} className="rounded-md bg-white px-4 py-3 text-brand-green">{contact.phone}</a>
          </div>
          <Link to="/contact" className="mt-4 inline-flex rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white">Contact Support</Link>
          <p className="mt-5 text-sm font-black text-brand-ink">Baby Cure - Gentle by Nature, Pure by Care.</p>
        </aside>
      </div>
    </section>
  )
}

function PolicySection({ section }) {
  return (
    <article className="rounded-md border border-sky-100 bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-black text-brand-ink">{section.title}</h2>
      {section.body?.map((paragraph) => (
        <p key={paragraph} className="mt-3 text-sm font-semibold leading-7 text-slate-600">{paragraph}</p>
      ))}
      {section.intro && <p className="mt-3 text-sm font-black text-slate-700">{section.intro}</p>}
      {section.list && (
        <ul className="mt-3 grid gap-2 text-sm font-semibold leading-7 text-slate-600">
          {section.list.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {section.note && <p className="mt-4 rounded-md bg-brand-mist p-4 text-sm font-bold leading-7 text-brand-ink">{section.note}</p>}
    </article>
  )
}
