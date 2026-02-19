/// <reference path="../deno.d.ts" />

// Supabase Edge Function: create-checkout
// Creates a PayPal order for checkout, or captures an approved PayPal order.
//
// Required secrets (set via `supabase secrets set`):
//   PAYPAL_CLIENT_ID     – your PayPal REST API client ID
//   PAYPAL_CLIENT_SECRET – your PayPal REST API client secret
//   PAYPAL_MODE          – "sandbox" or "live" (default: sandbox)
//
// Required env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY – set automatically by Supabase

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── PayPal API helpers ──────────────────────────────────────────────────────

function getPayPalBaseUrl(mode: string): string {
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getPayPalAccessToken(clientId: string, clientSecret: string, baseUrl: string): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`)

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to get PayPal access token')
  }

  return data.access_token
}

async function createPayPalOrder(
  accessToken: string,
  baseUrl: string,
  orderData: {
    items: Array<{ name: string; quantity: number; unit_amount: string }>
    total: string
    tax: string
    subtotal: string
    orderId: string
    returnUrl: string
    cancelUrl: string
  }
): Promise<{ id: string; approvalUrl: string }> {
  const body = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderData.orderId,
      description: `CarParts Pro Order ${orderData.orderId.substring(0, 8)}`,
      amount: {
        currency_code: 'USD',
        value: orderData.total,
        breakdown: {
          item_total: { currency_code: 'USD', value: orderData.subtotal },
          tax_total: { currency_code: 'USD', value: orderData.tax },
        },
      },
      items: orderData.items.map(item => ({
        name: item.name.substring(0, 127),
        quantity: String(item.quantity),
        unit_amount: { currency_code: 'USD', value: item.unit_amount },
        category: 'PHYSICAL_GOODS',
      })),
    }],
    application_context: {
      brand_name: 'CarParts Pro',
      landing_page: 'LOGIN',
      user_action: 'PAY_NOW',
      return_url: orderData.returnUrl,
      cancel_url: orderData.cancelUrl,
    },
  }

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  if (!response.ok) {
    const errorMsg = data.details?.[0]?.description || data.message || 'Failed to create PayPal order'
    throw new Error(errorMsg)
  }

  const approvalLink = data.links?.find((link: any) => link.rel === 'approve')
  if (!approvalLink) {
    throw new Error('No approval URL returned from PayPal')
  }

  return { id: data.id, approvalUrl: approvalLink.href }
}

async function capturePayPalOrder(
  accessToken: string,
  baseUrl: string,
  paypalOrderId: string
): Promise<any> {
  const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  if (!response.ok) {
    const errorMsg = data.details?.[0]?.description || data.message || 'Failed to capture PayPal payment'
    throw new Error(errorMsg)
  }

  return data
}

// ── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox'

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const baseUrl = getPayPalBaseUrl(mode)

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { orderId, action, paypalOrderId } = await req.json()

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // ── CAPTURE flow (called after buyer approves on PayPal) ────────────
    if (action === 'capture' && paypalOrderId) {
      const accessToken = await getPayPalAccessToken(clientId, clientSecret, baseUrl)
      const captureData = await capturePayPalOrder(accessToken, baseUrl, paypalOrderId)

      const captureStatus = captureData.status === 'COMPLETED' ? 'succeeded' : 'failed'
      const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id

      // Update payment record
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('order_id', orderId)
        .single()

      if (payment) {
        await supabaseAdmin
          .from('payments')
          .update({
            status: captureStatus,
            stripe_payment_intent_id: captureId, // reusing column for PayPal capture ID
          })
          .eq('id', payment.id)
      }

      // Confirm order if payment succeeded
      if (captureStatus === 'succeeded') {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', orderId)
      }

      return new Response(
        JSON.stringify({ status: captureStatus, captureId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── CREATE flow (creates a PayPal order) ─────────────────────────────
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, name, price, images, description)
        )
      `)
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (order.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Order has already been processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build PayPal items
    const items = order.items.map((item: any) => ({
      name: item.product?.name || `Product ${item.product_id}`,
      quantity: item.quantity,
      unit_amount: item.unit_price.toFixed(2),
    }))

    const subtotal = order.items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    )
    const tax = subtotal * 0.08
    const total = subtotal + tax

    // Determine success/cancel URLs
    const appUrl = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'http://localhost:5173'

    // Get PayPal access token & create order
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, baseUrl)

    const paypalOrder = await createPayPalOrder(accessToken, baseUrl, {
      items,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      orderId,
      returnUrl: `${appUrl}/payment/success?order_id=${orderId}`,
      cancelUrl: `${appUrl}/payment/cancel?order_id=${orderId}`,
    })

    // Create or update payment record
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .single()

    if (existingPayment) {
      await supabaseAdmin
        .from('payments')
        .update({
          stripe_checkout_session_id: paypalOrder.id, // reusing column for PayPal order ID
          status: 'processing',
        })
        .eq('id', existingPayment.id)
    } else {
      await supabaseAdmin
        .from('payments')
        .insert({
          order_id: orderId,
          buyer_id: user.id,
          amount: total,
          stripe_checkout_session_id: paypalOrder.id,
          status: 'processing',
          payment_method: 'paypal',
        })
    }

    return new Response(
      JSON.stringify({
        paypalOrderId: paypalOrder.id,
        approvalUrl: paypalOrder.approvalUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
