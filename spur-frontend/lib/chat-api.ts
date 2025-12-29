// Chat API service for interacting with the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"

export interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
}

export interface ChatResponse {
  success: boolean
  data: {
    reply: string
    sessionId: string
    messageId: string
    conversationId: string
  }
  error?: string
}

export interface ConversationHistoryResponse {
  success: boolean
  data: {
    messages: Array<{
      id: string
      sender: "user" | "ai"
      text: string
      createdAt: string
    }>
    conversationId: string
  }
  error?: string
}

// Maximum message length (characters) - matches backend validation
const MAX_MESSAGE_LENGTH = 4000
// Warning threshold for long messages
const WARNING_THRESHOLD = 3500

export function validateMessage(message: string): { valid: boolean; error?: string; warning?: string } {
  const trimmed = message.trim()

  if (!trimmed) {
    return { valid: false, error: "Message cannot be empty" }
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message too long (${trimmed.length}/${MAX_MESSAGE_LENGTH} characters). Please shorten your message.`,
    }
  }

  if (trimmed.length > WARNING_THRESHOLD) {
    return {
      valid: true,
      warning: `Your message is getting long (${trimmed.length}/${MAX_MESSAGE_LENGTH} characters).`,
    }
  }

  return { valid: true }
}

export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  const validation = validateMessage(message)
  if (!validation.valid) {
    return {
      success: false,
      data: { reply: "", sessionId: "", messageId: "", conversationId: "" },
      error: validation.error,
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        sessionId: sessionId || undefined,
      }),
    })

    if (!response.ok) {
      let errorMessage = "Something went wrong. Please try again."

      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If response is not JSON, use status-based message
        if (response.status === 429) {
          errorMessage = "Too many requests. Please wait a moment and try again."
        } else if (response.status === 503) {
          errorMessage = "Service temporarily unavailable. Please try again later."
        } else if (response.status >= 500) {
          errorMessage = "Server error. Our team has been notified. Please try again later."
        } else if (response.status === 400) {
          errorMessage = "Invalid request. Please check your message and try again."
        }
      }

      return {
        success: false,
        data: { reply: "", sessionId: sessionId || "", messageId: "", conversationId: "" },
        error: errorMessage,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Chat API Error:", error)

    if (error instanceof TypeError) {
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return {
          success: false,
          data: { reply: "", sessionId: sessionId || "", messageId: "", conversationId: "" },
          error: "Unable to connect to the server. Please check your internet connection.",
        }
      }
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        data: { reply: "", sessionId: sessionId || "", messageId: "", conversationId: "" },
        error: "Request timed out. Please try again.",
      }
    }

    return {
      success: false,
      data: { reply: "", sessionId: sessionId || "", messageId: "", conversationId: "" },
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function getConversationHistory(sessionId: string): Promise<ConversationHistoryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // If history endpoint doesn't exist or returns error, return empty history
      return {
        success: true,
        data: { messages: [], conversationId: "" },
      }
    }

    const data = await response.json()
    return data
  } catch {
    // If history fetch fails, return empty history (not a critical error)
    return {
      success: true,
      data: { messages: [], conversationId: "" },
    }
  }
}

// Session management using localStorage
const SESSION_KEY = "spur_chat_session_id"

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    // Handle cases where localStorage is not available
    return null
  }
}

export function storeSessionId(sessionId: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SESSION_KEY, sessionId)
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // Silently fail if localStorage is not available
  }
}
