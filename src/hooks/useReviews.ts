import { useState, useEffect, useCallback } from 'react'
import { reviewService } from '../services/reviewService'
import type { Review } from '../types/database'

/**
 * Hook to fetch and manage reviews for a specific product.
 * Loads reviews, calculates average rating, and checks review eligibility.
 */
export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [canReview, setCanReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false)
      return
    }

    try {
      const data = await reviewService.getProductReviews(productId)
      setReviews(data.reviews || [])
      setAverageRating(data.averageRating || 0)
    } catch (err) {
      console.warn('Error loading reviews:', err)
      setReviews([])
      setAverageRating(0)
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }

    // Check if current user can review
    try {
      const eligible = await reviewService.canReviewProduct(productId)
      setCanReview(eligible)
    } catch {
      setCanReview(false)
    }
  }, [productId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  return { reviews, averageRating, canReview, loading, error, refreshReviews: loadReviews }
}
