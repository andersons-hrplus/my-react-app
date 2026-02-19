import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'
import { supabase } from '../lib/supabase'

/**
 * Lightweight hook that tracks the cart item count in real-time.
 * Uses Supabase Realtime to subscribe to cart_items changes,
 * plus a periodic poll every 30 seconds as a fallback.
 */
export function useCartCount() {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const loadCount = useCallback(async () => {
    if (!user) {
      setCartCount(0)
      return
    }
    try {
      const summary = await cartService.getCartSummary()
      setCartCount(summary.totalItems)
    } catch (error) {
      console.error('Error loading cart count:', error)
    }
  }, [user])

  // Initial load + periodic refresh
  useEffect(() => {
    loadCount()

    if (!user) return

    const interval = setInterval(loadCount, 30_000)
    return () => clearInterval(interval)
  }, [user, loadCount])

  // Real-time subscription to cart_items changes
  useEffect(() => {
    if (!user || !supabase) return

    const channel = supabase
      .channel('cart-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadCount])

  return { cartCount, setCartCount, refreshCartCount: loadCount }
}
