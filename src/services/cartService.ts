import { supabase } from '../lib/supabase'
import type { CartItem, ApiResponse } from '../types/database'

export const cartService = {
  // Get user's cart items
  async getCartItems(): Promise<CartItem[]> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          stock_quantity,
          images,
          brand,
          model,
          condition,
          is_active,
          seller:profiles(id, full_name)
        )
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      // Update existing item quantity
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity)
    }

    // Add new item to cart
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userData.user.id,
        product_id: productId,
        quantity
      })
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          stock_quantity,
          images,
          brand,
          model,
          condition,
          is_active,
          seller:profiles(id, full_name)
        )
      `)
      .single()

    if (error) return { error: error.message }
    return { data }
  },

  // Update cart item quantity
  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const removeResult = await this.removeFromCart(cartItemId)
      if (removeResult.error) {
        return { error: removeResult.error }
      }
      // Return empty cart item result since item was removed
      return { data: null as any }
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', userData.user.id) // Ensure user owns the cart item
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          stock_quantity,
          images,
          brand,
          model,
          condition,
          is_active,
          seller:profiles(id, full_name)
        )
      `)
      .single()

    if (error) return { error: error.message }
    return { data }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<ApiResponse<boolean>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userData.user.id) // Ensure user owns the cart item

    if (error) return { error: error.message }
    return { data: true }
  },

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<boolean>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userData.user.id)

    if (error) return { error: error.message }
    return { data: true }
  },

  // Get cart summary (total items and total price)
  async getCartSummary(): Promise<{ totalItems: number; totalPrice: number; items: CartItem[] }> {
    const items = await this.getCartItems()
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => {
      if (item.product && item.product.is_active) {
        return sum + (item.product.price * item.quantity)
      }
      return sum
    }, 0)

    return {
      totalItems,
      totalPrice,
      items
    }
  }
}