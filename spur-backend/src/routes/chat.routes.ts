import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateMessage } from '../middleware/validation.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const chatController = new ChatController();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Health check
router.get('/health', chatController.healthCheck.bind(chatController));

// Get conversation history
router.get('/conversation/:sessionId', chatController.getConversation.bind(chatController));

// Send message (spec-compliant endpoint)
router.post('/chat/message', validateMessage, chatController.sendMessage.bind(chatController));

// Alternative endpoint
router.post('/message', validateMessage, chatController.sendMessage.bind(chatController));

export default router;