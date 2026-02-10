import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProductForm } from '../components/ProductForm'
import { productService } from '../services/productService'
import { useAuth } from '../contexts/AuthContext'
import type { Product } from '../types/database'

export function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isSeller } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSeller()) {
      navigate('/dashboard')
      return
    }

    if (id) {
      loadProduct()
    }
  }, [id, isSeller, navigate])

  const loadProduct = async () => {
    if (!id) return

    try {
      setLoading(true)
      const productData = await productService.getProductById(id, true) // forEdit = true
      
      // Check if user owns this product
      if (productData.seller_id !== user?.id) {
        setError('You can only edit your own products')
        return
      }

      setProduct(productData)
      setError('')
    } catch (err) {
      console.error('Error loading product:', err)
      setError('Product not found or unable to load')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    navigate('/seller/products')
  }

  if (!isSeller()) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8 max-w-md mx-4">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/seller/products')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Back to My Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8 max-w-md mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The product you're trying to edit could not be found.</p>
            <button
              onClick={() => navigate('/seller/products')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Back to My Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <ProductForm product={product} onSuccess={handleSuccess} />
    </div>
  )
}