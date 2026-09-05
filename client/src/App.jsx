import { lazy, Suspense, useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import AppSplash from './components/AppSplash'
import { PageSkeleton } from './components/Skeleton'
import ToastManager from './components/ToastManager'

const CHUNK_RELOAD_KEY = 'babycure:chunk-reload'

function lazyWithReload(importer) {
  return lazy(async () => {
    try {
      const module = await importer()
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      return module
    } catch (error) {
      const message = String(error?.message || error)
      const isChunkError = /failed to fetch dynamically imported module|loading chunk|importing a module script failed/i.test(message)
      const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0)

      if (isChunkError && Date.now() - lastReload > 30_000) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
        window.location.reload()
        return new Promise(() => {})
      }

      throw error
    }
  })
}

const HomePage = lazyWithReload(() => import('./pages/HomePage'))
const CategoryPage = lazyWithReload(() => import('./pages/CategoryPage'))
const ProductDetailsPage = lazyWithReload(() => import('./pages/ProductDetailsPage'))
const CartPage = lazyWithReload(() => import('./pages/CartPage'))
const CheckoutPage = lazyWithReload(() => import('./pages/CheckoutPage'))
const BlogPage = lazyWithReload(() => import('./pages/BlogPage'))
const ContactPage = lazyWithReload(() => import('./pages/ContactPage'))
const AboutPage = lazyWithReload(() => import('./pages/AboutPage'))
const WhyBabyCurePage = lazyWithReload(() => import('./pages/WhyBabyCurePage'))
const PolicyPage = lazyWithReload(() => import('./pages/PolicyPage'))
const LoginPage = lazyWithReload(() => import('./pages/LoginPage'))
const MyOrdersPage = lazyWithReload(() => import('./pages/MyOrdersPage'))
const OrderDetailsPage = lazyWithReload(() => import('./pages/OrderDetailsPage'))
const OrderTrackingPage = lazyWithReload(() => import('./pages/OrderTrackingPage'))
const AdminPage = lazyWithReload(() => import('./pages/AdminPage'))
const WishlistPage = lazyWithReload(() => import('./pages/WishlistPage'))
const AccountPage = lazyWithReload(() => import('./pages/AccountPage'))

function RouteErrorPage() {
  const error = useRouteError()
  const isChunkError = /failed to fetch dynamically imported module|loading chunk|importing a module script failed/i.test(String(error?.message || error || ''))

  return (
    <main className="grid min-h-screen place-items-center bg-sky-50 px-4 text-center">
      <section className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-8 shadow-soft">
        <h1 className="font-display text-3xl font-black text-slate-950">{isChunkError ? 'A new version is ready' : 'Something went wrong'}</h1>
        <p className="mt-3 font-medium leading-7 text-slate-600">
          {isChunkError ? 'Refresh once to load the latest Baby Cure update.' : 'Please reload the page and try again.'}
        </p>
        <button type="button" className="mt-6 bg-brand-ink px-6 py-3 font-extrabold text-white transition hover:bg-brand-blue" onClick={() => window.location.reload()}>
          Refresh page
        </button>
      </section>
    </main>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductDetailsPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'why-baby-cure', element: <WhyBabyCurePage /> },
      { path: 'shipping-policy', element: <PolicyPage /> },
      { path: 'return-refund-policy', element: <PolicyPage /> },
      { path: 'faqs', element: <PolicyPage /> },
      { path: 'privacy-policy', element: <PolicyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'orders', element: <MyOrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailsPage /> },
      { path: 'orders/:id/tracking', element: <OrderTrackingPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: '*', element: <CategoryPage /> },
    ],
  },
])

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('babycure:splash-seen'))

  useEffect(() => {
    if (!showSplash) return undefined
    const timer = window.setTimeout(() => {
      sessionStorage.setItem('babycure:splash-seen', 'true')
      setShowSplash(false)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [showSplash])

  return (
    <AuthProvider>
      <CartProvider>
        {showSplash && <AppSplash />}
        <Suspense fallback={<PageSkeleton />}>
          <RouterProvider router={router} />
        </Suspense>
        <ToastManager />
      </CartProvider>
    </AuthProvider>
  )
}
