import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import type { Product } from '../types/database'

/**
 * Hook to fetch a single product by ID.
 * Handles UUID validation, loading state, and error handling.
 */
export function useProduct(id: string | undefined, forEdit = false) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProduct = async () => {
    if (!id) {
      setError('No product ID provided')
      setLoading(false)
      return
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      setError('Invalid product ID format')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await productService.getProductById(id, forEdit)
      if (!data) {
        throw new Error('Product data is null or undefined')
      }
      setProduct(data)
    } catch (err) {
      console.error('Error loading product:', err)
      setError(`Unable to load product: ${err instanceof Error ? err.message : String(err)}`)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [id, forEdit])

  return { product, loading, error, refreshProduct: loadProduct }
}
