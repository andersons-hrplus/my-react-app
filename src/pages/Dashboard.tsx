import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ProductList } from '../components/ProductList'

export function Dashboard() {
  const { user, profile, isSeller } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent mb-4">
              Welcome back, {(profile?.full_name || user?.user_metadata?.full_name)?.split(' ')[0] || 'Friend'}! 🚗
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your one-stop marketplace for quality car parts. 
              {isSeller() ? ' Manage your products and grow your business.' : ' Find the perfect parts for your vehicle.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link 
              to="/products" 
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Browse Products</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Find car parts</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/cart" 
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shopping Cart</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">View your items</p>
                </div>
              </div>
            </Link>

            {isSeller() && (
              <>
                <Link 
                  to="/seller/products" 
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-xl p-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                      <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Products</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Manage inventory</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/seller/add-product" 
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Product</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">List new parts</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            <Link 
              to="/profile" 
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-xl p-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Account settings</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Account Type</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {profile?.user_role || 'Buyer'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  profile?.user_role === 'seller' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {profile?.user_role === 'seller' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    )}
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Marketplace</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Car Parts Pro</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-3 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Member Since</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Date(user?.created_at || Date.now()).getFullYear()}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-3 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
              <Link 
                to="/products"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <ProductList 
              featured={true} 
              limit={8} 
              showFilters={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}