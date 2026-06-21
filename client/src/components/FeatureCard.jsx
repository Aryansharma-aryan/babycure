export default function FeatureCard({ icon: Icon, title, copy, dark = false }) {
  return (
    <div className={`flex items-center gap-3 rounded-md border px-5 py-4 transition duration-300 hover:-translate-y-0.5 ${dark ? 'border-white/15 bg-white/10' : 'border-blue-100 bg-white shadow-[0_14px_38px_rgba(7,87,168,0.06)] hover:shadow-[0_20px_55px_rgba(7,87,168,0.12)]'}`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${dark ? 'bg-white text-brand-blue' : 'bg-green-50 text-brand-green'}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h4 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-950'}`}>{title}</h4>
        <p className={`text-xs font-semibold ${dark ? 'text-blue-100' : 'text-slate-500'}`}>{copy}</p>
      </div>
    </div>
  )
}
