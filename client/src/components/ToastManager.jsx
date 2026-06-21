import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const welcomeToasts = [
  { type: 'success', text: 'Welcome to Babycure - gentle care for happy babies' },
  { text: 'Try our Gentle Baby Wash for soft everyday cleansing' },
  { text: 'Natural lotion, wipes and diaper care made for delicate skin' },
  { text: 'Special baby-care bundle offers are available today' },
  { text: 'Add your favourites to cart and checkout smoothly' },
]

export default function ToastManager() {
  useEffect(() => {
    const storageKey = 'babycure-welcome-seen-v3'
    if (localStorage.getItem(storageKey)) return

    localStorage.setItem(storageKey, 'true')
    const timers = welcomeToasts.map((message, index) =>
      window.setTimeout(() => {
        if (message.type === 'success') {
          toast.success(message.text)
          return
        }
        toast(message.text, { icon: index % 2 === 0 ? 'B' : 'Care' })
      }, index * 950),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2800,
        style: {
          borderRadius: '10px',
          border: '1px solid #cfe3f7',
          color: '#0f172a',
          fontWeight: 800,
          padding: '14px 16px',
          boxShadow: '0 24px 70px rgba(7, 87, 168, 0.16)',
        },
        className: 'baby-toast',
        success: {
          iconTheme: {
            primary: '#08a04b',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
