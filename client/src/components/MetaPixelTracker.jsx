import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PIXEL_ID = '2065869137382863'

export default function MetaPixelTracker() {
  const location = useLocation()

  useEffect(() => {
    if (!window.fbq) {
      const fbq = function (...args) {
        if (fbq.callMethod) fbq.callMethod(...args)
        else fbq.queue.push(args)
      }
      fbq.queue = []
      fbq.loaded = true
      fbq.version = '2.0'
      window.fbq = fbq
      window._fbq = fbq

      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      document.head.appendChild(script)
      fbq('init', PIXEL_ID)
    }

    window.fbq('track', 'PageView')
  }, [location.pathname, location.search, location.hash])

  return null
}
