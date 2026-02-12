import { supabase } from '../lib/supabase'
import type { Review, ReviewFormData, ApiResponse } from '../types/database'

export const reviewService = {
  // Get reviews for a product
  async getProductReviews(productId: string, page = 1, limit = 10): Promise<{
    reviews: Review[];
    totalCount: number;
    averageRating: number;
  }> {
    if (!supabase) throw new Error('Supabase not configured')

    // Get reviews with pagination
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('reviews')
      .select(`
        *
      `, { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (reviewsError) throw reviewsError

    // Fetch reviewer profiles separately
    const reviewsWithProfiles = await Promise.all(
      (reviews || []).map(async (review) => {
        if (!supabase) throw new Error('Supabase client not initialized')
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', review.reviewer_id)
          .single()
        
        return {
          ...review,
          reviewer: profile
        }
      })
    )

    // Calculate average rating
    const { data: ratingData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    const averageRating = ratingData && ratingData.length > 0
      ? ratingData.reduce((sum, review) => sum + review.rating, 0) / ratingData.length
      : 0

    return {
      reviews: reviewsWithProfiles,
      totalCount: count || 0,
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
    }
  },

  // Get user's reviews
  async getUserReviews(): Promise<Review[]> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        product:products(id, name, images, brand, model)
      `)
      .eq('reviewer_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create a new review (buyers only)
  async createReview(productId: string, reviewData: ReviewFormData): Promise<ApiResponse<Review>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    // Verify user is a buyer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', userData.user.id)
      .single()

    if (profile?.user_role !== 'buyer') {
      return { error: 'Only buyers can write reviews' }
    }

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('reviewer_id', userData.user.id)
      .single()

    if (existingReview) {
      return { error: 'You have already reviewed this product' }
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        reviewer_id: userData.user.id,
        verified_purchase: true, // Set to true by default for now
        ...reviewData
      })
      .select('*')
      .single()

    if (error) return { error: error.message }
    
    // Fetch reviewer profile separately
    const { data: reviewerProfile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', userData.user.id)
      .single()

    const transformedData = data ? {
      ...data,
      reviewer: reviewerProfile
    } : null

    return { data: transformedData }
  },

  // Update a review (own reviews only)
  async updateReview(reviewId: string, reviewData: Partial<ReviewFormData>): Promise<ApiResponse<Review>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', reviewId)
      .eq('reviewer_id', userData.user.id) // Ensure user owns the review
      .select('*')
      .single()

    if (error) return { error: error.message }
    
    // Fetch reviewer profile separately
    const { data: reviewerProfile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', userData.user.id)
      .single()

    const transformedData = data ? {
      ...data,
      reviewer: reviewerProfile
    } : null

    return { data: transformedData }
  },

  // Delete a review (own reviews only)
  async deleteReview(reviewId: string): Promise<ApiResponse<boolean>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('reviewer_id', userData.user.id) // Ensure user owns the review

    if (error) return { error: error.message }
    return { data: true }
  },

  // Check if user can review a product
  async canReviewProduct(productId: string): Promise<boolean> {
    if (!supabase) return false

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return false

    // Check if user is a buyer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', userData.user.id)
      .single()

    if (profile?.user_role !== 'buyer') return false

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('reviewer_id', userData.user.id)
      .single()

    return !existingReview
  },

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<ApiResponse<boolean>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase
      .rpc('increment_helpful_count', { review_id: reviewId })

    if (error) return { error: error.message }
    return { data: true }
  }
}