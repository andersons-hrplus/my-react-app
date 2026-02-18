import { useState, useEffect } from 'react'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/database'

/**
 * Hook to fetch all product categories.
 * Used by ProductList (filter dropdown) and ProductForm (category selector).
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await categoryService.getAllCategories()
        setCategories(data)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { categories, loading, error }
}
