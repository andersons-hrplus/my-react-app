import { supabase } from '../lib/supabase'
import type { Product, ProductFormData, PaginatedResponse, ApiResponse } from '../types/database'

export const productService = {
  // Get all products with pagination
  async getAllProducts(page = 1, limit = 12, filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    brand?: string;
  } = {}): Promise<PaginatedResponse<Product>> {
    if (!supabase) throw new Error('Supabase not configured')

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        seller:profiles(id, full_name, user_role)
      `)
      .eq('is_active', true)

    // Apply filters
    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%, brand.ilike.%${filters.search}%`)
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice)
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition)
    }
    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`)
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    const totalCount = count || 0

    // Apply pagination and sorting
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return {
      data: data || [],
      count: totalCount,
      page,
      limit,
      total_pages: Math.ceil(totalCount / limit)
    }
  },

  // Get product by ID
  async getProductById(productId: string, forEdit = false): Promise<Product> {
    if (!supabase) throw new Error('Supabase not configured')
    if (!productId) throw new Error('Product ID is required')

    console.log('Fetching product with ID:', productId, 'forEdit:', forEdit)

    try {
      // First get the basic product data
      let query = supabase
        .from('products')
        .select('*')
        .eq('id', productId)

      // Only filter by is_active if not for editing
      if (!forEdit) {
        query = query.eq('is_active', true)
      }

      const { data: product, error: productError } = await query.single()

      if (productError) {
        console.error('Error fetching product:', productError)
        if (productError.code === 'PGRST116') {
          throw new Error('Product not found')
        }
        throw new Error(`Database error: ${productError.message}`)
      }

      if (!product) {
        throw new Error('Product not found')
      }

      console.log('Base product data:', product)

      // Get category if exists
      let category = null
      if (product.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, description')
          .eq('id', product.category_id)
          .single()
        
        if (!categoryError && categoryData) {
          category = categoryData
        }
      }

      // Get seller profile
      let seller = null
      if (product.seller_id) {
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('id, full_name, user_role, email')
          .eq('id', product.seller_id)
          .single()
        
        if (!sellerError && sellerData) {
          seller = sellerData
        } else {
          console.warn('Could not load seller profile:', sellerError)
        }
      }

      const result = {
        ...product,
        category,
        seller
      }

      console.log('Complete product result:', result)
      return result
    } catch (error) {
      console.error('Error in getProductById:', error)
      throw error
    }
  },

  // Get products by seller
  async getProductsBySeller(sellerId: string, includeInactive = false): Promise<Product[]> {
    if (!supabase) throw new Error('Supabase not configured')

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        seller:profiles(id, full_name, user_role)
      `)
      .eq('seller_id', sellerId)

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create new product (sellers only)
  async createProduct(productData: ProductFormData): Promise<ApiResponse<Product>> {
    if (!supabase) throw new Error('Supabase not configured')

    try {
      console.log('Creating product with data:', productData)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        return { error: 'Not authenticated' }
      }

      // Ensure user profile exists and is a seller
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', userData.user.id)
        .single()

      console.log('User profile:', profile)

      if (profileError || !profile) {
        console.error('Profile error:', profileError)
        return { error: 'User profile not found. Please complete your profile setup.' }
      }

      if (profile.user_role !== 'seller') {
        return { error: 'Only sellers can create products' }
      }

      const insertData = {
        ...productData,
        seller_id: userData.user.id,
      }

      console.log('Inserting data:', insertData)

      const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select('*')
        .single()

      if (error) {
        console.error('Database error:', error)
        return { error: `Failed to create product: ${error.message}` }
      }
      
      if (!data) {
        return { error: 'Failed to create product: No data returned' }
      }
      
      console.log('Product created successfully:', data)
      
      // Return the product with relationships populated
      try {
        const fullProduct = await this.getProductById(data.id, true)
        return { data: fullProduct }
      } catch (fetchError) {
        console.warn('Could not fetch full product data:', fetchError)
        // Return basic product data if we can't fetch the full version
        return { data: data as Product }
      }
    } catch (error) {
      console.error('Unexpected error in createProduct:', error)
      return { error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` }
    }
  },

  // Update product (seller only, own products)
  async updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .eq('seller_id', userData.user.id) // Ensure user owns the product
      .select(`
        *,
        category:categories(id, name),
        seller:profiles(id, full_name, user_role)
      `)
      .single()

    if (error) return { error: error.message }
    return { data }
  },

  // Delete product (seller only, own products)
  async deleteProduct(productId: string): Promise<ApiResponse<boolean>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('seller_id', userData.user.id) // Ensure user owns the product

    if (error) return { error: error.message }
    return { data: true }
  },

  // Get featured products
  async getFeaturedProducts(limit = 6): Promise<Product[]> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        seller:profiles(id, full_name, user_role)
      `)
      .eq('is_active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}