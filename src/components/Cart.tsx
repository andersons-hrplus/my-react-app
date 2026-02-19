import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../hooks/useCart'

export function Cart() {
  const { user } = useAuth()
  const {
    cartItems,
    activeItems,
    loading,
    updating,
    error,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return
    await clearCart()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Cart</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Please sign in to view your cart.</p>
        <Link
          to="/auth"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          >
            Clear Cart
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start shopping to add items to your cart.</p>
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                {item.product ? (
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link to={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      {(item.product.brand || item.product.model) && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.product.brand} {item.product.model}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id || item.quantity <= 1}
                              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-w-[3rem] text-center text-gray-900 dark:text-white">
                              {updating === item.id ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id || item.quantity >= (item.product?.stock_quantity || 0)}
                              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating === item.id}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatPrice(item.product.price)} each
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Availability Warning */}
                      {!item.product.is_active && (
                        <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                          This item is no longer available
                        </div>
                      )}
                      
                      {item.product.is_active && item.quantity > item.product.stock_quantity && (
                        <div className="mt-3 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-lg">
                          Only {item.product.stock_quantity} items in stock
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">Product not found</div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal ({activeItems.length} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t dark:border-gray-600 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className={`block w-full text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6 ${activeItems.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors mt-3"
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