"use client"

import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-3", className)}>
      <div className="flex items-center gap-1">
        <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span
          className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-sm text-muted-foreground">Agent is typing...</span>
    </div>
  )
}
