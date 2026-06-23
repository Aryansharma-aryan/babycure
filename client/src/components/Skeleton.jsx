import logo from '../assets/logoBaby.png'

export function BabyCureLoader({ label = 'Loading BabyCure...' }) {
  return (
    <div className="grid min-h-[320px] place-items-center px-4 py-10 text-center">
      <div>
        <div className="mx-auto animate-pulse">
          <div className="mx-auto h-32 w-56 sm:h-40 sm:w-72">
            <img src={logo} alt="Babycure" className="h-full w-full object-contain" />
          </div>
        </div>
        <p className="mt-4 text-sm font-black text-brand-blue">{label}</p>
      </div>
    </div>
  )
}

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
  return <BabyCureLoader />
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => <ProductSkeleton key={index} />)}
    </div>
  )
}

export const LoadingSkeleton = PageSkeleton
