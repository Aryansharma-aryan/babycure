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
    const storageKey = 'babycure-welcome-seen-v4'
    if (localStorage.getItem(storageKey)) return

    localStorage.setItem(storageKey, 'true')
    const timers = welcomeToasts.map((message, index) =>
      window.setTimeout(() => {
        if (message.type === 'success') {
          toast.success(message.text)
          return
        }
        toast(message.text, { icon: index % 2 === 0 ? '🧴' : '💚' })
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
          borderRadius: '18px',
          border: '1px solid #d8eefb',
          color: '#17324D',
          fontWeight: 800,
          padding: '15px 17px',
          boxShadow: '0 24px 70px rgba(74, 166, 217, 0.18)',
        },
        className: 'baby-toast',
        success: {
          iconTheme: {
            primary: '#7CC576',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
