import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'
import { productService } from '../services/productService'
import type { Product } from '../types/database'

interface ProductCardProps {
  product: Product
  onAddedToCart?: () => void
  onProductUpdated?: () => void
}

export function ProductCard({ product, onAddedToCart, onProductUpdated }: ProductCardProps) {
  const { user } = useAuth()
  const [addingToCart, setAddingToCart] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')

  const isOwner = user && user.id === product.seller_id

  const handleAddToCart = async () => {
    if (!user) {
      setMessage('Please sign in to add items to cart')
      return
    }

    setAddingToCart(true)
    setMessage('')

    try {
      const result = await cartService.addToCart(product.id)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Added to cart!')
        onAddedToCart?.()
        setTimeout(() => setMessage(''), 2000)
      }
    } catch (error) {
      setMessage('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setMessage('')

    try {
      const result = await productService.deleteProduct(product.id)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Product deleted successfully')
        onProductUpdated?.()
      }
    } catch (error) {
      setMessage('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'used':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'refurbished':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 dark:border-gray-700 overflow-hidden group">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getConditionColor(product.condition)}`}>
              {product.condition}
            </span>
            {product.featured && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                Featured
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Brand and Model */}
        {(product.brand || product.model) && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            {product.brand && (
              <span className="font-medium">{product.brand}</span>
            )}
            {product.brand && product.model && (
              <span className="mx-1">•</span>
            )}
            {product.model && (
              <span>{product.model}</span>
            )}
          </div>
        )}

        {/* Year Range */}
        {(product.year_from || product.year_to) && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Fits: {product.year_from} {product.year_to && product.year_from !== product.year_to && `- ${product.year_to}`}
          </div>
        )}

        {/* Category */}
        {product.category && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {product.category.name}
          </div>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Sold by {product.seller?.full_name || 'Unknown'}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isOwner ? (
            <>
              <Link
                to={`/products/${product.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                View
              </Link>
              <Link
                to={`/seller/products/${product.id}/edit`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Delete Product"
              >
                {deleting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                to={`/products/${product.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                View
              </Link>
              {user && product.stock_quantity > 0 && (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all"
                >
                  {addingToCart ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Adding…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add to Cart
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-2 text-sm text-center ${message.includes('Added') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}