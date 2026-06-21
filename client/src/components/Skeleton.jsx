export function ProductSkeleton() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-56 animate-pulse rounded-md bg-slate-100" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-10 animate-pulse rounded bg-slate-100" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="h-8 w-56 animate-pulse rounded bg-slate-100" />
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <ProductSkeleton key={index} />)}
      </div>
    </div>
  )
}

export const LoadingSkeleton = PageSkeleton
