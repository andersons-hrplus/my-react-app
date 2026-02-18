import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'

/**
 * Lightweight hook that just tracks the cart item count.
 * Used by Navigation for the cart badge — avoids loading full cart data.
 */
export function useCartCount() {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const loadCount = async () => {
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
    }

    loadCount()
  }, [user])

  return { cartCount, setCartCount }
}
