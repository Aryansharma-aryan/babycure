import { Link } from 'react-router-dom'

const styles = {
  primary: 'bg-brand-blue text-white shadow-[0_14px_34px_rgba(7,87,168,0.20)] hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0',
  green: 'bg-brand-green text-white shadow-[0_14px_34px_rgba(8,160,75,0.20)] hover:-translate-y-0.5 hover:bg-green-700 active:translate-y-0',
  outline: 'border border-brand-green bg-white text-brand-green shadow-[0_10px_26px_rgba(8,160,75,0.08)] hover:-translate-y-0.5 hover:bg-green-50 active:translate-y-0',
  ghost: 'bg-white text-brand-blue ring-1 ring-blue-100 shadow-[0_10px_26px_rgba(7,87,168,0.06)] hover:-translate-y-0.5 hover:bg-blue-50 active:translate-y-0',
}

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-black transition duration-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-green-100 ${styles[variant]} ${className}`

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
