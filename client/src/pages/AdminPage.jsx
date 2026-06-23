import {
  BarChart3,
  Boxes,
  Download,
  Edit3,
  ExternalLink,
  MessageSquareText,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  Truck,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  adminService,
  categoryService,
  couponService,
  orderService,
  productService,
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
  const topProducts = data?.topSellingProducts || []
  const cards = [
    ['Users', stats.usersCount || 0, Users],
    ['Orders', stats.ordersCount || 0, PackageCheck],
    ['Revenue', formatPrice(stats.revenue || 0), BarChart3],
    ['Products', stats.productsCount || 0, Boxes],
    ['Pending Orders', stats.pendingOrders || 0, Truck],
    ['Paid Orders', stats.paidOrders || 0, ShieldCheck],
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

function AdminOrderDetails({ order, busy, onClose, onShipment, onShipmentAction }) {
  const address = order.shippingAddress || {}
  const user = order.user || {}
  const itemsPrice = order.itemsPrice ?? order.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0
  const hasShipment = Boolean(order.shiprocketShipmentId)
  const hasAwb = Boolean(order.awbCode || order.trackingId)

  return (
    <Panel
      title={`Complete Order Details - ${order.orderNumber}`}
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

        <AdminInfoCard title="Delivery Tracking">
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
        <h3 className="font-display text-xl font-black text-brand-ink">Ordered Products</h3>
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
        <h3 className="font-display text-xl font-black text-brand-ink">Tracking History</h3>
        <div className="mt-4 grid gap-3">
          {(order.trackingHistory || []).length === 0 ? (
            <p className="rounded bg-brand-mist p-4 text-sm font-bold text-slate-500">No tracking history yet. Use Update Shipment to add delivery updates.</p>
          ) : (
            order.trackingHistory.slice().reverse().map((history, index) => (
              <div key={`${history.status}-${history.updatedAt}-${index}`} className="rounded border border-sky-100 bg-brand-mist p-4">
                <p className="font-display text-base font-black text-brand-ink">{formatStatus(history.status)}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{history.message}</p>
                {history.location && <p className="mt-1 text-xs font-extrabold text-brand-blue">{history.location}</p>}
                <p className="mt-2 text-xs font-bold text-slate-400">{formatDate(history.updatedAt)}</p>
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
      <h3 className="mb-4 font-display text-lg font-black text-brand-ink">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DetailLine({ label, value, strong = false }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 pb-2 last:border-0 sm:grid-cols-[140px_1fr]">
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className={`min-w-0 break-words text-sm ${strong ? 'font-display text-lg font-black text-brand-blue' : 'font-semibold text-slate-700'}`}>
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
