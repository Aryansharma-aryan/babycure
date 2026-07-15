import {
  Baby,
  Heart,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export const routes = {
  home: '/',
  category: '/category',
  product: '/product/babycure-gentle-baby-wash',
  cart: '/cart',
  checkout: '/checkout',
  blog: '/blog',
  contact: '/contact',
  login: '/login',
}

export const images = {
  hero: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=1200&q=82',
  care: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=82',
  soft: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1000&q=82',
  nursery: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1000&q=82',
}

export const categories = [
  { id: 'baby-care', title: 'Baby Care', icon: Baby },
  { id: 'skin-care', title: 'Skin Care', icon: Leaf },
  { id: 'diapering', title: 'Diapering', icon: PackageCheck },
  { id: 'feeding', title: 'Feeding', icon: Baby },
  { id: 'health', title: 'Health & Safety', icon: ShieldCheck },
]

export const products = [
  {
    id: 'babycure-gentle-baby-wash',
    name: 'Babycure Gentle Baby Wash',
    category: 'baby-care',
    price: 399,
    oldPrice: 549,
    rating: 4.8,
    reviews: 96,
    color: 'blue',
    type: 'pump',
    tag: 'Best seller',
    description:
      'A gentle and tear-free baby wash made for soft skin, calm bath time and newborn-safe daily routines.',
    benefits: ['Natural ingredients', 'pH balanced', 'Dermatologically tested', 'No parabens or sulphates'],
  },
  {
    id: 'babycure-natural-moisturizing-lotion',
    name: 'Babycure Natural Moisturizing Lotion',
    category: 'skin-care',
    price: 499,
    oldPrice: 649,
    rating: 4.7,
    reviews: 128,
    color: 'green',
    type: 'lotion',
    tag: 'Soft care',
    description: 'Lightweight daily lotion for nourishing delicate baby skin after bath time.',
    benefits: ['24 hour moisture', 'Non sticky feel', 'Plant inspired care', 'For daily use'],
  },
  {
    id: 'babycure-diaper-rash-cream',
    name: 'Babycure Diaper Rash Cream',
    category: 'diapering',
    price: 299,
    oldPrice: 399,
    rating: 4.6,
    reviews: 78,
    color: 'green',
    type: 'tube',
    tag: 'Doctor trusted',
    description: 'Comforting diaper rash cream with a protective barrier for everyday diaper changes.',
    benefits: ['Barrier care', 'Fast comfort', 'Gentle texture', 'Newborn safe'],
  },
  {
    id: 'babycure-premium-baby-wipes',
    name: 'Babycure Premium Baby Wipes (72 Pcs)',
    category: 'diapering',
    price: 199,
    oldPrice: 249,
    rating: 4.5,
    reviews: 156,
    color: 'blue',
    type: 'wipes',
    tag: 'Travel safe',
    description: 'Soft, convenient wipes for home, travel and quick cleanups.',
    benefits: ['Soft touch', 'No alcohol', 'Travel friendly', 'Fresh clean'],
  },
  {
    id: 'babycure-nourishing-baby-oil',
    name: 'Babycure Nourishing Baby Oil',
    category: 'baby-care',
    price: 299,
    oldPrice: 399,
    rating: 4.4,
    reviews: 84,
    color: 'gold',
    type: 'spray',
    tag: 'Massage care',
    description: 'A warm, nourishing baby oil for massage routines and bonding moments.',
    benefits: ['Massage friendly', 'Light texture', 'Natural glow', 'Parent loved'],
  },
  {
    id: 'babycure-baby-powder',
    name: 'Babycure Baby Powder',
    category: 'baby-care',
    price: 199,
    oldPrice: 259,
    rating: 4.3,
    reviews: 56,
    color: 'blue',
    type: 'powder',
    tag: 'Fresh feel',
    description: 'A soft baby powder for a fresh, dry and comfortable feeling.',
    benefits: ['Fresh comfort', 'Soft finish', 'Daily care', 'Light fragrance'],
  },
]

export const articles = [
  {
    id: 'soft-baby-skin',
    title: "How to Keep Your Baby's Skin Soft and Healthy",
    date: '10 May 2026',
    image: images.hero,
    copy: 'A simple daily care rhythm for bath, lotion and bedtime comfort.',
  },
  {
    id: 'natural-ingredients',
    title: 'Benefits of Natural Ingredients in Baby Products',
    date: '06 May 2026',
    image: images.care,
    copy: 'What to look for when choosing gentle formulas for newborn skin.',
  },
  {
    id: 'monsoon-care',
    title: 'Monsoon Care Tips for Babies',
    date: '01 May 2026',
    image: images.soft,
    copy: 'Humidity-friendly care tips to keep your baby fresh and protected.',
  },
]

export const features = [
  { icon: Leaf, title: 'Natural Ingredients', copy: 'Safe and gentle' },
  { icon: ShieldCheck, title: 'Dermatologically Tested', copy: 'Clinically proven' },
  { icon: Sparkles, title: 'No Harsh Chemicals', copy: '100% safe for baby' },
  { icon: Heart, title: 'Made with Love', copy: 'For your baby' },
]
