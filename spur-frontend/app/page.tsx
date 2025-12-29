import { ChatWidget } from "@/components/chat/chat-widget"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">SpurStore Support</h1>
          <p className="text-sm text-muted-foreground">
            Get instant answers to your questions about shipping, returns, and more.
          </p>
        </div>

        {/* Chat Widget */}
        <ChatWidget />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4">Powered by AI. Available 24/7.</p>
      </div>
    </main>
  )
}
