import {
  BarChart3,
  Boxes,
  Download,
  Edit3,
  ExternalLink,
  MessageSquareText,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  RotateCw,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  Truck,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { resolveMediaUrl } from '../api/client'
import {
  adminService,
  categoryService,
  couponService,
  orderService,
  productService,
  returnRequestService,
  shiprocketService,
} from '../api/services'
import Button from '../components/Button'
import Input from '../components/Input'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/format'
import { getProductImage } from '../utils/products'
import { formatDate, formatStatus } from './MyOrdersPage'

const tabs = [
  ['dashboard', BarChart3, 'Dashboard'],
  ['products', Boxes, 'Products'],
  ['categories', Tag, 'Categories'],
  ['orders', PackageCheck, 'Orders'],
  ['coupons', ShieldCheck, 'Coupons'],
  ['users', Users, 'Users'],
  ['inquiries', MessageSquareText, 'Inquiries'],
  ['returns', RotateCw, 'Returns'],
  ['reviews', Star, 'Reviews'],
]

const orderStatuses = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
const deliveryStatuses = ['placed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('Please login with admin credentials')
      navigate('/login')
      return
    }
    if (user?.role !== 'admin') {
      toast.error('Admin access only')
      navigate('/')
    }
  }, [authLoading, isAuthenticated, navigate, user])

  if (authLoading || !isAuthenticated || user?.role !== 'admin') return <PageSkeleton />

  return (
    <section className="mx-auto max-w-[1440px] px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-green">Admin CRM</p>
            <h1 className="mt-1 font-display text-2xl font-black text-brand-ink sm:text-3xl">BabyCure Control Center</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-500">Manage orders, Shiprocket, products, coupons, customers, reviews and inquiries from one fast workspace.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Store</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <aside className="h-max rounded-md border border-sky-100 bg-brand-ink p-2 shadow-sm lg:sticky lg:top-28">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:block lg:min-w-0">
          {tabs.map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex min-w-0 items-center gap-2 rounded px-3 py-2.5 text-left text-xs font-extrabold transition sm:text-sm lg:mb-1 lg:w-full ${activeTab === key ? 'bg-brand-green text-brand-ink' : 'text-sky-100 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" /> <span className="truncate">{label}</span>
            </button>
          ))}
          </div>
        </aside>
        <div>
          {activeTab === 'dashboard' && <DashboardPanel />}
          {activeTab === 'products' && <ProductsPanel />}
          {activeTab === 'categories' && <CategoriesPanel />}
          {activeTab === 'orders' && <OrdersPanel />}
          {activeTab === 'coupons' && <CouponsPanel />}
          {activeTab === 'users' && <UsersPanel />}
          {activeTab === 'inquiries' && <InquiriesPanel />}
          {activeTab === 'returns' && <ReturnsPanel />}
          {activeTab === 'reviews' && <ReviewsPanel />}
        </div>
      </div>
    </section>
  )
}

function Panel({ title, action, children }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="font-display text-xl font-black text-brand-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function DashboardPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await adminService.dashboard())
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <PageSkeleton />

  const stats = data?.stats || {}
  const monthlySales = data?.monthlySales || []
  const dailySales = data?.dailySales || []
  const topProducts = data?.topSellingProducts || []
  const lowStockProducts = data?.lowStockProducts || []
  const cards = [
    ['Users', stats.usersCount || 0, Users],
    ['Orders', stats.ordersCount || 0, PackageCheck],
    ['Revenue', formatPrice(stats.revenue || 0), BarChart3],
    ['Avg. Order', formatPrice(stats.averageOrderValue || 0), BarChart3],
    ['Products', stats.productsCount || 0, Boxes],
    ['Pending Orders', stats.pendingOrders || 0, Truck],
    ['Paid Orders', stats.paidOrders || 0, ShieldCheck],
    ['Open Returns', stats.openReturnRequests || 0, RotateCw],
    ['Low Stock', stats.lowStockCount || 0, Boxes],
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
                <p className="mt-2 font-display text-2xl font-black text-brand-ink">{value}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded bg-brand-mist text-brand-blue">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardDonut stats={stats} />
        <MonthlySalesChart sales={monthlySales} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DailySalesChart sales={dailySales} />
        <StatusBreakdown title="Order Status" items={data?.orderStatusBreakdown || []} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <StatusBreakdown title="Payment Status" items={data?.paymentStatusBreakdown || []} />
        <LowStockPanel products={lowStockProducts} />
      </div>
      <TopProductsChart products={topProducts} />
      <Panel title="Recent Orders">
        <Table headers={['Order', 'User', 'Total', 'Payment', 'Status']}>
          {(data?.recentOrders || []).map((order) => (
            <tr key={order._id}>
              <Td>{order.orderNumber}</Td>
              <Td>{order.user?.name || order.user?.email || order.user?.phone || 'Customer'}</Td>
              <Td>{formatPrice(order.totalPrice)}</Td>
              <Td>{formatStatus(order.paymentStatus)}</Td>
              <Td>{formatStatus(order.orderStatus)}</Td>
            </tr>
          ))}
        </Table>
      </Panel>
      <Panel title="Top Selling Products">
        <Table headers={['Product', 'Sold', 'Revenue']}>
          {(data?.topSellingProducts || []).map((item) => (
            <tr key={item._id || item.name}>
              <Td>{item.name}</Td>
              <Td>{item.quantitySold}</Td>
              <Td>{formatPrice(item.revenue || 0)}</Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  )
}

function DailySalesChart({ sales }) {
  const maxRevenue = Math.max(...sales.map((item) => item.revenue || 0), 1)

  return (
    <Panel title="Last 30 Days Revenue">
      <div className="flex h-56 items-end gap-1 overflow-hidden rounded bg-brand-mist p-4">
        {sales.length === 0 ? (
          <div className="grid h-full w-full place-items-center text-sm font-bold text-slate-500">No paid sales in the last 30 days</div>
        ) : (
          sales.map((item) => {
            const height = Math.max(((item.revenue || 0) / maxRevenue) * 100, 6)
            const label = `${item._id?.day}/${item._id?.month}`
            return (
              <div key={`${item._id?.year}-${item._id?.month}-${item._id?.day}`} className="flex min-w-2 flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t bg-brand-green" style={{ height: `${height}%` }} title={`${label}: ${formatPrice(item.revenue || 0)}`} />
              </div>
            )
          })
        )}
      </div>
    </Panel>
  )
}

function StatusBreakdown({ title, items }) {
  const total = Math.max(items.reduce((sum, item) => sum + Number(item.count || 0), 0), 1)

  return (
    <Panel title={title}>
      <div className="grid gap-3">
        {items.length === 0 ? (
          <p className="rounded bg-brand-mist p-4 text-sm font-bold text-slate-500">No data yet.</p>
        ) : items.map((item) => {
          const percent = Math.round((Number(item.count || 0) / total) * 100)
          return (
            <div key={item._id || 'unknown'} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
                <span>{formatStatus(item._id || 'unknown')}</span>
                <span>{item.count} · {percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-brand-mist">
                <div className="h-full rounded bg-brand-blue" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function LowStockPanel({ products }) {
  return (
    <Panel title="Low Stock Alerts">
      {products.length === 0 ? (
        <p className="rounded bg-green-50 p-4 text-sm font-bold text-brand-green">All active products have healthy stock.</p>
      ) : (
        <Table headers={['Product', 'SKU', 'Stock', 'Price']}>
          {products.map((product) => (
            <tr key={product._id}>
              <Td>{product.name}</Td>
              <Td>{product.sku || 'NA'}</Td>
              <Td>{product.stock}</Td>
              <Td>{formatPrice(product.price || 0)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  )
}

function DashboardDonut({ stats }) {
  const paid = stats.paidOrders || 0
  const pending = stats.pendingOrders || 0
  const total = Math.max(stats.ordersCount || 0, paid + pending, 1)
  const paidPercent = Math.round((paid / total) * 100)
  const pendingPercent = Math.round((pending / total) * 100)
  const circumference = 2 * Math.PI * 44

  return (
    <Panel title="Order Mix">
      <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="relative mx-auto h-44 w-44">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="44" fill="none" stroke="#e5e7eb" strokeWidth="18" />
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke="#4aa6d9"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={`${(paid / total) * circumference} ${circumference}`}
            />
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke="#7cc576"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={`${(pending / total) * circumference} ${circumference}`}
              strokeDashoffset={-((paid / total) * circumference)}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-3xl font-black text-brand-ink">{stats.ordersCount || 0}</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Orders</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <ChartLegend color="bg-brand-blue" label="Paid Orders" value={`${paid} (${paidPercent}%)`} />
          <ChartLegend color="bg-brand-green" label="Pending / Processing" value={`${pending} (${pendingPercent}%)`} />
          <ChartLegend color="bg-slate-200" label="Other Statuses" value={Math.max((stats.ordersCount || 0) - paid - pending, 0)} />
        </div>
      </div>
    </Panel>
  )
}

function MonthlySalesChart({ sales }) {
  const maxRevenue = Math.max(...sales.map((item) => item.revenue || 0), 1)

  return (
    <Panel title="Monthly Revenue">
      <div className="flex h-64 items-end gap-3 overflow-hidden rounded bg-brand-mist p-4">
        {sales.length === 0 ? (
          <div className="grid h-full w-full place-items-center text-sm font-bold text-slate-500">No paid sales yet</div>
        ) : (
          sales.map((item) => {
            const height = Math.max(((item.revenue || 0) / maxRevenue) * 100, 8)
            const month = monthNames[(item._id?.month || 1) - 1]
            return (
              <div key={`${item._id?.year}-${item._id?.month}`} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t bg-brand-blue" style={{ height: `${height}%` }} title={`${month}: ${formatPrice(item.revenue || 0)}`} />
                <p className="text-xs font-black text-slate-500">{month}</p>
              </div>
            )
          })
        )}
      </div>
    </Panel>
  )
}

function TopProductsChart({ products }) {
  const maxSold = Math.max(...products.map((item) => item.quantitySold || 0), 1)

  return (
    <Panel title="Top Product Performance">
      <div className="grid gap-3">
        {products.length === 0 ? (
          <p className="rounded bg-brand-mist p-4 text-sm font-bold text-slate-500">No product sales yet.</p>
        ) : (
          products.slice(0, 6).map((item) => {
            const width = Math.max(((item.quantitySold || 0) / maxSold) * 100, 8)
            return (
              <div key={item._id || item.name} className="grid gap-2 sm:grid-cols-[180px_1fr_110px] sm:items-center">
                <p className="truncate text-sm font-extrabold text-slate-800">{item.name}</p>
                <div className="h-3 overflow-hidden rounded bg-brand-mist">
                  <div className="h-full rounded bg-brand-green" style={{ width: `${width}%` }} />
                </div>
                <p className="text-sm font-black text-slate-700 sm:text-right">{item.quantitySold || 0} sold</p>
              </div>
            )
          })
        )}
      </div>
    </Panel>
  )
}

function ChartLegend({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded bg-brand-mist px-4 py-3">
      <span className="flex min-w-0 items-center gap-3 text-sm font-bold text-slate-600">
        <span className={`h-3 w-3 shrink-0 rounded-full ${color}`} />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-sm font-black text-brand-ink">{value}</span>
    </div>
  )
}

function ProductsPanel() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        productService.list({ limit: 50 }),
        categoryService.list({ includeInactive: 'true' }),
      ])
      setProducts(productResponse.products || [])
      setCategories(categoryResponse.categories || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveProduct = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const payload = new FormData()
    ;['name', 'description', 'shortDescription', 'price', 'mrp', 'category', 'stock', 'sku', 'brand'].forEach((field) => payload.append(field, data[field] || ''))
    payload.append('isFeatured', Boolean(data.isFeatured))
    payload.append('isActive', data.isActive !== 'false')
    if (data.imageUrl) payload.append('images', data.imageUrl)
    const file = form.elements.imageFile?.files?.[0]
    if (file) payload.append('images', file)

    try {
      if (editing?._id) await productService.update(editing._id, payload)
      else await productService.create(payload)
      toast.success(editing ? 'Product updated' : 'Product created')
      setEditing(null)
      form.reset()
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      await productService.remove(id)
      toast.success('Product deleted')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <Panel title={editing ? 'Edit Product' : 'Add Product'} action={editing && <Button variant="ghost" onClick={() => setEditing(null)}>New Product</Button>}>
        <form onSubmit={saveProduct} className="grid gap-4 md:grid-cols-2">
          <Input label="Name" name="name" defaultValue={editing?.name || ''} required />
          <Input label="SKU" name="sku" defaultValue={editing?.sku || ''} required />
          <Input label="Price" name="price" type="number" defaultValue={editing?.price || ''} required />
          <Input label="MRP" name="mrp" type="number" defaultValue={editing?.mrp || ''} />
          <Input label="Stock" name="stock" type="number" defaultValue={editing?.stock || ''} required />
          <Input label="Brand" name="brand" defaultValue={editing?.brand || 'Babycure'} />
          <label className="text-sm font-black text-slate-700">Category
            <select name="category" defaultValue={editing?.category?._id || editing?.category || ''} className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue" required>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </label>
          <Input label="Image URL" name="imageUrl" defaultValue={getProductImage(editing) || ''} />
          <label className="text-sm font-black text-slate-700">Upload Image
            <input name="imageFile" type="file" accept="image/*" className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-bold" />
          </label>
          <label className="md:col-span-2 text-sm font-black text-slate-700">Short Description
            <textarea name="shortDescription" defaultValue={editing?.shortDescription || ''} className="mt-2 w-full rounded-md border border-slate-200 p-4 text-sm font-bold outline-none focus:border-brand-blue" rows="2" />
          </label>
          <label className="md:col-span-2 text-sm font-black text-slate-700">Description
            <textarea name="description" defaultValue={editing?.description || ''} className="mt-2 w-full rounded-md border border-slate-200 p-4 text-sm font-bold outline-none focus:border-brand-blue" rows="4" required />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input name="isFeatured" type="checkbox" defaultChecked={Boolean(editing?.isFeatured)} /> Featured</label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive !== false} /> Active</label>
          <Button type="submit" className="md:col-span-2">{editing ? 'Update Product' : 'Create Product'}</Button>
        </form>
      </Panel>
      <Panel title="Manage Products" action={<Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
        <Table headers={['Image', 'Product', 'Category', 'Price', 'Stock', 'Actions']}>
          {products.map((product) => (
            <tr key={product._id}>
              <Td>{getProductImage(product) && <img src={getProductImage(product)} alt={product.name} className="h-12 w-12 rounded object-cover" />}</Td>
              <Td>{product.name}</Td>
              <Td>{product.category?.name}</Td>
              <Td>{formatPrice(product.price)}</Td>
              <Td>{product.stock}</Td>
              <Td><RowActions onEdit={() => setEditing(product)} onDelete={() => removeProduct(product._id)} /></Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  )
}

function CategoriesPanel() {
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    try {
      const response = await categoryService.list({ includeInactive: 'true' })
      setCategories(response.categories || [])
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveCategory = async (event) => {
    event.preventDefault()
    const payload = Object.fromEntries(new FormData(event.currentTarget))
    payload.isActive = payload.isActive === 'on'
    try {
      if (editing?._id) await categoryService.update(editing._id, payload)
      else await categoryService.create(payload)
      toast.success(editing ? 'Category updated' : 'Category created')
      setEditing(null)
      event.currentTarget.reset()
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const removeCategory = async (id) => {
    try {
      await categoryService.remove(id)
      toast.success('Category deleted')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={saveCategory} className="grid gap-4 md:grid-cols-2">
          <Input label="Name" name="name" defaultValue={editing?.name || ''} required />
          <Input label="Image URL" name="image" defaultValue={editing?.image || ''} />
          <label className="md:col-span-2 text-sm font-black text-slate-700">Description
            <textarea name="description" defaultValue={editing?.description || ''} className="mt-2 w-full rounded-md border border-slate-200 p-4 text-sm font-bold outline-none focus:border-brand-blue" rows="3" />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive !== false} /> Active</label>
          <Button type="submit">{editing ? 'Update Category' : 'Create Category'}</Button>
        </form>
      </Panel>
      <Panel title="Manage Categories">
        <Table headers={['Category', 'Slug', 'Active', 'Actions']}>
          {categories.map((category) => (
            <tr key={category._id}>
              <Td>{category.name}</Td>
              <Td>{category.slug}</Td>
              <Td>{category.isActive ? 'Yes' : 'No'}</Td>
              <Td><RowActions onEdit={() => setEditing(category)} onDelete={() => removeCategory(category._id)} /></Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  )
}

function OrdersPanel() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [detailsOrder, setDetailsOrder] = useState(null)
  const [shipmentBusy, setShipmentBusy] = useState('')
  const shipmentBusyRef = useRef(false)

  const load = useCallback(async () => {
    try {
      const response = await orderService.adminAll()
      setOrders(response.orders || [])
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (order, orderStatus) => {
    try {
      await orderService.adminStatus(order._id, { orderStatus })
      toast.success('Order status updated')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const updateDelivery = async (event) => {
    event.preventDefault()
    const payload = Object.fromEntries(new FormData(event.currentTarget))
    try {
      await orderService.adminDelivery(selected._id, payload)
      toast.success('Shipment tracking updated')
      setSelected(null)
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const markPacked = async (order) => {
    if (shipmentBusyRef.current) return
    shipmentBusyRef.current = true
    setShipmentBusy('packed')
    try {
      const response = await orderService.adminDelivery(order._id, {
        deliveryStatus: 'packed',
        message: 'Order packed and ready for courier pickup.',
        location: 'BabyCure packing desk',
      })
      toast.success('Order marked packed')
      setDetailsOrder(response.order || { ...order, deliveryStatus: 'packed' })
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      shipmentBusyRef.current = false
      setShipmentBusy('')
    }
  }

  const runShipmentAction = async (order, action, successMessage) => {
    if (shipmentBusyRef.current) return
    shipmentBusyRef.current = true
    setShipmentBusy(action)
    try {
      const actions = {
        create: shiprocketService.createShipment,
        awb: shiprocketService.assignAwb,
        label: shiprocketService.generateLabel,
        pickup: shiprocketService.schedulePickup,
        track: shiprocketService.track,
      }
      const response = await actions[action](order._id)
      const updatedOrder = response.order || order
      toast.success(successMessage)
      setDetailsOrder(updatedOrder)
      setSelected(null)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      shipmentBusyRef.current = false
      setShipmentBusy('')
    }
  }

  return (
    <div className="space-y-6">
      {detailsOrder && (
        <AdminOrderDetails
          order={detailsOrder}
          busy={shipmentBusy}
          onClose={() => setDetailsOrder(null)}
          onShipment={() => { setSelected(detailsOrder); setDetailsOrder(null) }}
          onShipmentAction={runShipmentAction}
          onMarkPacked={markPacked}
        />
      )}
      {selected && (
        <Panel title={`Update Shipment - ${selected.orderNumber}`} action={<Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>}>
          <form onSubmit={updateDelivery} className="grid gap-4 md:grid-cols-2">
            <Input label="Courier Name" name="courierName" defaultValue={selected.courierName || ''} />
            <Input label="Tracking ID" name="trackingId" defaultValue={selected.trackingId || ''} />
            <Input label="Tracking URL" name="trackingUrl" defaultValue={selected.trackingUrl || ''} />
            <Input label="Estimated Delivery Date" name="estimatedDeliveryDate" type="date" defaultValue={selected.estimatedDeliveryDate?.slice?.(0, 10) || ''} />
            <label className="text-sm font-black text-slate-700">Delivery Status
              <select name="deliveryStatus" defaultValue={selected.deliveryStatus || 'pending'} className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-bold">
                {deliveryStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
              </select>
            </label>
            <Input label="Location" name="location" placeholder="Delhi warehouse" />
            <label className="md:col-span-2 text-sm font-black text-slate-700">History Message
              <textarea name="message" className="mt-2 w-full rounded-md border border-slate-200 p-4 text-sm font-bold" rows="3" placeholder="Package has been shipped from warehouse" />
            </label>
            <Button type="submit" className="md:col-span-2"><Truck className="h-4 w-4" /> Update Shipment</Button>
          </form>
        </Panel>
      )}
      <Panel title="Manage Orders" action={<Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
        <Table headers={['Order', 'Customer', 'Total', 'Status', 'Payment', 'Actions']}>
          {orders.map((order) => (
            <tr key={order._id}>
              <Td>{order.orderNumber}</Td>
              <Td>{order.user?.name || order.user?.email || order.user?.phone || 'Customer'}</Td>
              <Td>{formatPrice(order.totalPrice)}</Td>
              <Td>
                <select value={order.orderStatus} onChange={(event) => updateStatus(order, event.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                  {orderStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                </select>
              </Td>
              <Td>{formatStatus(order.paymentStatus)}</Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => setDetailsOrder(order)} className="px-4 py-2">View All</Button>
                  <Button variant="outline" onClick={() => setSelected(order)} className="px-4 py-2"><Truck className="h-4 w-4" /> Shipment</Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  )
}

function AdminOrderDetails({ order, busy, onClose, onShipment, onShipmentAction, onMarkPacked }) {
  const address = order.shippingAddress || {}
  const user = order.user || {}
  const itemsPrice = order.itemsPrice ?? order.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0
  const hasShipment = Boolean(order.shiprocketShipmentId)
  const hasAwb = Boolean(order.awbCode || order.trackingId)
  const workflowSteps = getAdminOrderWorkflow(order)

  return (
    <Panel
      title={`Order Details - ${order.orderNumber}`}
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={Boolean(busy) || hasShipment}
            onClick={() => onShipmentAction(order, 'create', 'Shiprocket shipment created')}
          >
            <PackageCheck className="h-4 w-4" /> {busy === 'create' ? 'Creating...' : 'Create Shipment'}
          </Button>
          <Button
            variant="outline"
            disabled={Boolean(busy) || !hasShipment || hasAwb}
            onClick={() => onShipmentAction(order, 'awb', 'AWB assigned')}
          >
            <Truck className="h-4 w-4" /> {busy === 'awb' ? 'Assigning...' : 'Assign AWB'}
          </Button>
          <Button
            variant="outline"
            disabled={Boolean(busy) || !hasShipment}
            onClick={() => onShipmentAction(order, 'label', 'Label generated')}
          >
            <Download className="h-4 w-4" /> {busy === 'label' ? 'Generating...' : 'Generate Label'}
          </Button>
          <Button
            variant="outline"
            disabled={Boolean(busy) || !hasShipment}
            onClick={() => onShipmentAction(order, 'pickup', 'Pickup scheduled')}
          >
            <Truck className="h-4 w-4" /> {busy === 'pickup' ? 'Scheduling...' : 'Schedule Pickup'}
          </Button>
          <Button
            variant="outline"
            disabled={Boolean(busy) || !hasAwb || order.deliveryStatus === 'packed'}
            onClick={() => onMarkPacked(order)}
          >
            <PackageCheck className="h-4 w-4" /> {busy === 'packed' ? 'Saving...' : 'Mark Packed'}
          </Button>
          <Button
            variant="ghost"
            disabled={Boolean(busy) || !hasAwb}
            onClick={() => onShipmentAction(order, 'track', 'Shipment tracking synced')}
          >
            <RefreshCw className="h-4 w-4" /> {busy === 'track' ? 'Tracking...' : 'Track Shipment'}
          </Button>
          {order.labelUrl && (
            <Button to={order.labelUrl} target="_blank" rel="noreferrer" variant="green">
              <Download className="h-4 w-4" /> Download Label
            </Button>
          )}
          <Button variant="outline" onClick={onShipment}><Truck className="h-4 w-4" /> Update Shipment</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="mb-5 rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Customer: {user.name || address.fullName || user.email || 'Customer'}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{order.orderNumber}</h3>
          </div>
          <div className="grid gap-2 text-sm font-medium text-slate-600 sm:grid-cols-3">
            <span className="rounded-full bg-brand-mist px-3 py-2">Order: {formatStatus(order.orderStatus)}</span>
            <span className="rounded-full bg-brand-mist px-3 py-2">Payment: {formatStatus(order.paymentStatus)}</span>
            <span className="rounded-full bg-brand-leaf px-3 py-2 text-brand-green">Total: {formatPrice(order.totalPrice || 0)}</span>
          </div>
        </div>
      </div>

      <AdminForwardShipmentGuide />

      <div className="mb-5 overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm">
        <div className="border-b border-sky-100 bg-[linear-gradient(135deg,#F3FBFF,#FFFFFF_55%,#F5FFF3)] px-4 py-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-green">Order Workflow</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-brand-ink">What To Do Next</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Follow these stages from paid order to automatic Shiprocket tracking.</p>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div key={step.key} className={`rounded-lg border p-3 ${step.done ? 'border-green-100 bg-green-50/80' : step.current ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-start gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${step.done ? 'bg-brand-green text-white' : step.current ? 'bg-brand-blue text-white' : 'bg-white text-slate-400'}`}>
                  {step.done ? '✓' : index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-brand-ink">{step.title}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{step.help}</p>
                  {step.value && <p className="mt-2 break-words rounded bg-white/80 px-2 py-1 text-xs font-semibold text-brand-blue">{step.value}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-3 xl:gap-5">
        <AdminInfoCard title="Customer">
          <DetailLine label="Name" value={user.name || address.fullName || 'Customer'} />
          <DetailLine label="Email" value={user.email || 'Not available'} />
          <DetailLine label="Phone" value={user.phone || address.phone || 'Not available'} />
          <DetailLine label="User ID" value={user._id || order.user || 'Not available'} />
        </AdminInfoCard>

        <AdminInfoCard title="Shipping Address">
          <DetailLine label="Full Name" value={address.fullName} />
          <DetailLine label="Phone" value={address.phone} />
          <DetailLine label="Alternate Phone" value={address.alternatePhone} />
          <DetailLine label="Address" value={address.addressLine1} />
          <DetailLine label="Address 2" value={address.addressLine2} />
          <DetailLine label="Landmark" value={address.landmark} />
          <DetailLine label="City" value={address.city} />
          <DetailLine label="State" value={address.state} />
          <DetailLine label="Postal Code" value={address.postalCode} />
          <DetailLine label="Country" value={address.country || 'India'} />
          <DetailLine label="Type" value={address.addressType} />
        </AdminInfoCard>

        <AdminInfoCard title="Payment & Totals">
          <DetailLine label="Payment Method" value={order.paymentMethod} />
          <DetailLine label="Payment Status" value={formatStatus(order.paymentStatus)} />
          <DetailLine label="Items Price" value={formatPrice(itemsPrice)} />
          <DetailLine label="Shipping" value={formatPrice(order.shippingPrice || 0)} />
          <DetailLine label="Tax" value={formatPrice(order.taxPrice || 0)} />
          <DetailLine label="Discount" value={formatPrice(order.discountAmount || 0)} />
          <DetailLine label="Coupon" value={order.couponCode || 'Not applied'} />
          <DetailLine label="Total" value={formatPrice(order.totalPrice || 0)} strong />
          <DetailLine label="Razorpay Order" value={order.razorpayOrderId} />
          <DetailLine label="Razorpay Payment" value={order.razorpayPaymentId} />
        </AdminInfoCard>
      </div>

      <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-2 xl:gap-5">
        <AdminInfoCard title="Order Status">
          <DetailLine label="Order Status" value={formatStatus(order.orderStatus)} strong />
          <DetailLine label="Created" value={formatDate(order.createdAt)} />
          <DetailLine label="Updated" value={formatDate(order.updatedAt)} />
          <DetailLine label="Delivered At" value={order.deliveredAt ? formatDate(order.deliveredAt) : 'Not delivered'} />
          <DetailLine label="Cancelled At" value={order.cancelledAt ? formatDate(order.cancelledAt) : 'Not cancelled'} />
        </AdminInfoCard>

        <AdminInfoCard title="Forward Shipment">
          <DetailLine label="Delivery Status" value={formatStatus(order.deliveryStatus || 'placed')} strong />
          <DetailLine label="Shiprocket Order" value={order.shiprocketOrderId || 'Not created'} />
          <DetailLine label="Shiprocket Shipment" value={order.shiprocketShipmentId || 'Not created'} />
          <DetailLine label="Courier Name" value={order.courierName || 'Not assigned'} />
          <DetailLine label="AWB Number" value={order.awbCode || order.trackingId || 'Not assigned'} />
          <DetailLine label="Tracking URL" value={order.trackingUrl || 'Not assigned'} />
          <DetailLine label="Shipment Status" value={order.shipmentStatus || 'Not assigned'} />
          <DetailLine label="Pickup Status" value={order.pickupStatus || 'Not scheduled'} />
          <DetailLine label="Label URL" value={order.labelUrl || 'Not generated'} />
          <DetailLine label="Estimated Delivery" value={order.estimatedDeliveryDate ? formatDate(order.estimatedDeliveryDate) : 'Not assigned'} />
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded bg-brand-blue px-4 py-2 text-sm font-extrabold text-white">
              Track on Courier Website <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </AdminInfoCard>
      </div>

      <div className="mt-5 rounded-md border border-sky-100 bg-brand-mist p-3 sm:p-4">
        <h3 className="font-display text-xl font-semibold text-brand-ink">Product Details</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="mobile-card-table w-full min-w-full text-left text-sm md:min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Product ID</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(order.orderItems || []).map((item) => (
                <tr key={`${item.product}-${item.name}`}>
                  <Td>
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />}
                      <span>{item.name}</span>
                    </div>
                  </Td>
                  <Td>{item.product?._id || item.product || 'Not available'}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{formatPrice(item.price)}</Td>
                  <Td>{formatPrice(item.price * item.quantity)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-slate-200 bg-white p-4">
        <h3 className="font-display text-xl font-semibold text-brand-ink">Forward Tracking History</h3>
        <div className="mt-4 grid gap-3">
          {(order.trackingHistory || []).length === 0 ? (
            <p className="rounded bg-brand-mist p-4 text-sm font-medium text-slate-500">No tracking history yet. Shiprocket webhook will add updates automatically after AWB movement.</p>
          ) : (
            order.trackingHistory.slice().reverse().map((history, index) => (
              <div key={`${history.status}-${history.updatedAt}-${index}`} className="rounded border border-sky-100 bg-brand-mist p-4">
                <p className="font-display text-base font-semibold text-brand-ink">{formatStatus(history.status)}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{history.message}</p>
                {history.location && <p className="mt-1 text-xs font-semibold text-brand-blue">{history.location}</p>}
                <p className="mt-2 text-xs font-medium text-slate-400">{formatDate(history.updatedAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  )
}

function AdminInfoCard({ title, children }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-brand-ink">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function AdminForwardShipmentGuide() {
  const steps = [
    ['New paid order', 'Open View All, check customer address, phone number, products and payment status.'],
    ['Ready to pack', 'Create shipment, assign AWB, generate label and keep products ready.'],
    ['Packed', 'After label is printed and parcel is packed, click Mark Packed.'],
    ['Pickup', 'Schedule pickup from Shiprocket and hand over parcel to courier.'],
    ['Automatic tracking', 'After AWB, customer tracking page refreshes from Shiprocket automatically.'],
  ]

  return (
    <div className="mb-5 rounded-lg border border-sky-100 bg-brand-mist p-4">
      <h3 className="font-display text-lg font-semibold text-brand-ink">CRM Order Handling Guide</h3>
      <div className="mt-3 grid gap-2 lg:grid-cols-5">
        {steps.map(([title, copy], index) => (
          <div key={title} className="rounded-md bg-white p-3">
            <p className="text-xs font-semibold text-brand-blue">Step {index + 1}</p>
            <p className="mt-1 text-sm font-semibold text-brand-ink">{title}</p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function getAdminOrderWorkflow(order) {
  const paid = order.paymentStatus === 'paid'
  const shipment = Boolean(order.shiprocketShipmentId)
  const awb = Boolean(order.awbCode || order.trackingId)
  const label = Boolean(order.labelUrl)
  const pickup = Boolean(order.pickupStatus)
  const packed = ['packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.deliveryStatus)
  const tracking = awb && Boolean(order.trackingHistory?.length || order.trackingSyncedAt)
  const stages = [
    {
      key: 'paid',
      title: 'Payment paid',
      help: paid ? 'Payment is confirmed. Order can move to packing.' : 'Wait for Razorpay paid status before shipment.',
      done: paid,
      value: formatStatus(order.paymentStatus),
    },
    {
      key: 'shipment',
      title: 'Create Shiprocket shipment',
      help: shipment ? 'Shiprocket shipment is created.' : 'Click Create Shipment to send order details to Shiprocket.',
      done: shipment,
      value: order.shiprocketShipmentId,
    },
    {
      key: 'awb',
      title: 'Assign AWB',
      help: awb ? 'Courier and AWB are assigned.' : 'Click Assign AWB after shipment is created.',
      done: awb,
      value: order.awbCode || order.trackingId,
    },
    {
      key: 'label',
      title: 'Generate label',
      help: label ? 'Label is ready to download and print.' : 'Generate label before final packing.',
      done: label,
      value: order.labelUrl ? 'Label ready' : '',
    },
    {
      key: 'packed',
      title: 'Mark packed',
      help: packed ? 'Parcel is packed or already moved with courier.' : 'Click Mark Packed after label is on the parcel.',
      done: packed,
      value: formatStatus(order.deliveryStatus || 'placed'),
    },
    {
      key: 'pickup',
      title: 'Schedule pickup',
      help: pickup ? 'Pickup has been requested.' : 'Schedule Shiprocket pickup after packing.',
      done: pickup,
      value: order.pickupStatus,
    },
    {
      key: 'tracking',
      title: 'Track automatically',
      help: tracking ? 'Tracking updates are available from Shiprocket.' : 'After AWB, webhook and customer refresh will sync tracking.',
      done: tracking,
      value: order.courierName,
    },
    {
      key: 'delivered',
      title: 'Delivered',
      help: order.deliveryStatus === 'delivered' ? 'Order completed.' : 'Final status comes from Shiprocket tracking.',
      done: order.deliveryStatus === 'delivered',
      value: order.estimatedDeliveryDate ? formatDate(order.estimatedDeliveryDate) : '',
    },
  ]
  const firstPending = stages.findIndex((stage) => !stage.done)
  return stages.map((stage, index) => ({ ...stage, current: index === firstPending }))
}

function DetailLine({ label, value, strong = false }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 pb-2 last:border-0 sm:grid-cols-[140px_1fr]">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className={`min-w-0 break-words text-sm ${strong ? 'font-display text-lg font-semibold text-brand-blue' : 'font-medium text-slate-700'}`}>
        {value || 'Not available'}
      </span>
    </div>
  )
}

function CouponsPanel() {
  const [coupons, setCoupons] = useState([])
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    try {
      const response = await couponService.list()
      setCoupons(response.coupons || [])
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveCoupon = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const payload = {
      ...data,
      discountValue: Number(data.discountValue),
      minimumOrderAmount: Number(data.minimumOrderAmount || 0),
      maximumDiscountAmount: data.maximumDiscountAmount ? Number(data.maximumDiscountAmount) : undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      isActive: data.isActive === 'on',
    }
    try {
      if (editing?._id) await couponService.update(editing._id, payload)
      else await couponService.create(payload)
      toast.success(editing ? 'Coupon updated' : 'Coupon created')
      setEditing(null)
      event.currentTarget.reset()
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const removeCoupon = async (id) => {
    try {
      await couponService.remove(id)
      toast.success('Coupon deleted')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <div className="mb-5 grid gap-3 rounded-md border border-sky-100 bg-brand-mist p-4 text-sm font-semibold leading-6 text-slate-700 md:grid-cols-3">
          <p><span className="font-black text-brand-ink">Percentage coupon:</span> Choose Percentage and enter 10 to give 10% off. Example code: SAVE10.</p>
          <p><span className="font-black text-brand-ink">Fixed coupon:</span> Choose Fixed and enter 100 to give Rs.100 off. Example code: FLAT100.</p>
          <p><span className="font-black text-brand-ink">How it works:</span> Customer enters this code at checkout. Min order decides eligibility, max discount caps percentage coupons, and usage limit controls total uses.</p>
        </div>
        <form onSubmit={saveCoupon} className="grid gap-4 md:grid-cols-3">
          <Input label="Code" name="code" placeholder="SAVE10 or FLAT100" defaultValue={editing?.code || ''} required />
          <label className="text-sm font-black text-slate-700">Type
            <select name="discountType" defaultValue={editing?.discountType || 'percentage'} className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-bold">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
          <Input label="Discount Value" name="discountValue" type="number" placeholder="10 for 10% or 100 for Rs.100" defaultValue={editing?.discountValue || ''} required />
          <Input label="Min Order" name="minimumOrderAmount" type="number" placeholder="999 means applies above Rs.999" defaultValue={editing?.minimumOrderAmount || 0} />
          <Input label="Max Discount" name="maximumDiscountAmount" type="number" placeholder="200 caps percentage discount at Rs.200" defaultValue={editing?.maximumDiscountAmount || ''} />
          <Input label="Usage Limit" name="usageLimit" type="number" placeholder="100 means first 100 uses only" defaultValue={editing?.usageLimit || ''} />
          <Input label="Start Date" name="startDate" type="date" defaultValue={editing?.startDate?.slice?.(0, 10) || ''} />
          <Input label="Expiry Date" name="expiryDate" type="date" defaultValue={editing?.expiryDate?.slice?.(0, 10) || ''} />
          <label className="flex items-center gap-2 self-end text-sm font-bold text-slate-600"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive !== false} /> Active</label>
          <Input label="Description" name="description" placeholder="Example: 10% off on first baby care order" defaultValue={editing?.description || ''} className="md:col-span-2" />
          <Button type="submit">{editing ? 'Update Coupon' : 'Create Coupon'}</Button>
        </form>
      </Panel>
      <Panel title="Manage Coupons">
        <Table headers={['Code', 'Type', 'Value', 'Used', 'Active', 'Actions']}>
          {coupons.map((coupon) => (
            <tr key={coupon._id}>
              <Td>{coupon.code}</Td>
              <Td>{coupon.discountType}</Td>
              <Td>{coupon.discountValue}</Td>
              <Td>{coupon.usedCount || 0}/{coupon.usageLimit || '∞'}</Td>
              <Td>{coupon.isActive ? 'Yes' : 'No'}</Td>
              <Td><RowActions onEdit={() => setEditing(coupon)} onDelete={() => removeCoupon(coupon._id)} /></Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers] = useState([])

  const load = useCallback(async () => {
    try {
      const response = await adminService.users()
      setUsers(response.users || [])
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateUser = async (user, payload) => {
    try {
      await adminService.updateUser(user._id, payload)
      toast.success('User updated')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Panel title="View Users">
      <Table headers={['Name', 'Email/Phone', 'Role', 'Blocked', 'Joined']}>
        {users.map((user) => (
          <tr key={user._id}>
            <Td>{user.name || 'User'}</Td>
            <Td>{user.email || user.phone}</Td>
            <Td>
              <select value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </Td>
            <Td><button onClick={() => updateUser(user, { isBlocked: !user.isBlocked })} className={`rounded px-3 py-2 text-xs font-extrabold ${user.isBlocked ? 'bg-red-50 text-red-600' : 'bg-brand-leaf text-brand-green'}`}>{user.isBlocked ? 'Unblock' : 'Block'}</button></Td>
            <Td>{formatDate(user.createdAt)}</Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

function InquiriesPanel() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminService.contactInquiries()
      setInquiries(response.inquiries || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateInquiry = async (inquiry, status) => {
    try {
      await adminService.updateContactInquiry(inquiry._id, { status })
      toast.success('Inquiry updated')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteInquiry = async (inquiry) => {
    const confirmed = window.confirm(`Delete inquiry from ${inquiry.name}?`)
    if (!confirmed) return

    try {
      setDeletingId(inquiry._id)
      setInquiries((current) => current.filter((item) => item._id !== inquiry._id))
      await adminService.deleteContactInquiry(inquiry._id)
      toast.success('Inquiry deleted')
    } catch (error) {
      load()
      toast.error(error.message)
    } finally {
      setDeletingId('')
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <Panel title="Customer Inquiries" action={<Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
      {inquiries.length === 0 ? (
        <p className="rounded bg-brand-mist p-4 text-sm font-bold text-slate-500">No contact messages yet.</p>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-black text-brand-ink">{inquiry.name}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-slate-600">
                    <a href={`mailto:${inquiry.email}`} className="text-slate-800 underline-offset-2 hover:underline">{inquiry.email}</a>
                    <a href={`https://wa.me/91${inquiry.phone}`} target="_blank" rel="noreferrer" className="text-brand-green underline-offset-2 hover:underline">WhatsApp: {inquiry.phone}</a>
                    <span>{formatDate(inquiry.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => updateInquiry(inquiry, 'read')} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
                    Mark Read
                  </button>
                  <button type="button" onClick={() => updateInquiry(inquiry, 'closed')} className="rounded bg-brand-green px-3 py-2 text-xs font-black text-white">
                    Complete
                  </button>
                  <button type="button" onClick={() => deleteInquiry(inquiry)} disabled={deletingId === inquiry._id} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-500 disabled:cursor-not-allowed disabled:opacity-60">
                    <Trash2 className="h-3.5 w-3.5" /> {deletingId === inquiry._id ? 'Deleting' : 'Delete'}
                  </button>
                </div>
              </div>
              <span className={`mt-3 inline-flex rounded px-3 py-1 text-xs font-black ${inquiry.status === 'new' ? 'bg-brand-mist text-brand-blue' : inquiry.status === 'closed' ? 'bg-brand-leaf text-brand-green' : 'bg-slate-50 text-slate-500'}`}>
                {formatStatus(inquiry.status)}
              </span>
              <p className="mt-4 rounded bg-brand-mist p-4 text-sm font-semibold leading-6 text-slate-700">{inquiry.message}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

function ReturnsPanel() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await returnRequestService.adminAll()
      setRequests(response.requests || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (request, action, successMessage, payload) => {
    const confirmations = {
      approve: 'Approve this return/replacement request?',
      reject: 'Reject this request?',
      pickup: 'Create Shiprocket reverse pickup for this customer?',
      received: 'Mark product received and verified by seller?',
      refund: 'Initiate refund for this return?',
      manualRefund: 'Mark manual refund as completed?',
      replacement: 'Create replacement shipment for this request?',
      delivered: 'Mark replacement delivered?',
      close: 'Close this request?',
    }
    if (confirmations[action] && !window.confirm(confirmations[action])) return

    setBusy(`${action}-${request._id}`)
    try {
      const actions = {
        approve: returnRequestService.approve,
        reject: returnRequestService.reject,
        pickup: returnRequestService.createReturnPickup,
        track: returnRequestService.trackReturn,
        received: (id) => returnRequestService.updateStatus(id, { status: 'received_by_seller', message: 'Product received and verified by seller.' }),
        refund: returnRequestService.initiateRefund,
        manualRefund: (id) => returnRequestService.updateStatus(id, { status: 'refund_completed', message: 'Manual refund completed by seller.' }),
        replacement: returnRequestService.createReplacementShipment,
        delivered: (id) => returnRequestService.updateStatus(id, { status: 'replacement_delivered', message: 'Replacement delivered to customer.' }),
        close: returnRequestService.close,
      }
      await actions[action](request._id, payload)
      toast.success(successMessage)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy('')
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <Panel title="Return / Replacement Requests" action={<Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
      <ReturnOperationsGuide />
      {requests.length === 0 ? (
        <p className="rounded bg-brand-mist p-4 text-sm font-bold text-slate-500">No return or replacement requests yet.</p>
      ) : (
        <div className="grid gap-5">
          {requests.map((request) => (
            <ReturnRequestAdminCard key={request._id} request={request} busy={busy} run={run} />
          ))}
        </div>
      )}
    </Panel>
  )
}

const requestStatusStyles = {
  requested: 'bg-amber-50 text-amber-700 border-amber-100',
  approved: 'bg-sky-50 text-brand-blue border-sky-100',
  rejected: 'bg-red-50 text-red-600 border-red-100',
  pickup_scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
  picked_up: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  received_by_seller: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  refund_initiated: 'bg-purple-50 text-purple-700 border-purple-100',
  refund_completed: 'bg-green-50 text-brand-green border-green-100',
  replacement_shipped: 'bg-blue-50 text-blue-700 border-blue-100',
  replacement_delivered: 'bg-green-50 text-brand-green border-green-100',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
}

const customerPhone = (request) => String(request.order?.shippingAddress?.phone || request.user?.phone || '').replace(/\D/g, '').slice(-10)
const requestAwb = (request) => request.type === 'replacement' ? request.replacementAwbCode : request.returnAwbCode
const requestCourier = (request) => request.type === 'replacement' ? request.replacementCourierName : request.returnCourierName
const requestTrackingUrl = (request) => request.type === 'replacement' ? request.replacementTrackingUrl : request.returnTrackingUrl

const buildReturnWhatsAppUrl = (request) => {
  const phone = customerPhone(request)
  const awb = requestAwb(request)
  if (!phone || !awb) return ''

  const message = [
    `Hi ${request.user?.name || 'there'},`,
    `Your BabyCure ${request.type} tracking is ready.`,
    `Request: ${request.requestNumber}`,
    `Order: ${request.order?.orderNumber || ''}`,
    `Courier: ${requestCourier(request) || 'Assigned courier'}`,
    `AWB: ${awb}`,
    requestTrackingUrl(request) ? `Track here: ${requestTrackingUrl(request)}` : '',
  ].filter(Boolean).join('\n')

  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
}

function ReturnOperationsGuide() {
  const steps = [
    ['1', 'Review request', 'Check product, reason, customer note and uploaded proof images.'],
    ['2', 'Approve or reject', 'Approve only eligible damaged, wrong, missing, defective or expired cases.'],
    ['3', 'Create reverse pickup', 'This sends customer address to Shiprocket and asks for a return pickup AWB.'],
    ['4', 'Track automatically', 'Webhook updates return tracking. Use Track Return only if webhook is delayed.'],
    ['5', 'Mark received', 'Click only after the returned product reaches seller and is verified.'],
    ['6', 'Refund or replace', 'Refund after verification, or create replacement shipment for replacement cases.'],
  ]

  return (
    <div className="mb-5 rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-brand-ink">How To Manage Returns</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Admin handles approval and verification. Shiprocket handles reverse pickup, AWB and tracking after pickup is created.</p>
        </div>
        <span className="rounded-full bg-brand-leaf px-3 py-1 text-xs font-semibold text-brand-green">Automatic after AWB</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map(([number, title, copy]) => (
          <div key={number} className="rounded-md border border-sky-100 bg-brand-mist p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-blue text-xs font-semibold text-white">{number}</span>
              <p className="font-semibold text-brand-ink">{title}</p>
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{copy}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
        If AWB is not assigned, check Shiprocket pickup address, serviceability, courier availability and wallet balance. Then click Create Reverse Pickup again to retry AWB assignment for the existing return shipment.
      </p>
    </div>
  )
}

function ReturnRequestAdminCard({ request, busy, run }) {
  const awb = requestAwb(request)
  const courier = requestCourier(request)
  const trackingUrl = requestTrackingUrl(request)
  const whatsappUrl = buildReturnWhatsAppUrl(request)
  const statusClass = requestStatusStyles[request.status] || 'bg-slate-50 text-slate-600 border-slate-100'

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-brand-ink">{request.requestNumber}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {formatStatus(request.type)} for {request.order?.orderNumber} by {request.user?.name || request.user?.email || 'Customer'}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>{formatStatus(request.status)}</span>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="rounded-md border border-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Request Details</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">Reason: {formatStatus(request.reason)}</p>
            {(request.items || []).map((item) => (
              <p key={`${request._id}-${item.product}`} className="mt-2 text-sm text-slate-600">{item.name} x {item.quantity}</p>
            ))}
            {request.details && <p className="mt-3 rounded bg-brand-mist p-3 text-sm leading-6 text-slate-600">{request.details}</p>}
          </div>

          {request.images?.length > 0 && (
            <div className="rounded-md border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Customer Evidence</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {request.images.map((image) => (
                  <a key={image.url} href={resolveMediaUrl(image.url)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    <img src={resolveMediaUrl(image.url)} alt="Return evidence" className="h-20 w-20 object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid content-start gap-4">
          <div className="rounded-md border border-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Shiprocket Tracking</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p><span className="font-semibold text-brand-ink">Courier:</span> {courier || 'Not assigned yet'}</p>
              <p><span className="font-semibold text-brand-ink">AWB:</span> {awb || 'Not assigned yet'}</p>
              <p><span className="font-semibold text-brand-ink">Pickup:</span> {request.returnPickupStatus || 'Not scheduled yet'}</p>
              <p><span className="font-semibold text-brand-ink">Shipment:</span> {formatStatus(request.returnShipmentStatus || request.replacementShipmentStatus || request.status)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {trackingUrl && (
                <a href={trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-brand-blue">
                  Track <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-brand-green">
                  Send WhatsApp <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="rounded-md border border-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Actions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" disabled={Boolean(busy)} onClick={() => run(request, 'approve', 'Request approved')}>Approve</Button>
              <Button variant="ghost" disabled={Boolean(busy)} onClick={() => run(request, 'reject', 'Request rejected', { message: 'Request rejected by admin.' })}>Reject</Button>
              <Button variant="outline" disabled={Boolean(busy)} onClick={() => run(request, 'pickup', 'Reverse pickup created')}>Create Reverse Pickup</Button>
              <Button variant="ghost" disabled={Boolean(busy) || !request.returnAwbCode} onClick={() => run(request, 'track', 'Return tracking synced')}>Track Return</Button>
              <Button variant="outline" disabled={Boolean(busy)} onClick={() => run(request, 'received', 'Marked received')}>Mark Received</Button>
              {request.type !== 'return' && (
                <>
                  <Button variant="green" disabled={Boolean(busy)} onClick={() => run(request, 'replacement', 'Replacement shipment created')}>Replacement Ship</Button>
                  <Button variant="outline" disabled={Boolean(busy)} onClick={() => run(request, 'delivered', 'Replacement delivered')}>Delivered</Button>
                </>
              )}
              <Button variant="ghost" disabled={Boolean(busy)} onClick={() => run(request, 'close', 'Request closed')}>Close</Button>
            </div>
          </div>

          {request.type === 'return' ? (
            <div className="rounded-md border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Refund</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p><span className="font-semibold text-brand-ink">Amount:</span> {formatPrice(request.refundAmount || request.order?.totalPrice || 0)}</p>
                <p><span className="font-semibold text-brand-ink">Method:</span> {request.order?.paymentMethod === 'ONLINE' ? 'Razorpay' : 'Manual UPI / Bank / Store Credit'}</p>
                <p><span className="font-semibold text-brand-ink">Status:</span> {formatStatus(request.status)}</p>
                <p><span className="font-semibold text-brand-ink">Razorpay Refund:</span> {request.razorpayRefundId || 'Not initiated'}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="green" disabled={Boolean(busy) || !['received_by_seller', 'refund_initiated'].includes(request.status)} onClick={() => run(request, 'refund', 'Refund initiated', { amount: request.order?.totalPrice })}>Initiate Refund</Button>
                <Button variant="outline" disabled={Boolean(busy) || !['received_by_seller', 'refund_initiated'].includes(request.status)} onClick={() => run(request, 'manualRefund', 'Manual refund completed')}>Mark Manual Refund Completed</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Replacement Shipment</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p><span className="font-semibold text-brand-ink">Return AWB:</span> {request.returnAwbCode || 'Not assigned yet'}</p>
                <p><span className="font-semibold text-brand-ink">Replacement AWB:</span> {request.replacementAwbCode || 'Not assigned yet'}</p>
                <p><span className="font-semibold text-brand-ink">Courier:</span> {request.replacementCourierName || 'Not assigned yet'}</p>
                <p><span className="font-semibold text-brand-ink">Status:</span> {formatStatus(request.replacementShipmentStatus || request.status)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        <div className="grid gap-2">
          {(request.statusHistory || []).slice().reverse().map((history, index) => (
            <p key={`${history.status}-${index}`} className="text-xs font-medium text-slate-600">
              <span className="font-semibold text-brand-ink">{formatStatus(history.status)}</span> - {history.message} ({formatDate(history.updatedAt)})
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReviewsPanel() {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    productService.list({ limit: 50 }).then((response) => {
      setProducts(response.products || [])
      setProductId(response.products?.[0]?._id || '')
    }).catch((error) => toast.error(error.message))
  }, [])

  const loadReviews = useCallback(async () => {
    if (!productId) return
    try {
      const response = await productService.reviews(productId)
      setReviews(response.reviews || [])
    } catch (error) {
      toast.error(error.message)
    }
  }, [productId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const deleteReview = async (id) => {
    try {
      await productService.deleteReview(id)
      toast.success('Review deleted')
      loadReviews()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Panel title="View Reviews">
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <select value={productId} onChange={(event) => setProductId(event.target.value)} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold">
          {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
        </select>
        <Button variant="ghost" onClick={loadReviews}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>
      <Table headers={['User', 'Rating', 'Comment', 'Action']}>
        {reviews.map((review) => (
          <tr key={review._id}>
            <Td>{review.user?.name || 'Customer'}</Td>
            <Td>{review.rating}</Td>
            <Td>{review.comment}</Td>
            <Td><button onClick={() => deleteReview(review._id)} className="rounded-full bg-red-50 p-2 text-red-500"><Trash2 className="h-4 w-4" /></button></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <button onClick={onEdit} className="rounded bg-brand-mist p-2 text-brand-blue"><Edit3 className="h-4 w-4" /></button>
      <button onClick={onDelete} className="rounded bg-red-50 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
    </div>
  )
}

function Table({ headers, children }) {
  return (
    <div className="overflow-visible md:overflow-x-auto">
      <table className="mobile-card-table w-full min-w-full text-left text-sm md:min-w-[760px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            {headers.map((header) => <th key={header} className="px-3 py-3 font-extrabold">{header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children }) {
  return <td className="px-3 py-4 align-middle font-semibold text-slate-600">{children}</td>
}
