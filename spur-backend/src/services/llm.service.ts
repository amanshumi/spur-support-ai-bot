import { GoogleGenAI } from '@google/genai';

export interface LLMResponse {
  content: string;
  tokensUsed?: number;
  provider: string;
  model: string;
}

export interface MessageHistory {
  sender: 'USER' | 'AI';
  text: string;
  createdAt: Date;
}

export class LLMService {
  private provider: string;
  private geminiClient: GoogleGenAI | null = null;
  private geminiApiKey: string;
  private geminiModel: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'gemini';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    
    if (this.provider === 'gemini' && !this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is required in environment variables');
    }
    
    this.initializeClient();
  }

  private initializeClient() {
    if (this.provider === 'gemini') {
      this.geminiClient = new GoogleGenAI({
        apiKey: this.geminiApiKey,
      });
    }
  }

  private getStoreKnowledge(): string {
    return `You are a helpful support agent for "SpurStore", a small e-commerce store.

STORE KNOWLEDGE BASE:

1. SHIPPING POLICY:
   - Free shipping on orders over $50
   - Standard shipping: 3-5 business days ($4.99)
   - Express shipping: 1-2 business days ($9.99)
   - We ship to USA, Canada, UK, Australia, and EU countries

2. RETURN & REFUND POLICY:
   - 30-day return policy
   - Items must be in original condition
   - Refunds processed within 5-7 business days
   - Free returns for defective items

3. SUPPORT HOURS:
   - Monday-Friday: 9 AM - 6 PM EST
   - Saturday: 10 AM - 4 PM EST
   - Sunday: Closed
   - Email: support@spurstore.com

4. PRODUCTS:
   - Smartphones, laptops, headphones, smartwatches
   - 1-year manufacturer warranty
   - Price match guarantee for 7 days

5. PAYMENT OPTIONS:
   - Credit/Debit Cards
   - PayPal, Apple Pay, Google Pay

INSTRUCTIONS:
- Identify as "SpurStore Support Agent"
- Be concise and helpful (2-3 sentences usually)
- If unsure: "I'll connect you with a human agent during business hours"
- Never make promises beyond stated policies`;
  }

  private buildPrompt(history: MessageHistory[], userMessage: string): string {
    const knowledgeBase = this.getStoreKnowledge();
    
    let conversationContext = '';
    if (history.length > 0) {
      conversationContext = '\n\nCONVERSATION HISTORY:\n';
      history.slice(-5).forEach(msg => {
        const role = msg.sender === 'USER' ? 'Customer' : 'Support Agent';
        conversationContext += `${role}: ${msg.text}\n`;
      });
    }

    return `${knowledgeBase}${conversationContext}

CURRENT CUSTOMER QUESTION: "${userMessage}"

Provide a helpful response based ONLY on the store knowledge above.`;
  }

  async generateReply(
    userMessage: string,
    history: MessageHistory[] = []
  ): Promise<LLMResponse> {
    try {
      // Input validation
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      // Trim if too long
      const trimmedMessage = userMessage.length > 2000 
        ? userMessage.substring(0, 2000) + '...'
        : userMessage;

      const prompt = this.buildPrompt(history, trimmedMessage);

      if (this.provider === 'gemini') {
        return await this.generateWithGemini(prompt);
      }

      throw new Error(`Unsupported provider: ${this.provider}`);
    } catch (error: any) {
      // Graceful error handling
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        throw new Error('AI service is currently unavailable. Please try again later.');
      }
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        throw new Error('We\'re experiencing high demand. Please wait a moment.');
      }
      
      throw new Error('Unable to generate response. Please try again.');
    }
  }

  private async generateWithGemini(prompt: string): Promise<LLMResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const response = await this.geminiClient.models.generateContent({
      model: this.geminiModel,
      contents: prompt,
        config  : {
            temperature: 0.2,
            maxOutputTokens: 1024,
            systemInstruction: 'Respond concisely and helpfully based on the provided store knowledge.'
        }
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    return {
      content: response.text,
      provider: 'gemini',
      model: this.geminiModel,
    };
  }
}