# SpurStore AI Support Chat - Frontend

A React/Next.js frontend for the SpurStore AI Support Agent chat widget. This is part of the Spur Software Engineer Hiring Assignment.

## Live Demo

- **Frontend:** [Deployed URL - Add after deployment]
- **Backend API:** [Backend URL - Add after deployment]

## Features

### Chat UI
- Scrollable message list with smooth auto-scroll to latest message
- Clear visual distinction between user and AI messages (different colors, avatars, alignment)
- Input box with send button
- Enter key to send (Shift+Enter for new line)
- Auto-resizing textarea for longer messages

### UX Enhancements
- Disabled send button while request is in flight
- "Agent is typing..." indicator with animated dots
- Welcome message on first load
- New conversation button to start fresh

### Session Persistence
- `sessionId` stored in localStorage
- Conversation history loaded on page reload (if backend supports `/chat/history/:sessionId`)
- Graceful handling when localStorage is unavailable (e.g., private browsing)

### Input Validation
- Empty messages are rejected
- Character limit of 4,000 characters enforced
- Warning displayed when approaching character limit (3,500+)
- Error message shown when limit exceeded

### Error Handling
- Network errors caught and displayed with user-friendly messages
- API errors (400, 429, 500, 503) handled with specific messages
- Dismissible error notifications in the chat UI
- Graceful fallback when history endpoint is unavailable

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Backend API running (see backend README)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:7000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:7000/api` |

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page with chat widget
│   └── globals.css         # Global styles (Tailwind)
├── components/
│   ├── chat/
│   │   ├── chat-widget.tsx     # Main chat container
│   │   ├── chat-message.tsx    # Individual message component
│   │   ├── chat-input.tsx      # Input area with validation
│   │   └── typing-indicator.tsx # "Agent is typing..." component
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── chat-api.ts         # API service & session management
│   └── utils.ts            # Utility functions
└── README.md
```

## Architecture Overview

### Component Hierarchy

```
page.tsx
└── ChatWidget
    ├── ChatMessage (multiple)
    ├── TypingIndicator
    └── ChatInput
```

### Data Flow

1. **User sends message** → `ChatInput` validates input → calls `onSend` callback
2. **ChatWidget** adds user message to state → sets loading state → calls `sendMessage` API
3. **API response** → AI message added to state → loading state cleared
4. **Auto-scroll** triggered on messages/loading state change

### State Management

- Local component state with `useState` hooks
- Session ID stored in localStorage for persistence
- No global state management (SWR not needed for this simple use case)

### API Integration

The frontend communicates with two backend endpoints:

#### POST `/api/chat/message`
Request:
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-session-id"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "reply": "Our return policy allows...",
    "sessionId": "session-123",
    "messageId": "msg-456",
    "conversationId": "conv-789"
  }
}
```

#### GET `/api/chat/history/:sessionId` (Optional)
Response:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-1",
        "sender": "user",
        "text": "Hello",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "conversationId": "conv-789"
  }
}
```

## Design Decisions

### Why Next.js App Router?
- Server-side rendering for better SEO and initial load performance
- Built-in TypeScript support
- Easy deployment to Vercel

### Why shadcn/ui?
- High-quality, accessible components
- Tailwind CSS integration
- Customizable and lightweight (not a dependency, just copied components)

### Why localStorage for session?
- Simple persistence without authentication
- Works offline
- No backend dependency for session storage
- Graceful fallback when unavailable

### Message Validation
- Client-side validation provides instant feedback
- 4,000 character limit matches typical LLM context considerations
- Warning at 3,500 characters gives users time to adjust

## Trade-offs & Limitations

### Current Limitations

1. **No real-time updates** - Uses request/response pattern, not WebSocket
2. **Single session per browser** - localStorage stores only one session
3. **No message editing/deletion** - Messages are immutable once sent
4. **No authentication** - Anyone can access the chat

### If I Had More Time...

1. **WebSocket Integration**
   - Real-time typing indicators from the agent
   - Streaming responses as they're generated
   - Connection status indicator

2. **Enhanced UX**
   - Message reactions (thumbs up/down for feedback)
   - Copy message button
   - Markdown rendering for AI responses
   - Code syntax highlighting

3. **Accessibility Improvements**
   - ARIA live regions for new messages
   - Better keyboard navigation
   - Screen reader announcements for typing indicator

4. **Testing**
   - Unit tests for components with React Testing Library
   - Integration tests for API calls
   - E2E tests with Playwright

5. **Performance**
   - Virtual scrolling for long conversations
   - Message pagination
   - Optimistic updates

6. **Features**
   - Multiple conversation support
   - Conversation search
   - Export conversation history
   - Dark/light theme toggle

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable `NEXT_PUBLIC_API_URL` pointing to your backend
4. Deploy

### Other Platforms

The frontend is a standard Next.js app and can be deployed to:
- Netlify
- Railway
- Render
- Any platform supporting Node.js

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Technologies Used

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Icons:** Lucide React

## License

MIT
