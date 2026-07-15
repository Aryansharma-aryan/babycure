import { Link } from 'react-router-dom'

const styles = {
  primary: 'border border-sky-300/30 bg-[linear-gradient(135deg,#2799d3,#4aa6d9_56%,#65b7e2)] text-white shadow-[0_14px_28px_rgba(25,132,190,0.24),0_5px_12px_rgba(74,166,217,0.20)] hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_22px_42px_rgba(25,132,190,0.30),0_8px_18px_rgba(74,166,217,0.20)] active:translate-y-0',
  green: 'border border-green-300/30 bg-[linear-gradient(135deg,#64af5c,#7cc576_55%,#9ad792)] text-white shadow-[0_14px_28px_rgba(79,158,72,0.22),0_5px_12px_rgba(124,197,118,0.18)] hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_22px_42px_rgba(79,158,72,0.28),0_8px_18px_rgba(124,197,118,0.18)] active:translate-y-0',
  outline: 'border border-brand-green/40 bg-white/92 text-brand-green shadow-[0_10px_24px_rgba(124,197,118,0.10)] hover:-translate-y-1 hover:border-brand-green hover:bg-brand-leaf hover:shadow-[0_18px_36px_rgba(124,197,118,0.16)] active:translate-y-0',
  ghost: 'bg-white text-brand-blue ring-1 ring-sky-100 shadow-[0_10px_24px_rgba(74,166,217,0.08)] hover:-translate-y-1 hover:bg-brand-mist hover:shadow-[0_18px_36px_rgba(74,166,217,0.14)] active:translate-y-0',
}

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black tracking-[0.01em] transition duration-300 ease-out focus-visible:outline focus-visible:outline-4 focus-visible:outline-green-100 disabled:translate-y-0 disabled:opacity-60 ${styles[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
