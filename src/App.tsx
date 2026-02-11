import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/AuthForm'
import { Profile } from './components/Profile'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navigation } from './components/Navigation'
import { Dashboard } from './pages/Dashboard'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { SellerProductsPage } from './pages/SellerProductsPage'
import { AddProductPage } from './pages/AddProductPage'
import { EditProductPage } from './pages/EditProductPage'
import { isSupabaseConfigured } from './lib/supabase'

function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Supabase Not Configured
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please configure your Supabase credentials in the .env.local file before using authentication.
            </p>
            <div className="text-left bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
              <code className="text-gray-800 dark:text-gray-200">
                VITE_SUPABASE_URL=your_project_url<br/>
                VITE_SUPABASE_ANON_KEY=your_anon_key
              </code>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthForm 
      mode={mode} 
      onToggle={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
    />
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-xl opacity-30 animate-ping"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">CarParts Pro</h2>
            <p className="text-lg font-medium text-gray-600">Initializing your experience...</p>
            <p className="text-sm text-gray-500">Setting up authentication and workspace</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {user && <Navigation />}
      <Routes>
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <AuthPage />
          } 
        />
        <Route 
          path="/auth" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <AuthPage />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products/:id" 
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/products" 
          element={
            <ProtectedRoute>
              <SellerProductsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/add-product" 
          element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/products/:id/edit" 
          element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auth" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <AuthPage />
          } 
        />
      </Routes>
    </>
  )
}

export default App
