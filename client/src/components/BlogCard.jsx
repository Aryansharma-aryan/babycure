import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BlogCard({ article }) {
  return (
    <article className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
      <img src={article.image} alt={article.title} className="h-64 w-full object-cover" loading="lazy" />
      <div className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-green">{article.date}</p>
        <h3 className="mt-3 font-display text-2xl font-black leading-tight text-slate-950">{article.title}</h3>
        <p className="mt-3 font-medium leading-7 text-slate-600">{article.copy}</p>
        <Link to="/blog" className="mt-5 inline-flex items-center text-sm font-black text-brand-blue">
          Read More <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
