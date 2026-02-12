/// <reference path="../deno.d.ts" />

// Supabase Edge Function: ai-chat
// Securely proxies chat requests to Azure OpenAI.
// API keys stay server-side — never exposed to the browser.
//
// Required secrets (set via `supabase secrets set`):
//   AZURE_OPENAI_ENDPOINT    – e.g. https://your-resource.openai.azure.com/
//   AZURE_OPENAI_API_KEY     – your Azure API key
//   AZURE_OPENAI_DEPLOYMENT  – model deployment name (default: HRPlusV6GPT4.1)
//   AZURE_OPENAI_API_VERSION – API version (default: 2024-12-01-preview)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// ── rate-limit store (per-function-instance, resets on cold start) ──────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 20        // max requests …
const RATE_LIMIT_WINDOW_MS = 60_000 // … per 60 seconds

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

// ── system prompt (lives server-side, invisible to the client) ─────────────
function createSystemPrompt(): string {
  return `You are Car Parts AI Assistant, an expert AI assistant for an automotive car parts e-commerce platform. Your role is to help customers:

1. **Product Search & Information**: Help users find the right car parts by make, model, year, or part type
2. **Installation Guidance**: Provide basic installation tips and compatibility information
3. **Application Navigation**: Guide users through using the platform features
4. **Purchase Support**: Answer questions about ordering, shipping, returns, and account management
5. **Technical Specifications**: Explain part specifications, materials, and performance characteristics

**Platform Features to Help With**:
- User registration and profile management
- Product browsing and search functionality
- Shopping cart and checkout process
- Order tracking and history
- Product reviews and ratings system
- Dark/Light theme toggle
- Account settings and preferences

**Guidelines**:
- Be friendly, professional, and knowledgeable
- Provide accurate automotive information
- If unsure about specific technical details, recommend consulting a professional mechanic
- Keep responses concise but informative
- Always prioritize customer safety when discussing installations
- Use automotive terminology appropriately but explain complex terms

**Important**: You cannot process actual orders or access real user account data - always direct users to use the platform's built-in features for transactions and account management.

Respond naturally and helpfully to the user's question.`
}

// ── handler ────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Authenticate ──────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── 2. Rate-limit ────────────────────────────────────────────────────
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── 3. Validate & sanitize input ─────────────────────────────────────
    const body = await req.json()
    const rawMessage = body?.message

    if (!rawMessage || typeof rawMessage !== 'string' || rawMessage.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a non-empty string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const sanitizedMessage = rawMessage.trim().slice(0, 1000)
    const conversationHistory: AIMessage[] = Array.isArray(body.conversationHistory)
      ? body.conversationHistory
          .filter((m: any) => m && typeof m.content === 'string' && ['user', 'assistant'].includes(m.role))
          .slice(-10)
          .map((m: any) => ({ role: m.role, content: m.content.slice(0, 2000) }))
      : []

    // ── 4. Build Azure OpenAI request ────────────────────────────────────
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')
    const apiKey        = Deno.env.get('AZURE_OPENAI_API_KEY')
    const deployment    = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') || 'HRPlusV6GPT4.1'
    const apiVersion    = Deno.env.get('AZURE_OPENAI_API_VERSION') || '2024-12-01-preview'

    if (!azureEndpoint || !apiKey) {
      console.error('Azure OpenAI secrets are not configured')
      return new Response(
        JSON.stringify({ error: 'AI service is not configured on the server' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const messages: AIMessage[] = [
      { role: 'system', content: createSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: sanitizedMessage },
    ]

    const url = `${azureEndpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error(`Azure OpenAI error ${aiResponse.status}:`, errorText)
      return new Response(
        JSON.stringify({ error: 'AI service encountered an error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── 5. Return response ───────────────────────────────────────────────
    const data = await aiResponse.json()

    if (data.choices?.[0]?.message?.content) {
      return new Response(
        JSON.stringify({ message: data.choices[0].message.content.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unexpected response format from AI' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
