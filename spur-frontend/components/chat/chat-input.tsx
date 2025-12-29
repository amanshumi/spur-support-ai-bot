"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateMessage } from "@/lib/chat-api"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = "Type your message..." }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [charWarning, setCharWarning] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = message.trim()
    if (!trimmed || disabled) return

    const validation = validateMessage(trimmed)
    if (!validation.valid) {
      return
    }

    onSend(trimmed)
    setMessage("")
    setCharWarning(null)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    const validation = validateMessage(value)
    if (validation.warning) {
      setCharWarning(validation.warning)
    } else if (validation.error && value.trim().length > 0) {
      setCharWarning(validation.error)
    } else {
      setCharWarning(null)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [message])

  const validation = validateMessage(message)
  const isDisabled = disabled || !message.trim() || !validation.valid

  return (
    <div className="border-t bg-background">
      {charWarning && (
        <div className="px-4 pt-2">
          <p className={cn("text-xs", validation.valid ? "text-amber-600" : "text-destructive")}>{charWarning}</p>
        </div>
      )}
      <div className="flex items-end gap-2 p-4">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "max-h-[150px] min-h-[44px]",
          )}
        />
        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          size="icon"
          className={cn(
            "size-11 shrink-0 rounded-xl",
            "bg-emerald-600 hover:bg-emerald-700 text-white",
            "disabled:bg-muted disabled:text-muted-foreground",
          )}
        >
          <Send className="size-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
