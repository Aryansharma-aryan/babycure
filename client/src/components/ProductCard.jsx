import { ShoppingCart } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import ProductArt from './ProductArt'
import Rating from './Rating'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <article className="group rounded-md border border-blue-100 bg-white p-4 shadow-[0_18px_55px_rgba(7,87,168,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_28px_85px_rgba(7,87,168,0.16)]">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative grid h-56 place-items-center overflow-hidden rounded-md bg-[radial-gradient(circle_at_50%_30%,rgba(8,160,75,0.10),transparent_32%),linear-gradient(135deg,#f8fcff,#eef7ff)] ring-1 ring-blue-50">
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-brand-green shadow-[0_10px_24px_rgba(8,160,75,0.12)]">
            {product.tag}
          </span>
          <ProductArt type={product.type} color={product.color} />
        </div>
        <h3 className="mt-4 min-h-12 text-[15px] font-black leading-snug text-slate-950">{product.name}</h3>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-black text-slate-950">{formatPrice(product.price)}</p>
          <p className="text-xs font-bold text-slate-400 line-through">{formatPrice(product.oldPrice)}</p>
        </div>
        <Rating rating={product.rating} reviews={product.reviews} />
      </div>
      <button
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-black text-white shadow-[0_14px_32px_rgba(7,87,168,0.20)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
        type="button"
        onClick={() => addToCart(product)}
      >
        Add to Cart <ShoppingCart className="h-4 w-4" />
      </button>
    </article>
  )
}

export default memo(ProductCard)
