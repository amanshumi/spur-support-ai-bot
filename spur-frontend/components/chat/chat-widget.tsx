"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { TypingIndicator } from "./typing-indicator"
import {
  sendMessage,
  getStoredSessionId,
  storeSessionId,
  clearSession,
  getConversationHistory,
  type Message,
} from "@/lib/chat-api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, RotateCcw, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Welcome message from the AI agent
const WELCOME_MESSAGE: Message = {
  id: "welcome",
  sender: "ai",
  text: "Hi! I'm the SpurStore Support Agent. I'm here to help you with questions about shipping, returns, support hours, and more. How can I assist you today?",
  timestamp: new Date(),
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize session and load history
  useEffect(() => {
    const initSession = async () => {
      const storedSession = getStoredSessionId()
      if (storedSession) {
        setSessionId(storedSession)
        // Try to load conversation history
        const history = await getConversationHistory(storedSession)
        if (history.success && history.data.messages.length > 0) {
          const loadedMessages: Message[] = history.data.messages.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.createdAt),
          }))
          setMessages([WELCOME_MESSAGE, ...loadedMessages])
        }
      }
      setIsInitialized(true)
    }

    initSession()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const handleSendMessage = async (text: string) => {
    // Clear any previous errors
    setError(null)

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendMessage(text, sessionId || undefined)

      if (response.success) {
        // Store session ID for future requests
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId)
          storeSessionId(response.data.sessionId)
        }

        // Add AI response
        const aiMessage: Message = {
          id: response.data.messageId || `ai-${Date.now()}`,
          sender: "ai",
          text: response.data.reply,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        setError(response.error || "Failed to get a response. Please try again.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismissError = () => {
    setError(null)
  }

  const handleNewConversation = () => {
    clearSession()
    setSessionId(null)
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }])
    setError(null)
  }

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md mx-auto h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading chat...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col overflow-hidden shadow-lg">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b py-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-emerald-600 text-white">
              <Bot className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">SpurStore Support</CardTitle>
              <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewConversation}
            className="text-muted-foreground hover:text-foreground"
            title="Start new conversation"
          >
            <RotateCcw className="size-4" />
            <span className="sr-only">New conversation</span>
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="py-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && <TypingIndicator />}

            {error && (
              <div className="px-4 py-2">
                <div className={cn("flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive")}>
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <p className="flex-1">{error}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/20"
                    onClick={handleDismissError}
                  >
                    <X className="size-3" />
                    <span className="sr-only">Dismiss error</span>
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask about shipping, returns, or support..."
      />
    </Card>
  )
}
