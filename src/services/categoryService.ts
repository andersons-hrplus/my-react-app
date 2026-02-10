import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

export const categoryService = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  // Get category by ID
  async getCategoryById(categoryId: string): Promise<Category | null> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) throw error
    return data
  }
}