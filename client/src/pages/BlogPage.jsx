import BlogCard from '../components/BlogCard'
import PageHeader from '../components/PageHeader'
import { articles } from '../data/products'

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader eyebrow="Journal" title="Blog and Tips" copy="Parent-friendly care articles presented as a premium editorial page." backTo="/" backLabel="Back to home" />
      <div className="grid gap-6 lg:grid-cols-3">
        {articles.map((article) => <BlogCard key={article.id} article={article} />)}
      </div>
    </section>
  )
}
