import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { paymentService } from '../services/paymentService'
import type { SellerPaymentInfo } from '../types/database'

/**
 * Hook to manage seller payment info.
 */
export function useSellerPaymentInfo() {
  const { user, profile } = useAuth()
  const [paymentInfo, setPaymentInfo] = useState<SellerPaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPaymentInfo = useCallback(async () => {
    if (!user || profile?.user_role !== 'seller') {
      setPaymentInfo(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const info = await paymentService.getSellerPaymentInfo()
      setPaymentInfo(info)
      setError(null)
    } catch (err: any) {
      console.error('Error loading payment info:', err)
      setError(err.message || 'Failed to load payment info')
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    loadPaymentInfo()
  }, [loadPaymentInfo])

  const savePaymentInfo = async (info: Partial<SellerPaymentInfo>) => {
    try {
      const result = await paymentService.upsertSellerPaymentInfo(info)
      if (result.error) {
        return { error: result.error }
      }
      setPaymentInfo(result.data!)
      return { error: undefined }
    } catch (err: any) {
      return { error: err.message || 'Failed to save payment info' }
    }
  }

  return {
    paymentInfo,
    loading,
    error,
    savePaymentInfo,
    refresh: loadPaymentInfo,
  }
}
