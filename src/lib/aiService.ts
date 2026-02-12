import { supabase } from './supabase'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIServiceResponse {
  message: string
  error?: string
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

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: message.trim().slice(0, 1000),
          conversationHistory: conversationHistory.slice(-10),
        },
      })

      if (error) {
        throw new Error(error.message || 'AI service request failed')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      return {
        message: data?.message || 'No response from AI service',
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        message:
          "I apologize, but I'm experiencing some technical difficulties right now. " +
          'Please try again in a moment, or browse our help section for common questions.',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const aiService = new AIService()