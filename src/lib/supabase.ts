import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if credentials are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url !== 'https://your-project-id.supabase.co' && url.includes('supabase.co')
  } catch {
    return false
  }
}

const isValidKey = (key: string) => {
  return key && key !== 'your_supabase_anon_key_here' && key.length > 20
}

// Create Supabase client only if credentials are valid
export const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl) && isValidKey(supabaseKey))
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseConfigured = () => {
  return supabase !== null
}