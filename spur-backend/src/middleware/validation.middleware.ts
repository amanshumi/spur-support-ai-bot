import { Request, Response, NextFunction } from 'express';

export function validateMessage(req: Request, res: Response, next: NextFunction): void {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({
      error: 'Message is required and must be a string',
      code: 'VALIDATION_ERROR',
    });
    return; // Add explicit return
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    res.status(400).json({
      error: 'Message cannot be empty or whitespace only',
      code: 'EMPTY_MESSAGE',
    });
    return; // Add explicit return
  }

  if (trimmedMessage.length > 5000) {
    res.status(400).json({
      error: 'Message is too long. Maximum 5000 characters allowed.',
      code: 'MESSAGE_TOO_LONG',
    });
    return; // Add explicit return
  }

  // Sanitize input (basic XSS prevention)
  req.body.message = trimmedMessage
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .substring(0, 5000);

  next(); // This will be reached only if all validation passes
}