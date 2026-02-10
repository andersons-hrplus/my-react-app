import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/AuthForm'
import { Profile } from './components/Profile'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navigation } from './components/Navigation'
import { isSupabaseConfigured } from './lib/supabase'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function Dashboard() {
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-400 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                  <a 
                    href="https://vite.dev" 
                    target="_blank" 
                    className="relative block p-4 bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                  >
                    <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-75 animate-pulse delay-75"></div>
                  <a 
                    href="https://react.dev" 
                    target="_blank" 
                    className="relative block p-4 bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-110 hover:-rotate-3 animate-spin-slow"
                  >
                    <img src={reactLogo} className="h-16 w-16" alt="React logo" />
                  </a>
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'}! 🚀
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your AI-powered chatbot platform is ready to go. Let's build something amazing together.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Authentication Status */}
              <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-green-100 rounded-2xl">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication</h3>
                  <p className="text-gray-600">Secure login system active</p>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <span className="font-semibold">Status: Online</span>
                  </div>
                </div>
              </div>

              {/* Tailwind Status */}
              <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-blue-100 rounded-2xl">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4" />
                      </svg>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tailwind CSS</h3>
                  <p className="text-gray-600">Modern styling framework ready</p>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <span className="font-semibold">Status: Active</span>
                  </div>
                </div>
              </div>

              {/* Supabase Status */}
              <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-purple-100 rounded-2xl">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Database</h3>
                  <p className="text-gray-600">Supabase connection established</p>
                  <div className="mt-4 flex items-center text-sm text-purple-600">
                    <span className="font-semibold">Status: Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Demo & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Interactive Counter */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Demo</h2>
                  <p className="text-gray-600 mb-6">Test the reactivity of your application</p>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-indigo-600 mb-2">{count}</div>
                      <p className="text-sm text-gray-500">Current count</p>
                    </div>
                    <button 
                      onClick={() => setCount((count) => count + 1)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center">
                        Click me! 
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <p className="text-gray-600 mb-6">Jump to key features of your application</p>
                <div className="space-y-3">
                  <a 
                    href="/profile" 
                    className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all duration-200 border border-blue-100 hover:border-blue-200 group"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-blue-900">Manage Profile</span>
                    </div>
                    <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  
                  <button className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 rounded-2xl transition-all duration-200 border border-gray-200 hover:border-gray-300 group opacity-75 cursor-not-allowed">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-semibold text-gray-600">AI Chatbot (Coming Soon)</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Overview</h3>
                  <p className="text-gray-600">Your account details and statistics</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-2xl">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{user?.email?.split('@')[0] || 'User'}</div>
                  <div className="text-sm text-gray-600">Username</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">{user?.id?.slice(0, 8)}...</div>
                  <div className="text-sm text-gray-600">User ID</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-600">Member Since</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Supabase Not Configured
            </h2>
            <p className="text-gray-600 mb-4">
              Please configure your Supabase credentials in the .env.local file before using authentication.
            </p>
            <div className="text-left bg-gray-50 p-3 rounded text-sm">
              <code>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
            <h2 className="text-2xl font-bold text-gray-800">AI Chatbot</h2>
            <p className="text-lg font-medium text-gray-600">Initializing your experience...</p>
            <p className="text-sm text-gray-500">Setting up authentication and workspace</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
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
  )
}

export default App
