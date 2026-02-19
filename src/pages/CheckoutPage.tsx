import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../hooks/useCart'
import { paymentService } from '../services/paymentService'
import type { ShippingAddress } from '../types/database'

export function CheckoutPage() {
  const { user } = useAuth()
  const { activeItems, subtotal, loading: cartLoading } = useCart()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'shipping' | 'review' | 'payment'>('shipping')

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    phone: '',
  })

  const tax = subtotal * 0.08
  const total = subtotal + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  const validateShipping = () => {
    if (!shippingAddress.full_name.trim()) return 'Full name is required'
    if (!shippingAddress.address_line1.trim()) return 'Address is required'
    if (!shippingAddress.city.trim()) return 'City is required'
    if (!shippingAddress.state.trim()) return 'State is required'
    if (!shippingAddress.zip_code.trim()) return 'ZIP code is required'
    return null
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateShipping()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStep('review')
  }

  const handlePayment = async () => {
    setProcessing(true)
    setError(null)

    try {
      // 1. Create order from cart
      const orderResult = await paymentService.createOrder(
        shippingAddress,
        'paypal'
      )

      if (orderResult.error || !orderResult.data) {
        throw new Error(orderResult.error || 'Failed to create order')
      }

      const orderId = orderResult.data

      // 2. Create PayPal checkout via edge function
      const checkoutResult = await paymentService.createPayPalCheckout(orderId)

      if (checkoutResult.error) {
        throw new Error(checkoutResult.error)
      }

      // 3. Redirect to PayPal approval URL
      if (checkoutResult.data?.approvalUrl) {
        window.location.href = checkoutResult.data.approvalUrl
      } else {
        throw new Error('No checkout URL returned from PayPal')
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please sign in to checkout.</p>
      </div>
    )
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (activeItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
          <Link to="/products" className="text-blue-600 dark:text-blue-400 hover:underline">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
          <p className="text-gray-600 dark:text-gray-300">Complete your purchase</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {['shipping', 'review', 'payment'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all ${
                step === s
                  ? 'bg-blue-600 text-white shadow-lg'
                  : ['shipping', 'review', 'payment'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {['shipping', 'review', 'payment'].indexOf(step) > i ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`ml-2 text-sm font-medium capitalize ${
                step === s ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {s}
              </span>
              {i < 2 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-3 ${
                  ['shipping', 'review', 'payment'].indexOf(step) > i
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Form */}
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.full_name}
                      onChange={e => setShippingAddress(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.address_line1}
                      onChange={e => setShippingAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingAddress.address_line2}
                      onChange={e => setShippingAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Apt, Suite, Unit (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={e => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={e => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.zip_code}
                        onChange={e => setShippingAddress(prev => ({ ...prev, zip_code: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={e => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="(optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    to="/cart"
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Back to Cart
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                  >
                    Continue to Review
                  </button>
                </div>
              </form>
            )}

            {/* Review Step */}
            {step === 'review' && (
              <div className="space-y-6">
                {/* Shipping Summary */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping Address</h2>
                    <button
                      onClick={() => setStep('shipping')}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <p className="font-medium">{shippingAddress.full_name}</p>
                    <p>{shippingAddress.address_line1}</p>
                    {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip_code}</p>
                    {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Order Items ({activeItems.length})
                  </h2>
                  <div className="space-y-3">
                    {activeItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice((item.product?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        PayPal Checkout
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        You will be redirected to PayPal to complete your payment securely
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('shipping')}
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay ${formatPrice(total)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal ({activeItems.length} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Free</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax (8%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  SSL Encrypted & Secure
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Buyer Protection Guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
