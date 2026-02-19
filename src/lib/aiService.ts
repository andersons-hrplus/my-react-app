import { supabase } from './supabase'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIProduct {
  id: string
  name: string
  price: number
  brand?: string
  model?: string
  condition: string
  images?: string[]
  stock_quantity: number
  year_from?: number
  year_to?: number
  part_number?: string
  category_id?: string
}

export interface AIServiceResponse {
  message: string
  error?: string
  products?: AIProduct[]
}

/**
 * AI Service — talks to the `ai-chat` Supabase Edge Function.
 *
 * No API keys or secrets exist in client code.
 * The Edge Function holds the Azure OpenAI credentials server-side,
 * validates the user's JWT, enforces rate limits, and proxies the request.
 */
class AIService {
  async sendMessage(
    message: string,
    conversationHistory: AIMessage[] = [],
  ): Promise<AIServiceResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      // Check session before calling edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Try refreshing the session
        const { data: { session: refreshed } } = await supabase.auth.refreshSession()
        if (!refreshed) {
          throw new Error('No active session — please sign out and sign back in')
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: message.trim().slice(0, 1000),
          conversationHistory: conversationHistory.slice(-10),
        },
      })

      // Temporary debug: log the full response
      if (data?._debug) {
        console.log('[AI Search Debug]', JSON.stringify(data._debug, null, 2))
      }

      if (error) {
        // Try to read the response body for more details
        const context = (error as any)?.context
        let detail = error.message || 'AI service request failed'
        if (context) {
          try {
            if (typeof context.json === 'function') {
              const body = await context.json()
              detail = body?.error || detail
            } else if (typeof context.text === 'function') {
              detail = await context.text()
            }
          } catch {}
        }
        throw new Error(detail)
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      return {
        message: data?.message || 'No response from AI service',
        products: data?.products,
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        message:
          `[DEBUG] Error: ${errMsg}\n\n` +
          "I apologize, but I'm experiencing some technical difficulties right now. " +
          'Please try again in a moment, or browse our help section for common questions.',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const aiService = new AIService()