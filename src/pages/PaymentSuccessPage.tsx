import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { paymentService } from '../services/paymentService'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const paypalToken = searchParams.get('token') // PayPal returns this as the PayPal order ID
  const isDemo = searchParams.get('demo') === 'true'
  const [confirming, setConfirming] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderId) {
        setError('No order ID found')
        setConfirming(false)
        return
      }

      try {
        if (paypalToken) {
          // Capture the PayPal payment (the buyer approved it on PayPal)
          const captureResult = await paymentService.capturePayPalPayment(orderId, paypalToken)

          if (captureResult.error) {
            console.error('PayPal capture error:', captureResult.error)
            setError(captureResult.error)
          }
          // The edge function handles order confirmation + payment status update
        } else {
          // Demo mode or fallback: confirm the order directly
          const result = await paymentService.confirmOrder(orderId)
          if (result.error) {
            console.error('Order confirmation error:', result.error)
          }
        }
      } catch (err: any) {
        console.error('Error confirming payment:', err)
        setError(err.message)
      } finally {
        setConfirming(false)
      }
    }

    confirmPayment()
  }, [orderId, paypalToken])

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {isDemo && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This was a demo payment. Configure PayPal keys for real payment processing.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-6">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order ID</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{orderId}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/orders"
              className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
            >
              View My Orders
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
