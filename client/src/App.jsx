import { lazy, Suspense, useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import AppSplash from './components/AppSplash'
import { PageSkeleton } from './components/Skeleton'
import ToastManager from './components/ToastManager'

const HomePage = lazy(() => import('./pages/HomePage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'))
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'))
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductDetailsPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <AboutPage /> },
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
