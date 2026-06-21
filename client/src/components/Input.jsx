export default function Input({ label, error, as = 'input', className = '', ...props }) {
  const Control = as

  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-black text-slate-800">{label}</span>}
      <Control
        className={`w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none transition focus:border-brand-blue focus:bg-white ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-bold text-red-500">{error}</span>}
    </label>
  )
}
