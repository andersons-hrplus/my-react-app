import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ProductList } from '../components/ProductList'
import { useCartCount } from '../hooks/useCartCount'

export function Dashboard() {
  const { user, profile, isSeller } = useAuth()
  const { cartCount } = useCartCount()

  const firstName = (profile?.full_name || user?.user_metadata?.full_name)?.split(' ')[0] || 'Friend'
  const memberSince = new Date(user?.created_at || Date.now())
  const memberMonth = memberSince.toLocaleString('default', { month: 'short' })
  const memberYear = memberSince.getFullYear()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero banner */}
      <div className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-violet-300/10 dark:bg-violet-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14">
          {/* Greeting row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 max-w-xl">
                {isSeller()
                  ? 'Manage your inventory and track what\u2019s selling.'
                  : 'Discover quality parts for your next build.'}
              </p>
            </div>

            {/* Quick CTA */}
            <div className="flex gap-3 shrink-0">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Parts
              </Link>
              {isSeller() && (
                <Link
                  to="/seller/add-product"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </Link>
              )}
            </div>
          </div>

          {/* Stats row – glass cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account type */}
            <div className="group relative rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/40 dark:border-white/10 p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                  profile?.user_role === 'seller'
                    ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400'
                }`}>
                  {profile?.user_role === 'seller' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )}
                </span>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Account</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{profile?.user_role || 'Buyer'}</p>
            </div>

            {/* Cart */}
            <Link to="/cart" className="group relative rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/40 dark:border-white/10 p-5 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </span>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Cart</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{cartCount} <span className="text-base font-normal text-gray-400">items</span></p>
            </Link>

            {/* Member since */}
            <div className="group relative rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/40 dark:border-white/10 p-5 hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </span>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Member Since</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{memberMonth} {memberYear}</p>
            </div>

            {/* Marketplace */}
            <div className="group relative rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/40 dark:border-white/10 p-5 hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </span>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Platform</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">CarParts Pro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-2">
        {/* Quick navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            to="/products"
            className="group flex items-center gap-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Browse Catalog</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Search & filter all parts</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

          {isSeller() ? (
            <Link
              to="/seller/products"
              className="group flex items-center gap-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 dark:shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">My Inventory</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your listings</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ) : (
            <Link
              to="/cart"
              className="group flex items-center gap-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 dark:shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Shopping Cart</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review & checkout</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          )}

          <Link
            to="/profile"
            className="group flex items-center gap-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 dark:shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Your Profile</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Settings & preferences</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Parts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hand-picked selections from our catalog</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          <ProductList
            featured={true}
            limit={8}
            showFilters={false}
          />
        </section>
      </div>
    </div>
  )
}