import { prisma } from '../lib/prisma';
import { LLMService, MessageHistory, LLMResponse } from './llm.service';
import { Logger } from '../utils/logger';

const logger = new Logger('ChatService');

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  messageId: string;
  conversationId: string;
}

export class ChatService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Validate input
      this.validateMessage(request.message);

      // Get or create conversation
      const conversation = await this.getOrCreateConversation(request.sessionId);

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'USER',
          text: request.message,
        },
      });

      // Get conversation history for context
      const history = await this.getConversationHistory(conversation.id);

      // Generate AI reply
      let llmResponse: LLMResponse;
      try {
        llmResponse = await this.llmService.generateReply(request.message, history);
      } catch (error: any) {
        // Fallback response if LLM fails
        llmResponse = {
          content: "I apologize, but I'm having trouble accessing our knowledge base. Please try again in a moment, or contact support@spurstore.com for immediate assistance.",
          provider: 'fallback',
          model: 'none',
        };
      }

      // Save AI response
      const aiMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'AI',
          text: llmResponse.content,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      logger.info(`Processed message for conversation ${conversation.id}`);

      return {
        reply: llmResponse.content,
        sessionId: conversation.sessionId,
        messageId: aiMessage.id,
        conversationId: conversation.id,
      };
    } catch (error: any) {
      logger.error('Error processing chat message:', { error: error.message });
      throw error;
    }
  }

  private validateMessage(message: string): void {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 5000) {
      throw new Error('Message is too long. Please limit to 5000 characters.');
    }
  }

  private async getOrCreateConversation(sessionId?: string): Promise<{ id: string; sessionId: string }> {
    if (sessionId) {
      const conversation = await prisma.conversation.findUnique({
        where: { sessionId },
      });

      if (conversation) {
        return conversation;
      }
    }

    // Create new conversation with a unique session ID
    const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = await prisma.conversation.create({
      data: {
        sessionId: newSessionId,
        metadata: JSON.stringify({
          startedAt: new Date().toISOString(),
          llmProvider: process.env.LLM_PROVIDER,
        }),
      },
    });

    logger.info(`Created new conversation: ${conversation.id}`);
    return conversation;
  }

  private async getConversationHistory(conversationId: string): Promise<MessageHistory[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    return messages.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt,
    }));
  }

  async getConversation(sessionId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (conversation && typeof conversation.metadata === 'string') {
      try {
        conversation.metadata = JSON.parse(conversation.metadata);
      } catch {
        conversation.metadata = {};
      }
    }

    return conversation;
  }

  async getHealth() {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        database: 'healthy',
        llm: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        database: 'unhealthy',
        llm: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}