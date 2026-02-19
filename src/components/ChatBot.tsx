import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { aiService, type AIMessage, type AIProduct } from '../lib/aiService'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  products?: AIProduct[]
}

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: "Hi! I'm your Car Parts AI assistant. I can help you find products, understand how to use the application, or answer questions about our services. How can I help you today?",
    isBot: true,
    timestamp: new Date()
  }])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Convert messages to AI conversation format
  const getConversationHistory = (): AIMessage[] => {
    return messages.slice(1).map(message => ({
      role: message.isBot ? 'assistant' : 'user',
      content: message.content
    }))
  }

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend || isLoading) return

    if (message) {
      setShowQuickActions(false)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const conversationHistory = getConversationHistory()
      const response = await aiService.sendMessage(messageToSend, conversationHistory)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isBot: true,
        timestamp: new Date(),
        products: response.products
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error generating AI response:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble responding right now. Please try again or contact our support team for assistance.",
        isBot: true,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    { label: "How to search for parts?", message: "How do I search for car parts?" },
    { label: "How to place an order?", message: "How do I place an order?" },
    { label: "Account setup help", message: "How do I set up my account?" },
    { label: "Writing reviews", message: "How do I write product reviews?" },
    { label: "Seller features", message: "Tell me about seller features" },
    { label: "App navigation", message: "How do I navigate the app?" }
  ]

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-[28rem] h-[700px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Car Parts AI Assistant</h3>
            <p className="text-xs text-blue-100">Online • Ready to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMessages([{
                id: '1',
                content: "Hi! I'm your Car Parts AI assistant. I can help you find products, understand how to use the application, or answer questions about our services. How can I help you today?",
                isBot: true,
                timestamp: new Date()
              }])
              setShowQuickActions(true)
              setInputMessage('')
            }}
            className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
            title="Clear chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                message.isBot
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.products && message.products.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-gray-600/60 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-500 transition-colors group"
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {product.brand && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{product.brand}</span>
                          )}
                          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className={`text-[10px] px-1 rounded ${
                            product.condition === 'new'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {product.condition}
                          </span>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.isBot
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-blue-100'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Action Buttons */}
        {showQuickActions && messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">💡 Quick Help:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(action.message)}
                  disabled={!user}
                  className="text-xs px-2 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={user ? "Ask me anything..." : "Sign in to chat..."}
              disabled={!user || isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={2}
              maxLength={500}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || !user || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {!user && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Please sign in to start chatting with our AI assistant
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {inputMessage.length}/500 characters
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}