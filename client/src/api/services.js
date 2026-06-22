import { api, buildQuery } from './client'

export const authService = {
  me: () => api.get('/auth/me'),
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  sendPhoneOtp: (payload) => api.post('/auth/send-phone-otp', payload),
  verifyPhoneOtp: (payload) => api.post('/auth/verify-phone-otp', payload),
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
  create: (payload) => api.post('/products', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, payload) => api.put(`/products/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
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
  tracking: (id) => api.get(`/orders/${id}/tracking`),
  adminAll: () => api.get('/orders/admin/all'),
  adminStatus: (id, payload) => api.patch(`/orders/admin/${id}/status`, payload),
  adminDelivery: (id, payload) => api.patch(`/orders/admin/${id}/delivery`, payload),
}

export const paymentService = {
  createRazorpayOrder: (orderId) => api.post('/payments/razorpay/order', { orderId }),
  verifyRazorpayPayment: (payload) => api.post('/payments/razorpay/verify', payload),
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

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  users: () => api.get('/admin/users'),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
}

export const notificationService = {
  mine: () => api.get('/notifications'),
  read: (id) => api.patch(`/notifications/${id}/read`),
}
