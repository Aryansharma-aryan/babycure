import { Heart, Leaf } from 'lucide-react'

function LogoMark({ small = false }) {
  return (
    <div className={`absolute left-1/2 top-1/3 -translate-x-1/2 text-center ${small ? 'scale-75' : ''}`}>
      <Heart className="mx-auto h-8 w-8 text-brand-blue" />
      <p className="text-xs font-black lowercase">
        <span className="text-brand-blue">baby</span><span className="text-brand-green">cure</span>
      </p>
    </div>
  )
}

export default function ProductArt({ type = 'pump', color = 'green', large = false }) {
  const accent = color === 'blue' ? 'bg-brand-blue' : color === 'gold' ? 'bg-amber-300' : 'bg-brand-green'

  if (type === 'wipes') {
    return (
      <div className={`${large ? 'h-52 w-72' : 'h-24 w-36'} relative rounded-md border border-green-100 bg-white shadow-xl shadow-slate-100`}>
        <div className="absolute inset-3 rounded-md bg-green-50" />
        <Leaf className="absolute left-5 top-5 h-8 w-8 text-brand-green" />
        <span className="absolute bottom-5 left-5 text-xs font-black text-brand-blue">babycure wipes</span>
      </div>
    )
  }

  if (type === 'tube') {
    return (
      <div className={`${large ? 'h-64 w-32' : 'h-32 w-16'} relative overflow-hidden rounded-b-3xl rounded-t-md border border-slate-200 bg-white shadow-xl shadow-slate-100`}>
        <div className={`h-8 ${accent}`} />
        <LogoMark small={!large} />
        <span className="absolute bottom-5 left-1/2 h-10 w-14 -translate-x-1/2 rounded-full bg-green-100" />
      </div>
    )
  }

  return (
    <div className={`${large ? 'h-80 w-40' : 'h-36 w-20'} relative rounded-b-[34px] rounded-t-xl border border-slate-200 bg-white shadow-xl shadow-slate-100`}>
      <div className={`absolute left-1/2 top-0 h-10 w-14 -translate-x-1/2 -translate-y-7 rounded-t-md ${accent}`} />
      {type === 'pump' && <div className={`absolute left-1/2 top-0 h-5 w-20 -translate-x-1/2 -translate-y-11 rounded-t ${accent}`} />}
      <LogoMark small={!large} />
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1">
        <span className="h-8 w-4 rounded-full bg-green-100" />
        <span className="h-10 w-5 rounded-full bg-brand-green/20" />
        <span className="h-7 w-4 rounded-full bg-green-100" />
      </div>
    </div>
  )
}
