import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface ProfileData {
  full_name?: string
  avatar_url?: string
  email?: string
}

export function Profile() {
  const { user, profile: contextProfile, signOut, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<ProfileData>({})
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile)
    } else if (user) {
      // Fallback to user data if no profile in context yet
      setProfile({
        email: user.email,
        full_name: user.user_metadata?.full_name || ''
      })
    }
  }, [contextProfile, user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage('')

    const result = await updateProfile({
      full_name: profile.full_name,
      avatar_url: profile.avatar_url
    })

    if (result?.error) {
      setMessage('Error updating profile: ' + result.error.message)
    } else {
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    }

    setUpdating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your account information and preferences</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl font-bold text-white ${profile.avatar_url ? 'hidden' : ''}`}>
                      {(profile.full_name || user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {profile.full_name || 'User'}
                    </h2>
                    <p className="text-blue-100">{profile.email || user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors duration-200 font-medium border border-white/20"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email || user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      id="avatarUrl"
                      value={profile.avatar_url || ''}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  {profile.avatar_url && (
                    <div className="flex justify-center">
                      <div className="relative">
                        <img
                          src={profile.avatar_url}
                          alt="Avatar preview"
                          className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full w-6 h-6 border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Appearance theme
                    </label>
                    <div className="space-y-3">
                      <div 
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                          theme === 'light' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-700/50'
                        }`}
                        onClick={() => setTheme('light')}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={theme === 'light'}
                          onChange={() => setTheme('light')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-gray-900 dark:text-white">Light</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Clean, bright interface</p>
                        </div>
                      </div>

                      <div 
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                          theme === 'dark' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-700/50'
                        }`}
                        onClick={() => setTheme('dark')}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={theme === 'dark'}
                          onChange={() => setTheme('dark')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                            <span className="font-medium text-gray-900 dark:text-white">Dark</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</p>
                        </div>
                      </div>

                      <div 
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                          theme === 'system' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-700/50'
                        }`}
                        onClick={() => setTheme('system')}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          checked={theme === 'system'}
                          onChange={() => setTheme('system')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-gray-900 dark:text-white">System</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Follow device setting</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${
                    message.includes('successfully') 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-600'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-600'
                  }`}>
                    <div className="flex items-center">
                      {message.includes('successfully') ? (
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

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {updating ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Profile...
                    </div>
                  ) : (
                    <span className="flex items-center">
                      Update Profile
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Account Info */}
            <div className="border-t border-gray-100 dark:border-gray-700 px-8 py-6 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                      <p className="text-sm text-gray-900 dark:text-gray-200 font-mono">{user?.id?.slice(0, 8)}...</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</p>
                      <p className="text-sm text-gray-900 dark:text-gray-200">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}