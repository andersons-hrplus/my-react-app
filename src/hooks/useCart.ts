import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'
import type { CartItem } from '../types/database'

/**
 * Hook to manage the full shopping cart — load items, add/remove/update/clear.
 * Handles loading and error state internally.
 */
export function useCart() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const items = await cartService.getCartItems()
      setCartItems(items)
      setError('')
    } catch (err) {
      console.error('Error loading cart:', err)
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const result = await cartService.addToCart(productId, quantity)
      if (result.error) {
        return { error: result.error }
      }
      await loadCart()
      return { error: undefined }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add to cart'
      setError(msg)
      return { error: msg }
    }
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      setUpdating(cartItemId)
      const result = await cartService.updateCartItemQuantity(cartItemId, newQuantity)
      if (result.error) {
        setError(result.error)
      } else {
        await loadCart()
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      setUpdating(cartItemId)
      const result = await cartService.removeFromCart(cartItemId)
      if (result.error) {
        setError(result.error)
      } else {
        await loadCart()
      }
    } catch (err) {
      console.error('Error removing item:', err)
      setError('Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    try {
      setLoading(true)
      const result = await cartService.clearCart()
      if (result.error) {
        setError(result.error)
      } else {
        setCartItems([])
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('Failed to clear cart')
    } finally {
      setLoading(false)
    }
  }

  // Derived values
  const activeItems = cartItems.filter(item => item.product?.is_active)
  const subtotal = cartItems.reduce((sum, item) => {
    if (item.product && item.product.is_active) {
      return sum + (item.product.price * item.quantity)
    }
    return sum
  }, 0)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cartItems,
    activeItems,
    loading,
    updating,
    error,
    subtotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: loadCart,
  }
}
