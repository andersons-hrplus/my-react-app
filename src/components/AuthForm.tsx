import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onToggle: () => void
}

export function AuthForm({ mode, onToggle }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signInWithEmail, signUpWithEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let result
      if (mode === 'signin') {
        result = await signInWithEmail(email, password)
      } else {
        result = await signUpWithEmail(email, password, fullName, userRole)
      }

      if (result.error) {
        setMessage(result.error.message)
      } else if (mode === 'signup') {
        setMessage('Check your email for the confirmation link!')
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {mode === 'signin' ? 'Welcome back!' : 'Create account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {mode === 'signin' 
              ? 'Sign in to access your car parts marketplace' 
              : 'Join our car parts marketplace today'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`relative flex cursor-pointer rounded-xl p-4 border-2 transition-all ${
                        userRole === 'buyer' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="buyer"
                          checked={userRole === 'buyer'}
                          onChange={(e) => setUserRole(e.target.value as 'buyer' | 'seller')}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center text-center w-full">
                          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="text-sm font-semibold">Buyer</span>
                          <span className="text-xs mt-1 opacity-75">Browse & purchase car parts</span>
                        </div>
                      </label>
                      <label className={`relative flex cursor-pointer rounded-xl p-4 border-2 transition-all ${
                        userRole === 'seller' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="seller"
                          checked={userRole === 'seller'}
                          onChange={(e) => setUserRole(e.target.value as 'buyer' | 'seller')}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center text-center w-full">
                          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm font-semibold">Seller</span>
                          <span className="text-xs mt-1 opacity-75">Sell car parts online</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.includes('Check your email') 
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-600'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-600'
              }`}>
                <div className="flex items-center">
                  {message.includes('Check your email') ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {message}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  <span className="flex items-center">
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onToggle}
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  {mode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}