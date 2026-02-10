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
        // Profile doesn't exist yet, create one with default role
        const currentUser = await supabase.auth.getUser()
        if (currentUser.data.user) {
          const newProfile = {
            id: currentUser.data.user.id,
            email: currentUser.data.user.email,
            full_name: currentUser.data.user.user_metadata?.full_name || '',
            user_role: 'buyer' as const,
            updated_at: new Date().toISOString(),
          }
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
          
          if (!insertError) {
            setProfile(newProfile)
          }
        }
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

    // If signup is successful and we have a user, create the profile
    if (!error && data.user) {
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          user_role: userRole,
          updated_at: new Date().toISOString(),
        })
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
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