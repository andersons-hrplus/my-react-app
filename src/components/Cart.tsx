import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'
import type { CartItem } from '../types/database'

export function Cart() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadCart = async () => {
    if (!user) return

    try {
      setLoading(true)
      const items = await cartService.getCartItems()
      setCartItems(items)
      setError('')
    } catch (err) {
      console.error('Error loading cart:', err)
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [user])

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      setUpdating(cartItemId)
      const result = await cartService.updateCartItemQuantity(cartItemId, newQuantity)
      
      if (result.error) {
        setError(result.error)
      } else {
        await loadCart() // Reload cart to get updated data
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      setUpdating(cartItemId)
      const result = await cartService.removeFromCart(cartItemId)
      
      if (result.error) {
        setError(result.error)
      } else {
        await loadCart() // Reload cart to remove item
      }
    } catch (err) {
      console.error('Error removing item:', err)
      setError('Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      setLoading(true)
      const result = await cartService.clearCart()
      
      if (result.error) {
        setError(result.error)
      } else {
        setCartItems([])
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('Failed to clear cart')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      if (item.product && item.product.is_active) {
        return sum + (item.product.price * item.quantity)
      }
      return sum
    }, 0)
  }

  const activeItems = cartItems.filter(item => item.product?.is_active)
  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart</h2>
        <p className="text-gray-600 mb-6">Please sign in to view your cart.</p>
        <Link
          to="/auth"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart.</p>
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                {item.product ? (
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link to={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      {(item.product.brand || item.product.model) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.brand} {item.product.model}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id || item.quantity <= 1}
                              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 border-x border-gray-300 bg-white min-w-[3rem] text-center">
                              {updating === item.id ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id || item.quantity >= (item.product?.stock_quantity || 0)}
                              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating === item.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-gray-600">
                              {formatPrice(item.product.price)} each
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Availability Warning */}
                      {!item.product.is_active && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          This item is no longer available
                        </div>
                      )}
                      
                      {item.product.is_active && item.quantity > item.product.stock_quantity && (
                        <div className="mt-3 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                          Only {item.product.stock_quantity} items in stock
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Product not found</div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({activeItems.length} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={activeItems.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}