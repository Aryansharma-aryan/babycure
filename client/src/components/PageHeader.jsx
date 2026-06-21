import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './Button'

export default function PageHeader({ eyebrow, title, copy, backTo, backLabel = 'Back' }) {
  return (
    <div className="mb-7">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
        <Link to="/" className="text-brand-blue">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">{eyebrow || title}</span>
      </div>
      {backTo && (
        <Button to={backTo} variant="ghost" className="mb-5 px-4 py-2">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Button>
      )}
      {eyebrow && <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-brand-green">{eyebrow}</p>}
      <h1 className="font-display text-4xl font-black leading-tight text-slate-950 md:text-5xl">{title}</h1>
      {copy && <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600">{copy}</p>}
    </div>
  )
}
