import { Link } from 'react-router-dom'

const styles = {
  primary: 'bg-brand-blue text-white shadow-[0_16px_38px_rgba(74,166,217,0.24)] hover:-translate-y-1 hover:bg-sky-500 hover:shadow-[0_22px_54px_rgba(74,166,217,0.30)] active:translate-y-0',
  green: 'bg-brand-green text-white shadow-[0_16px_38px_rgba(124,197,118,0.24)] hover:-translate-y-1 hover:bg-green-400 hover:shadow-[0_22px_54px_rgba(124,197,118,0.30)] active:translate-y-0',
  outline: 'border border-brand-green/45 bg-white text-brand-green shadow-[0_12px_30px_rgba(124,197,118,0.10)] hover:-translate-y-1 hover:border-brand-green hover:bg-brand-leaf hover:shadow-[0_18px_44px_rgba(124,197,118,0.18)] active:translate-y-0',
  ghost: 'bg-white text-brand-blue ring-1 ring-sky-100 shadow-[0_12px_30px_rgba(74,166,217,0.08)] hover:-translate-y-1 hover:bg-brand-mist hover:shadow-[0_18px_44px_rgba(74,166,217,0.15)] active:translate-y-0',
}

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black transition duration-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-green-100 disabled:translate-y-0 disabled:opacity-60 ${styles[variant]} ${className}`

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
