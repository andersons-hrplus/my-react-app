import { Link, useSearchParams } from 'react-router-dom'

export function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 text-center">
          {/* Cancel Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your payment was not processed. No charges were made to your account.
          </p>

          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order ID</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{orderId}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Your order is still pending. You can try again or it will be cancelled automatically.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/cart"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
            >
              Return to Cart
            </Link>
            <Link
              to="/products"
              className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
