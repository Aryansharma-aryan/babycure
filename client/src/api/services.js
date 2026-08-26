import { api, buildQuery } from './client'

export const authService = {
  me: () => api.get('/auth/me'),
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  sendPasswordResetOtp: (payload) => api.post('/auth/password/forgot', payload),
  resetPassword: (payload) => api.post('/auth/password/reset', payload),
  updateProfile: (payload) => api.patch('/auth/me', payload),
}

export const categoryService = {
  list: (params) => api.get(`/categories${buildQuery(params)}`),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
}

export const productService = {
  list: (params) => api.get(`/products${buildQuery(params)}`),
  get: (id) => api.get(`/products/${id}`),
  // Leave the Content-Type to the browser/Axios so it includes the multipart
  // boundary required for product image uploads.
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  reviews: (id) => api.get(`/products/${id}/reviews`),
  createReview: (id, payload) => api.post(`/products/${id}/reviews`, payload),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
}

export const cartService = {
  get: () => api.get('/cart'),
  add: (payload) => api.post('/cart/add', payload),
  update: (productId, payload) => api.put(`/cart/update/${productId}`, payload),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
}

export const addressService = {
  list: () => api.get('/addresses'),
  create: (payload) => api.post('/addresses', payload),
  update: (id, payload) => api.put(`/addresses/${id}`, payload),
  remove: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`),
}

export const orderService = {
  create: (payload) => api.post('/orders', payload),
  mine: () => api.get('/orders/my-orders'),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  invoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
  tracking: (id) => api.get(`/orders/${id}/tracking`),
  adminAll: () => api.get('/orders/admin/all'),
  adminInvoice: (id) => api.get(`/orders/admin/${id}/invoice`, { responseType: 'blob' }),
  adminStatus: (id, payload) => api.patch(`/orders/admin/${id}/status`, payload),
  adminDelivery: (id, payload) => api.patch(`/orders/admin/${id}/delivery`, payload),
}

export const shiprocketService = {
  createShipment: (orderId) => api.post(`/shiprocket/create-shipment/${orderId}`),
  assignAwb: (orderId) => api.post(`/shiprocket/assign-awb/${orderId}`),
  generateLabel: (orderId) => api.post(`/shiprocket/generate-label/${orderId}`),
  schedulePickup: (orderId) => api.post(`/shiprocket/schedule-pickup/${orderId}`),
  track: (orderId) => api.get(`/shiprocket/track/${orderId}`),
}

export const paymentService = {
  createRazorpayOrder: (payload) => api.post('/payments/razorpay/order', payload),
  verifyRazorpayPayment: (payload) => api.post('/payments/razorpay/verify', payload),
}

export const returnRequestService = {
  mine: (params) => api.get(`/returns/my-requests${buildQuery(params)}`),
  createReturn: (orderId, payload) => api.post(`/returns/orders/${orderId}/return`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createReplacement: (orderId, payload) => api.post(`/returns/orders/${orderId}/replacement`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminAll: (params) => api.get(`/returns/admin/all${buildQuery(params)}`),
  updateStatus: (id, payload) => api.patch(`/returns/admin/${id}/status`, payload),
  approve: (id, payload) => api.patch(`/returns/admin/${id}/approve`, payload),
  reject: (id, payload) => api.patch(`/returns/admin/${id}/reject`, payload),
  close: (id, payload) => api.patch(`/returns/admin/${id}/close`, payload),
  createReturnPickup: (id) => api.post(`/returns/admin/${id}/return-pickup`),
  trackReturn: (id) => api.get(`/returns/admin/${id}/track-return`),
  initiateRefund: (id, payload) => api.post(`/returns/admin/${id}/refund`, payload),
  createReplacementShipment: (id) => api.post(`/returns/admin/${id}/replacement-shipment`),
}

export const wishlistService = {
  get: () => api.get('/wishlist'),
  toggleAdd: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  clear: () => api.delete('/wishlist'),
}

export const couponService = {
  apply: (payload) => api.post('/coupons/apply', payload),
  list: () => api.get('/coupons'),
  create: (payload) => api.post('/coupons', payload),
  update: (id, payload) => api.put(`/coupons/${id}`, payload),
  remove: (id) => api.delete(`/coupons/${id}`),
}

export const contactService = {
  create: (payload) => api.post('/contact', payload),
}

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  contactInquiries: () => api.get('/admin/contact-inquiries'),
  updateContactInquiry: (id, payload) => api.patch(`/admin/contact-inquiries/${id}`, payload),
  deleteContactInquiry: (id) => api.delete(`/admin/contact-inquiries/${id}`),
  users: () => api.get('/admin/users'),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteAllUsers: () => api.delete('/admin/users'),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  deleteAllOrders: () => api.delete('/admin/orders'),
}

export const notificationService = {
  mine: () => api.get('/notifications'),
  read: (id) => api.patch(`/notifications/${id}/read`),
}
