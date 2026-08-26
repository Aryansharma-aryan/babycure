import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://babycure.onrender.com/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
})

export const resolveMediaUrl = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '')
  const normalized = String(url).replace(/\\/g, '/')
  const uploadIndex = normalized.indexOf('/uploads/')
  if (uploadIndex >= 0) return `${apiOrigin}${normalized.slice(uploadIndex)}`
  return `${apiOrigin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'

    const isAuthenticationFailure = status === 401 && /authentication required|session has expired|invalid token|login again|user linked to this token/i.test(message)

    if (isAuthenticationFailure) {
      window.dispatchEvent(new CustomEvent('babycure:unauthorized'))
    }

    return Promise.reject({ status, message, data: error.response?.data })
  },
)

export function buildQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}
