import { useEffect } from 'react'
import toast, { Toaster, ToastBar, useToasterStore } from 'react-hot-toast'
import { X } from 'lucide-react'

export default function ToastManager() {
  const { toasts } = useToasterStore()
  useEffect(() => {
    toasts.filter((item) => item.visible).slice(3).forEach((item) => toast.dismiss(item.id))
  }, [toasts])
  return (
    <Toaster position="top-center" gutter={8} containerStyle={{ top: 20 }} toastOptions={{
      duration: 3200,
      style: { borderRadius: '12px', border: '1px solid #e2e8f0', color: '#17324D', fontWeight: 600, fontSize: '14px', padding: '12px 16px', maxWidth: 'min(420px, calc(100vw - 32px))', boxShadow: '0 8px 30px rgba(23,50,77,0.12)' },
      className: 'baby-toast',
      ariaProps: { role: 'status', 'aria-live': 'polite' },
      success: { iconTheme: { primary: '#64af5c', secondary: '#ffffff' } },
      error: { duration: 4500 },
    }}>
      {(notification) => <ToastBar toast={notification}>{({ icon, message }) => <>{icon}{message}{notification.type !== 'loading' && <button type="button" onClick={() => toast.dismiss(notification.id)} aria-label="Dismiss notification" className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2"><X className="h-4 w-4" /></button>}</>}</ToastBar>}
    </Toaster>
  )
}
