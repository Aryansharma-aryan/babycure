import { Star } from 'lucide-react'

export default function Rating({ rating, reviews }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`h-4 w-4 ${index < Math.round(rating) ? 'fill-current' : ''}`} />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-500">({reviews})</span>
    </div>
  )
}
