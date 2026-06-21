import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  const Icon = category.icon

  return (
    <Link
      to={`/category?category=${category.id}`}
      className="group grid place-items-center gap-3 rounded-md border border-blue-100 bg-white p-5 text-center shadow-[0_14px_38px_rgba(7,87,168,0.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_60px_rgba(7,87,168,0.13)]"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-50 to-green-50 text-brand-blue ring-1 ring-blue-100 transition group-hover:scale-105">
        <Icon className="h-8 w-8" />
      </span>
      <span className="text-sm font-black text-slate-800">{category.title}</span>
    </Link>
  )
}
