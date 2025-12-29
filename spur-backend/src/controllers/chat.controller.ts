import { Request, Response } from 'express';
import { ChatService, ChatRequest } from '../services/chat.service';
import { Logger } from '../utils/logger';

const logger = new Logger('ChatController');
const chatService = new ChatService();

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId }: ChatRequest = req.body;

      // Validation
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Message is required and must be a string',
          code: 'VALIDATION_ERROR',
        });
      }

      const trimmedMessage = message.trim();
      if (trimmedMessage.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message cannot be empty',
          code: 'EMPTY_MESSAGE',
        });
      }

      const result = await chatService.processMessage({
        message: trimmedMessage,
        sessionId,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in sendMessage:', { error: error.message });

      const statusCode = error.message.includes('cannot be empty') ||
                        error.message.includes('too long') ||
                        error.message.includes('invalid content') ? 400 : 500;

      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Internal server error',
        code: this.getErrorCode(error),
      });
    }
  }

  async getConversation(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId is required',
          code: 'VALIDATION_ERROR',
        });
      }

      const conversation = await chatService.getConversation(sessionId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
          code: 'NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      logger.error('Error in getConversation:', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  async healthCheck(_req: Request, res: Response) {
    try {
      const health = await chatService.getHealth();
      
      const isHealthy = health.database === 'healthy' && health.llm === 'healthy';
      
      return res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        ...health,
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      return res.status(503).json({
        status: 'unhealthy',
        error: 'Service unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private getErrorCode(error: Error): string {
    if (error.message.includes('cannot be empty')) return 'EMPTY_MESSAGE';
    if (error.message.includes('too long')) return 'MESSAGE_TOO_LONG';
    if (error.message.includes('invalid content')) return 'INVALID_CONTENT';
    if (error.message.includes('unavailable')) return 'SERVICE_UNAVAILABLE';
    if (error.message.includes('Rate limit')) return 'RATE_LIMITED';
    if (error.message.includes('Authentication')) return 'AUTH_ERROR';
    return 'INTERNAL_ERROR';
  }
}