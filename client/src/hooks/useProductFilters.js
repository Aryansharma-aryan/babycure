import { useMemo, useState } from 'react'

export function useProductFilters(products) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [price, setPrice] = useState('all')
  const [rating, setRating] = useState('all')
  const [sort, setSort] = useState('popular')

  const filteredProducts = useMemo(() => {
    let result = [...products]
    const normalizedQuery = query.trim().toLowerCase()

    if (normalizedQuery) {
      result = result.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
    }

    if (category !== 'all') {
      result = result.filter((product) => product.category === category)
    }

    if (price !== 'all') {
      const [min, max] = price.split('-').map(Number)
      result = result.filter((product) => product.price >= min && product.price <= max)
    }

    if (rating !== 'all') {
      result = result.filter((product) => product.rating >= Number(rating))
    }

    if (sort === 'low') result.sort((a, b) => a.price - b.price)
    if (sort === 'high') result.sort((a, b) => b.price - a.price)
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)

    return result
  }, [category, price, products, query, rating, sort])

  return {
    query,
    setQuery,
    category,
    setCategory,
    price,
    setPrice,
    rating,
    setRating,
    sort,
    setSort,
    filteredProducts,
  }
}
