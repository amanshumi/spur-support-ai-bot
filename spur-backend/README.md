# Spur AI Live Chat Agent - Backend Implementation

## 📋 Overview
This is a **mini AI support agent for a live chat widget** built for the Spur Software Engineer Hiring Assignment. The backend implements a customer support chat where an AI agent answers user questions using the Gemini LLM API.

## 🎯 Features
- **AI-Powered Support Agent**: Integrates with Google Gemini API for intelligent responses
- **Session Management**: Persistent conversations with unique session IDs
- **FAQ Knowledge Base**: Built-in store policies (shipping, returns, support hours)
- **Robust Error Handling**: Graceful degradation and user-friendly error messages
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Security checks and message length limits
- **Health Monitoring**: Comprehensive service health checks

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite with Prisma ORM
- **LLM Integration**: Google Gemini API
- **Cache**: In-memory (optional Redis extension ready)

### Directory Structure
```
src/
├── lib/prisma.ts          # Prisma database client
├── services/
│   ├── chat.service.ts    # Business logic for chat operations
│   └── llm.service.ts     # Gemini LLM integration
├── controllers/
│   └── chat.controller.ts # Request/response handling
├── routes/
│   └── chat.routes.ts     # API route definitions
├── middleware/
│   ├── error.middleware.ts # Global error handling
│   └── validation.middleware.ts # Input validation
├── utils/
│   └── logger.ts          # Structured logging
└── index.ts              # Application entry point
```

### Design Decisions
1. **Prisma ORM**: Chosen for type safety, migrations, and SQLite compatibility
2. **Service Layer**: Clear separation between business logic and API routes
3. **Graceful Degradation**: LLM failures return friendly fallback responses
4. **Session-Based Conversations**: Each chat gets a unique session ID for persistence
5. **Prompt Engineering**: System prompt includes store knowledge and conversation history

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd spur-backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```
Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

3. **Initialize the database:**
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npm run prisma:seed
```

4. **Start the development server:**
```bash
npm run dev
```
Server runs at: http://localhost:3000

### Alternative: Quick Start Script
```bash
# Run the complete setup
npm run setup
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
Response:
```json
{
  "status": "healthy",
  "database": "healthy",
  "llm": "healthy",
  "timestamp": "2025-12-29T20:00:00.000Z"
}
```

#### 2. Send Message (Spec-compliant)
```http
POST /chat/message
Content-Type: application/json

{
  "message": "What's your return policy?",
  "sessionId": "optional-existing-session-id"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "reply": "We have a 30-day return policy...",
    "sessionId": "session_1735516800000_abc123",
    "messageId": "clabc123xyz",
    "conversationId": "clabc456xyz"
  }
}
```

#### 3. Get Conversation History
```http
GET /conversation/:sessionId
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "clabc456xyz",
    "sessionId": "session_1735516800000_abc123",
    "messages": [
      {
        "id": "clabc123xyz",
        "sender": "USER",
        "text": "What's your return policy?",
        "createdAt": "2025-12-29T20:00:00.000Z"
      }
    ]
  }
}
```

### Alternative Endpoint
```http
POST /message
```
Same request/response format as `/chat/message`

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `LLM_PROVIDER` | LLM provider | `gemini` |
| `GEMINI_API_KEY` | Gemini API key | Required |
| `GEMINI_MODEL` | Gemini model | `gemini-2.0-flash-exp` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed origin | `http://localhost:5173` |

### Database Setup
The application uses SQLite for simplicity:
- Database file: `dev.db`
- Tables auto-created on first run
- Includes indexes for performance
- JSON data stored as TEXT (SQLite limitation)

### LLM Integration

#### Provider: Google Gemini
- Model: `gemini-2.0-flash-exp`
- Max tokens: 500
- Temperature: 0.7

#### Prompt Design
The system prompt includes:
- Store knowledge base (shipping, returns, support hours, products)
- Conversation history (last 5 messages)
- Instructions for tone and behavior
- Safety guardrails

Example prompt structure:
```
You are a helpful support agent for "SpurStore"...

STORE KNOWLEDGE:
1. Shipping policy: ...
2. Return policy: ...

CONVERSATION HISTORY:
Customer: Previous question
Support Agent: Previous answer

CURRENT QUESTION: "What's your return policy?"

Provide a helpful response...
```

## 🛡️ Security & Validation

### Input Validation
- Message length: 1-5000 characters
- Empty message rejection
- Basic XSS protection (script tag filtering)
- SQL injection prevention via Prisma

### Error Handling
- LLM API failures return user-friendly messages
- Database errors don't crash the application
- Rate limiting prevents abuse
- All errors are logged with context

### Rate Limiting
- 100 requests per 15 minutes per IP
- Clear error messages when limited
- Standard headers for API clients

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test message endpoint
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Do you ship to USA?"}'

# Test with session
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What about Canada?", "sessionId": "your-session-id"}'

# Get conversation history
curl http://localhost:3000/api/conversation/your-session-id
```

### Automated Testing Script
```bash
npm run test:api
```

## 📊 Database Schema

### Conversations Table
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique identifier |
| sessionId | TEXT (UNIQUE) | Session identifier |
| createdAt | DATETIME | Creation timestamp |
| updatedAt | DATETIME | Last update timestamp |
| metadata | TEXT (JSON) | Additional data |

### Messages Table
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique identifier |
| conversationId | TEXT (FK) | Reference to conversation |
| sender | TEXT | 'USER' or 'AI' |
| text | TEXT | Message content |
| createdAt | DATETIME | Creation timestamp |

## 🔍 Monitoring & Logging

### Logs
- Console output in development
- Structured JSON logs in production
- Request/response logging
- Error tracking with stack traces

### Health Checks
- Database connectivity
- LLM API availability
- Service status endpoint

## ⚡ Performance

### Optimizations
- Conversation history limited to 10 messages for context
- Message truncation at 2000 characters for LLM calls
- Database indexes on frequently queried fields
- Connection pooling via Prisma

### Limits
- 5000 character message limit
- 10-message history window
- 100 requests/15 minutes rate limit

## 🔄 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deployment Platforms
- **Render**: Easy Node.js deployment
- **Vercel**: Serverless functions
- **Railway**: Database included
- **Docker**: Containerized deployment

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 LLM Integration Details

### Provider Selection
**Google Gemini** was chosen because:
- Free tier available for testing
- Good response quality for support queries
- Simple API integration
- Fast response times

### Prompt Engineering
The prompt includes:
1. **System role**: Support agent identity
2. **Store knowledge**: Hardcoded FAQ data
3. **Conversation context**: Last 5 messages
4. **Instructions**: Tone, length, safety rules

### Error Handling
- API key errors: User-friendly message
- Rate limits: Suggest waiting
- Timeouts: Retry suggestion
- All other errors: Generic fallback

## 🤝 Extensibility

### Adding New LLM Providers
1. Add environment variables for new provider
2. Extend `LLMService` with new method
3. Update provider selection logic
4. Add to health checks

### Adding Channels
1. Create new route (e.g., `/api/whatsapp/message`)
2. Add channel-specific preprocessing
3. Reuse existing chat service
4. Add channel to metadata

### Adding Features
1. **Authentication**: Add auth middleware
2. **Multi-tenant**: Add organization ID to conversations
3. **Analytics**: Add message analytics service
4. **File uploads**: Extend message model

## 🧰 Trade-offs & Decisions

### Made for Simplicity
1. **SQLite over PostgreSQL**: Chosen for zero-dependency setup
2. **In-memory sessions**: Simpler than Redis for this scale
3. **Hardcoded FAQs**: Over database storage for predictable responses
4. **No authentication**: Per assignment requirements

### If I Had More Time
1. **Testing**: Add unit/integration tests
2. **Monitoring**: Add metrics and alerts
3. **Caching**: Implement Redis for frequent queries
4. **Streaming**: Add streaming responses for better UX
5. **Admin Panel**: View conversations and analytics
6. **Multi-LLM Fallback**: Fallback to secondary provider

### Scalability Considerations
- Database connection pooling ready
- Stateless services for horizontal scaling
- Rate limiting per IP/organization
- LLM token usage tracking

## 🐛 Troubleshooting

### Common Issues

1. **"Database tables don't exist"**
   ```bash
   npx prisma migrate reset --force
   npx prisma generate
   ```

2. **"Invalid API key"**
   - Check `.env` file has correct `GEMINI_API_KEY`
   - Verify key at: https://makersuite.google.com/app/apikey

3. **"Port already in use"**
   ```bash
   # Change PORT in .env or
   PORT=3001 npm run dev
   ```

4. **"CORS errors"**
   - Update `CORS_ORIGIN` in `.env`
   - Restart server

### Logs Location
- Console output in development
- Application logs: `logs/application-*.log`
- Error logs: `logs/error-*.log`

## 📄 License & Attribution

Built for Spur Software Engineer Hiring Assignment.

### Third-Party Services
- Google Gemini API for LLM
- Prisma ORM for database
- Express.js for web server

---

## ✅ Submission Checklist
- [x] Backend API with POST `/chat/message` endpoint
- [x] Gemini LLM integration with API key via env vars
- [x] Session-based conversation persistence
- [x] Input validation and error handling
- [x] Store knowledge base in prompt
- [x] Clear README with setup instructions
- [x] TypeScript best practices
- [x] Extensible architecture
- [x] Rate limiting and security

## 📞 Support

For issues with this implementation:
1. Check the troubleshooting section
2. Verify all environment variables
3. Ensure database migrations ran successfully
4. Check server logs for detailed errors

---