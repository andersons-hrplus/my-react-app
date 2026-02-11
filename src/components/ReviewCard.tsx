import { useState } from 'react'
import { reviewService } from '../services/reviewService'
import { useAuth } from '../contexts/AuthContext'
import { ReviewEditForm } from './ReviewEditForm'
import type { Review } from '../types/database'

interface ReviewCardProps {
  review: Review
  onReviewUpdated?: () => void
}

export function ReviewCard({ review, onReviewUpdated }: ReviewCardProps) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showFullComment, setShowFullComment] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isMyReview = user && review.reviewer_id === user.id
  const canMarkHelpful = user && !isMyReview && profile?.user_role === 'buyer'

  const handleMarkHelpful = async () => {
    if (!canMarkHelpful || loading) return

    setLoading(true)
    try {
      const result = await reviewService.markHelpful(review.id)
      if (!result.error && onReviewUpdated) {
        onReviewUpdated()
      }
    } catch (error) {
      console.error('Error marking review helpful:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async () => {
    setLoading(true)
    try {
      const result = await reviewService.deleteReview(review.id)
      if (!result.error && onReviewUpdated) {
        onReviewUpdated()
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    if (onReviewUpdated) {
      onReviewUpdated()
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const shouldTruncateComment = (review.comment?.length || 0) > 300
  const displayComment = showFullComment || !shouldTruncateComment 
    ? (review.comment || '') 
    : (review.comment?.slice(0, 300) || '') + '...'

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Reviewer Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {(review.reviewer?.full_name || 'Anonymous')[0].toUpperCase()}
              </span>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {review.reviewer?.full_name || 'Anonymous'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>

          {/* Rating and Title */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {review.rating} out of 5 stars
              </span>
            </div>
            <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
              {review.title}
            </h5>
          </div>
        </div>

        {/* Review Badge and Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isMyReview && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit Review"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Delete Review"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Your Review
              </span>
            </>
          )}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {displayComment}
          </p>
          {shouldTruncateComment && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {showFullComment ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Helpful count */}
        <div className="flex items-center gap-4">
          {review.helpful_count > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
            </span>
          )}
        </div>

        {/* Helpful button */}
        {canMarkHelpful && (
          <button
            onClick={handleMarkHelpful}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            )}
            Helpful
          </button>
        )}
      </div>
      </div>

      {/* Edit Form Modal */}
      {isEditing && (
        <ReviewEditForm 
          review={review}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Review</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}