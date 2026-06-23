import {
  BarChart3,
  Boxes,
  Download,
  Edit3,
  ExternalLink,
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
import PageHeader from '../components/PageHeader'
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
  ['reviews', Star, 'Reviews'],
]

const orderStatuses = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
const deliveryStatuses = ['placed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed']

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
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Admin CRM" title="BabyCure Control Center" copy="Manage products, orders, shipment tracking, coupons, users, reviews and analytics." backTo="/" backLabel="Back to store" />
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="h-max overflow-x-auto rounded-[1.6rem] border border-sky-100 bg-white p-3 shadow-soft lg:sticky lg:top-36">
          <div className="flex min-w-max gap-2 lg:block lg:min-w-0">
          {tabs.map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition lg:mb-2 lg:w-full ${activeTab === key ? 'bg-brand-mist text-brand-blue shadow-[0_12px_32px_rgba(74,166,217,0.12)]' : 'text-slate-500 hover:bg-sky-50 hover:text-brand-blue'}`}
            >
              <Icon className="h-5 w-5" /> {label}
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
          {activeTab === 'reviews' && <ReviewsPanel />}
        </div>
      </div>
    </section>
  )
}

function Panel({ title, action, children }) {
  return (
    <div className="rounded-[1.8rem] border border-sky-100 bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold text-brand-ink">{title}</h2>
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
          <div key={label} className="rounded-[1.5rem] border border-sky-100 bg-gradient-to-br from-white to-brand-mist p-5 shadow-[0_18px_55px_rgba(74,166,217,0.10)]">
            <Icon className="h-7 w-7 text-brand-blue" />
            <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-brand-ink">{value}</p>
          </div>
        ))}
      </div>
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
              <Td>{getProductImage(product) && <img src={getProductImage(product)} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />}</Td>
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
                <select value={order.orderStatus} onChange={(event) => updateStatus(order, event.target.value)} className="rounded-xl border border-sky-100 px-3 py-2 text-xs font-bold">
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
      <div className="grid gap-5 xl:grid-cols-3">
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

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
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
            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-extrabold text-white">
              Track on Courier Website <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </AdminInfoCard>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-sky-100 bg-sky-50/40 p-4">
        <h3 className="font-display text-xl font-extrabold text-brand-ink">Ordered Products</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sky-100 text-xs uppercase tracking-[0.12em] text-slate-400">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Product ID</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {(order.orderItems || []).map((item) => (
                <tr key={`${item.product}-${item.name}`}>
                  <Td>
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />}
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

      <div className="mt-5 rounded-[1.4rem] border border-sky-100 bg-white p-4">
        <h3 className="font-display text-xl font-extrabold text-brand-ink">Tracking History</h3>
        <div className="mt-4 grid gap-3">
          {(order.trackingHistory || []).length === 0 ? (
            <p className="rounded-2xl bg-sky-50 p-4 text-sm font-bold text-slate-500">No tracking history yet. Use Update Shipment to add delivery updates.</p>
          ) : (
            order.trackingHistory.slice().reverse().map((history, index) => (
              <div key={`${history.status}-${history.updatedAt}-${index}`} className="rounded-2xl bg-sky-50 p-4">
                <p className="font-display text-base font-extrabold text-brand-ink">{formatStatus(history.status)}</p>
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
    <div className="rounded-[1.4rem] border border-sky-100 bg-white p-5 shadow-[0_16px_48px_rgba(74,166,217,0.08)]">
      <h3 className="mb-4 font-display text-xl font-extrabold text-brand-ink">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DetailLine({ label, value, strong = false }) {
  return (
    <div className="grid gap-1 border-b border-sky-50 pb-2 last:border-0 sm:grid-cols-[140px_1fr]">
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className={`break-words text-sm ${strong ? 'font-display text-lg font-extrabold text-brand-blue' : 'font-semibold text-slate-700'}`}>
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
        <form onSubmit={saveCoupon} className="grid gap-4 md:grid-cols-3">
          <Input label="Code" name="code" defaultValue={editing?.code || ''} required />
          <label className="text-sm font-black text-slate-700">Type
            <select name="discountType" defaultValue={editing?.discountType || 'percentage'} className="mt-2 w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-bold">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
          <Input label="Discount Value" name="discountValue" type="number" defaultValue={editing?.discountValue || ''} required />
          <Input label="Min Order" name="minimumOrderAmount" type="number" defaultValue={editing?.minimumOrderAmount || 0} />
          <Input label="Max Discount" name="maximumDiscountAmount" type="number" defaultValue={editing?.maximumDiscountAmount || ''} />
          <Input label="Usage Limit" name="usageLimit" type="number" defaultValue={editing?.usageLimit || ''} />
          <Input label="Start Date" name="startDate" type="date" defaultValue={editing?.startDate?.slice?.(0, 10) || ''} />
          <Input label="Expiry Date" name="expiryDate" type="date" defaultValue={editing?.expiryDate?.slice?.(0, 10) || ''} />
          <label className="flex items-center gap-2 self-end text-sm font-bold text-slate-600"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive !== false} /> Active</label>
          <Input label="Description" name="description" defaultValue={editing?.description || ''} className="md:col-span-2" />
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
              <select value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })} className="rounded-xl border border-sky-100 px-3 py-2 text-xs font-bold">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </Td>
            <Td><button onClick={() => updateUser(user, { isBlocked: !user.isBlocked })} className={`rounded-full px-3 py-2 text-xs font-extrabold ${user.isBlocked ? 'bg-red-50 text-red-500' : 'bg-green-50 text-brand-green'}`}>{user.isBlocked ? 'Unblock' : 'Block'}</button></Td>
            <Td>{formatDate(user.createdAt)}</Td>
          </tr>
        ))}
      </Table>
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
      <button onClick={onEdit} className="rounded-full bg-sky-50 p-2 text-brand-blue"><Edit3 className="h-4 w-4" /></button>
      <button onClick={onDelete} className="rounded-full bg-red-50 p-2 text-red-500"><Trash2 className="h-4 w-4" /></button>
    </div>
  )
}

function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-sky-100 text-xs uppercase tracking-[0.12em] text-slate-400">
            {headers.map((header) => <th key={header} className="px-3 py-3 font-extrabold">{header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-sky-50">{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children }) {
  return <td className="px-3 py-4 align-middle font-semibold text-slate-600">{children}</td>
}
