"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import type { Message } from "@/lib/chat-api"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user"

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className={cn("size-8 shrink-0", isUser ? "bg-primary" : "bg-emerald-600")}>
        <AvatarFallback className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white")}>
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <time className={cn("text-[10px] mt-1 block", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
    </div>
  )
}
