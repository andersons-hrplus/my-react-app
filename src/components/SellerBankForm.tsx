import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { paymentService } from '../services/paymentService'
import type { SellerPaymentInfo } from '../types/database'

export function SellerBankForm() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    paypal_email: '',
    payment_method_preference: 'paypal' as 'paypal' | 'bank_transfer',
  })

  const [existingInfo, setExistingInfo] = useState<SellerPaymentInfo | null>(null)

  useEffect(() => {
    loadPaymentInfo()
  }, [])

  const loadPaymentInfo = async () => {
    try {
      const info = await paymentService.getSellerPaymentInfo()
      if (info) {
        setExistingInfo(info)
        setFormData({
          bank_name: info.bank_name || '',
          account_holder_name: info.account_holder_name || '',
          account_number: '', // Don't pre-fill sensitive data
          routing_number: '', // Don't pre-fill sensitive data
          paypal_email: info.paypal_email || '',
          payment_method_preference: info.payment_method_preference,
        })
      }
    } catch (err) {
      console.error('Error loading payment info:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const result = await paymentService.upsertSellerPaymentInfo({
        bank_name: formData.bank_name || undefined,
        account_holder_name: formData.account_holder_name || undefined,
        account_number_last4: formData.account_number ? formData.account_number.slice(-4) : existingInfo?.account_number_last4,
        routing_number_last4: formData.routing_number ? formData.routing_number.slice(-4) : existingInfo?.routing_number_last4,
        paypal_email: formData.paypal_email || undefined,
        payment_method_preference: formData.payment_method_preference,
      })

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Payment information saved successfully!' })
        setExistingInfo(result.data!)
        // Clear sensitive fields
        setFormData(prev => ({ ...prev, account_number: '', routing_number: '' }))
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save payment information' })
    } finally {
      setSaving(false)
    }
  }

  if (profile?.user_role !== 'seller') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Setup</h2>
        <p className="text-gray-600 dark:text-gray-300">Only sellers can set up payment information.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Setup</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure how you receive payments from buyers
          </p>
        </div>

        {/* Status Badge */}
        {existingInfo && (
          <div className={`mb-6 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            existingInfo.is_verified
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              existingInfo.is_verified ? 'bg-green-500' : 'bg-yellow-500'
            }`}></span>
            {existingInfo.is_verified ? 'Payment info verified' : 'Payment info pending verification'}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Payment Method Preference */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preferred Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'paypal', label: 'PayPal', icon: '🅿️', desc: 'PayPal email payments' },
                  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'Direct bank transfer' },
                ].map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_method_preference: method.value as any }))}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.payment_method_preference === method.value
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{method.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{method.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Details Section */}
            {formData.payment_method_preference === 'bank_transfer' && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bank Account Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={e => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="e.g. Chase, Bank of America"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.account_holder_name}
                      onChange={e => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))}
                      placeholder="Full name on the account"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={formData.routing_number}
                        onChange={e => setFormData(prev => ({ ...prev, routing_number: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                        placeholder={existingInfo?.routing_number_last4 ? `****${existingInfo.routing_number_last4}` : '9 digits'}
                        maxLength={9}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {existingInfo?.routing_number_last4 && !formData.routing_number && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Current: ****{existingInfo.routing_number_last4}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.account_number}
                        onChange={e => setFormData(prev => ({ ...prev, account_number: e.target.value.replace(/\D/g, '').slice(0, 17) }))}
                        placeholder={existingInfo?.account_number_last4 ? `****${existingInfo.account_number_last4}` : 'Account number'}
                        maxLength={17}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {existingInfo?.account_number_last4 && !formData.account_number && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Current: ****{existingInfo.account_number_last4}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Section */}
            {formData.payment_method_preference === 'paypal' && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  PayPal Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PayPal Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.paypal_email}
                    onChange={e => setFormData(prev => ({ ...prev, paypal_email: e.target.value }))}
                    placeholder="your@paypal-email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Secure Payment Processing</p>
                    <p>
                      Payments are processed securely through PayPal. We only store the last 4 digits of your 
                      bank account and routing numbers. Your full account details are never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  existingInfo ? 'Update Payment Information' : 'Save Payment Information'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
