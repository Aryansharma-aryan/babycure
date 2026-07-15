import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BlogCard({ article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_38px_rgba(23,50,77,.07)] transition duration-300 hover:-translate-y-1 hover:border-brand-blue/35 hover:shadow-[0_20px_50px_rgba(23,50,77,.13)]">
      <div className="overflow-hidden"><img src={article.image} alt={article.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></div>
      <div className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-green">{article.date}</p>
        <h3 className="mt-3 font-display text-xl font-black leading-tight text-slate-950">{article.title}</h3>
        <p className="mt-3 font-medium leading-7 text-slate-600">{article.copy}</p>
        <Link to="/blog" className="mt-5 inline-flex items-center text-sm font-black text-brand-blue">
          Read More <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
