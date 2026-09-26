const KEY = 'babycure:recently-viewed'
export const RECENTLY_VIEWED_EVENT = 'babycure:recently-viewed-changed'

export function readRecentlyViewed() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,160}$/.test(id)))].slice(0, 8)
      : []
  } catch { return [] }
}

export function rememberProduct(product) {
  const id = product?._id || product?.id || product?.slug
  if (!id || typeof id !== 'string') return
  try {
    localStorage.setItem(KEY, JSON.stringify([id, ...readRecentlyViewed().filter((item) => item !== id)].slice(0, 8)))
    window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT))
  } catch { /* Browsing still works when browser storage is unavailable. */ }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT))
}
