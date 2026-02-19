import { supabase } from '../lib/supabase'
import type { SellerPaymentInfo, Payment, ShippingAddress, ApiResponse } from '../types/database'

export const paymentService = {
  // ==========================================
  // Seller Payment Info
  // ==========================================

  async getSellerPaymentInfo(): Promise<SellerPaymentInfo | null> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('seller_payment_info')
      .select('*')
      .eq('seller_id', userData.user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async upsertSellerPaymentInfo(info: Partial<SellerPaymentInfo>): Promise<ApiResponse<SellerPaymentInfo>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    // Check if record exists
    const existing = await this.getSellerPaymentInfo()

    if (existing) {
      const { data, error } = await supabase
        .from('seller_payment_info')
        .update({
          bank_name: info.bank_name,
          account_holder_name: info.account_holder_name,
          account_number_last4: info.account_number_last4,
          routing_number_last4: info.routing_number_last4,
          paypal_email: info.paypal_email,
          payment_method_preference: info.payment_method_preference,
        })
        .eq('seller_id', userData.user.id)
        .select()
        .single()

      if (error) return { error: error.message }
      return { data }
    } else {
      const { data, error } = await supabase
        .from('seller_payment_info')
        .insert({
          seller_id: userData.user.id,
          bank_name: info.bank_name,
          account_holder_name: info.account_holder_name,
          account_number_last4: info.account_number_last4,
          routing_number_last4: info.routing_number_last4,
          paypal_email: info.paypal_email,
          payment_method_preference: info.payment_method_preference || 'paypal',
        })
        .select()
        .single()

      if (error) return { error: error.message }
      return { data }
    }
  },

  // ==========================================
  // Checkout & Orders
  // ==========================================

  async createOrder(
    shippingAddress: ShippingAddress,
    paymentMethod: string = 'paypal',
    notes?: string
  ): Promise<ApiResponse<string>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .rpc('create_order_from_cart', {
        p_buyer_id: userData.user.id,
        p_shipping_address: shippingAddress,
        p_payment_method: paymentMethod,
        p_notes: notes || null,
      })

    if (error) return { error: error.message }
    return { data: data as string }
  },

  // ==========================================
  // PayPal Checkout
  // ==========================================

  async createPayPalCheckout(orderId: string): Promise<ApiResponse<{ paypalOrderId: string; approvalUrl: string }>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) throw new Error('Not authenticated')

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { orderId },
    })

    if (error) return { error: error.message }
    if (data?.error) return { error: data.error }
    return { data: { paypalOrderId: data.paypalOrderId, approvalUrl: data.approvalUrl } }
  },

  async capturePayPalPayment(orderId: string, paypalOrderId: string): Promise<ApiResponse<{ status: string; captureId: string }>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) throw new Error('Not authenticated')

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { orderId, action: 'capture', paypalOrderId },
    })

    if (error) return { error: error.message }
    if (data?.error) return { error: data.error }
    return { data: { status: data.status, captureId: data.captureId } }
  },

  // ==========================================
  // Payments
  // ==========================================

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getMyPayments(): Promise<Payment[]> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('buyer_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getMyOrders(): Promise<any[]> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, name, price, images, brand, model),
          seller:profiles(id, full_name)
        )
      `)
      .eq('buyer_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create a payment record (used when order is created)
  async createPaymentRecord(
    orderId: string,
    amount: number,
    paymentMethod: string = 'paypal'
  ): Promise<ApiResponse<Payment>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        buyer_id: userData.user.id,
        amount,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single()

    if (error) return { error: error.message }
    return { data }
  },

  // Update payment status (after PayPal redirect)
  async updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    paypalData?: { paypalOrderId?: string; captureId?: string; receiptUrl?: string }
  ): Promise<ApiResponse<Payment>> {
    if (!supabase) throw new Error('Supabase not configured')

    const updates: any = { status }
    if (paypalData?.paypalOrderId) updates.stripe_checkout_session_id = paypalData.paypalOrderId
    if (paypalData?.captureId) updates.stripe_payment_intent_id = paypalData.captureId
    if (paypalData?.receiptUrl) updates.receipt_url = paypalData.receiptUrl

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) return { error: error.message }
    return { data }
  },

  // Confirm order after successful payment
  async confirmOrder(orderId: string): Promise<ApiResponse<boolean>> {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId)

    if (error) return { error: error.message }
    return { data: true }
  },
}
