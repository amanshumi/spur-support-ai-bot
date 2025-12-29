import { Request, Response, NextFunction } from 'express';

export function validateMessage(req: Request, res: Response, next: NextFunction) {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Message is required and must be a string',
      code: 'VALIDATION_ERROR',
    });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return res.status(400).json({
      error: 'Message cannot be empty or whitespace only',
      code: 'EMPTY_MESSAGE',
    });
  }

  if (trimmedMessage.length > 5000) {
    return res.status(400).json({
      error: 'Message is too long. Maximum 5000 characters allowed.',
      code: 'MESSAGE_TOO_LONG',
    });
  }

  // Sanitize input
  req.body.message = trimmedMessage
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  next();
}