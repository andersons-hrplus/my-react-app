import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { paymentService } from '../services/paymentService'
import type { Order } from '../types/database'

/**
 * Hook to manage user orders.
 */
export function useOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await paymentService.getMyOrders()
      setOrders(data)
      setError(null)
    } catch (err: any) {
      console.error('Error loading orders:', err)
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  return {
    orders,
    loading,
    error,
    refresh: loadOrders,
  }
}
