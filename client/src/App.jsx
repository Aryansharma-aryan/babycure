import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import { PageSkeleton } from './components/Skeleton'
import ToastManager from './components/ToastManager'

const HomePage = lazy(() => import('./pages/HomePage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'))
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'))
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

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
      { path: 'login', element: <LoginPage /> },
      { path: 'orders', element: <MyOrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailsPage /> },
      { path: 'orders/:id/tracking', element: <OrderTrackingPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '*', element: <CategoryPage /> },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Suspense fallback={<PageSkeleton />}>
          <RouterProvider router={router} />
        </Suspense>
        <ToastManager />
      </CartProvider>
    </AuthProvider>
  )
}
