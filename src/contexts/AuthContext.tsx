import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error?: any }>
  signUpWithEmail: (email: string, password: string, fullName?: string, userRole?: 'buyer' | 'seller') => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>
  isBuyer: () => boolean
  isSeller: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load profile with manual creation fallback
  const loadProfile = async (userId: string) => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      } else if (data) {
        setProfile(data)
      } else {
        console.log('Profile not found, will be created on signup')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }) ?? { data: { subscription: null } }

    return () => subscription?.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' }
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signUpWithEmail = async (email: string, password: string, fullName?: string, userRole: 'buyer' | 'seller' = 'buyer') => {
    if (!supabase) return { error: 'Supabase not configured' }
    
    console.log('Starting signup process for:', email)
    
    // Step 1: Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_role: userRole,
        },
      },
    })

    console.log('Supabase auth signup result:', { data, error })

    if (error) {
      console.error('Auth signup error:', error)
      return { data, error }
    }

    // Step 2: Create profile using secure database function
    if (data.user) {
      try {
        console.log('Creating profile for user:', data.user.id)
        
        const { error: profileError } = await supabase
          .rpc('create_user_profile', {
            user_id: data.user.id,
            user_email: data.user.email || email,
            full_name: fullName || '',
            user_role: userRole
          })

        if (profileError) {
          console.error('Profile creation error details:', profileError)
          return {
            data,
            error: {
              message: `Profile creation failed: ${profileError.message}. Please contact support.`
            }
          }
        } else {
          console.log('Profile created successfully')
        }
      } catch (profileError) {
        console.error('Unexpected error creating profile:', profileError)
        return {
          data,
          error: {
            message: 'Profile setup failed. Please contact support.'
          }
        }
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    if (!supabase) return
    
    try {
      // Clear local state immediately
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Sign out from Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!supabase || !user) return { error: 'Not authenticated' }
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        ...updates,
        updated_at: new Date().toISOString(),
      })

    // Update local profile state
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  const isBuyer = () => {
    return profile?.user_role === 'buyer'
  }

  const isSeller = () => {
    return profile?.user_role === 'seller'
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    isBuyer,
    isSeller,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}