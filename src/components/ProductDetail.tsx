import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'
import { useProduct } from '../hooks/useProduct'
import { useReviews } from '../hooks/useReviews'
import { ReviewForm } from './ReviewForm'
import { ReviewCard } from './ReviewCard'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, isBuyer } = useAuth()
  const { product, loading, error } = useProduct(id)
  const { reviews, averageRating, canReview, refreshReviews } = useReviews(id)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)

  const handleReviewSuccess = () => {
    setReviewFormOpen(false)
    refreshReviews()
  }

  const handleAddToCart = async () => {
    if (!user) {
      setCartMessage('Please sign in to add items to cart')
      return
    }

    if (!product) return

    setAddingToCart(true)
    setCartMessage('')

    try {
      const result = await cartService.addToCart(product.id)
      if (result.error) {
        setCartMessage(result.error)
      } else {
        setCartMessage('Added to cart!')
        setTimeout(() => setCartMessage(''), 3000)
      }
    } catch (error) {
      setCartMessage('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <>
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            {(product.brand || product.model) && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                {product.brand} {product.model}
              </p>
            )}
            
            {/* Year Range */}
            {(product.year_from || product.year_to) && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Fits: {product.year_from} {product.year_to && product.year_from !== product.year_to && `- ${product.year_to}`}
              </p>
            )}

            {/* Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{renderStars(averageRating)}</div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Price and Availability */}
          <div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {formatPrice(product.price)}
            </div>
            <div className={`text-lg font-medium mb-4 ${product.stock_quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {product.stock_quantity > 0 ? (
                `${product.stock_quantity} in stock`
              ) : (
                'Out of stock'
              )}
            </div>
          </div>

          {/* Condition and Category */}
          <div className="flex gap-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
              product.condition === 'new' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              product.condition === 'used' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
            }`}>
              {product.condition}
            </span>
            {product.category && (
              <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Part Number */}
          {product.part_number && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Part Number: <span className="font-mono">{product.part_number}</span>
            </div>
          )}

          {/* Add to Cart */}
          {user && user.id !== product.seller_id && product.stock_quantity > 0 && (
            <div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
              
              {cartMessage && (
                <p className={`mt-2 text-sm text-center ${cartMessage.includes('Added') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {cartMessage}
                </p>
              )}
            </div>
          )}

          {/* Seller Info */}
          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Seller Information</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sold by <span className="font-medium">{product.seller?.full_name || 'Unknown'}</span>
            </p>
            {product.seller?.email && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{product.seller.email}</p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{key}</span>
                    <span className="text-gray-600 dark:text-gray-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t dark:border-gray-700 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
          
          {canReview && (
            <button
              onClick={() => setReviewFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Write Review
            </button>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onReviewUpdated={refreshReviews}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {reviewFormOpen && (
        <ReviewForm 
          productId={product.id}
          onSuccess={handleReviewSuccess}
          onCancel={() => setReviewFormOpen(false)}
        />
      )}
    </div>
  )
}