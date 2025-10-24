import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StreamOptions {
  onToken?: (token: string) => void;
  onComplete?: (response: any) => void;
  onError?: (error: Error) => void;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIOrchestrator {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;
  
  private models = {
    'gpt-4-turbo': { provider: 'openai', cost: 0.01, speed: 'fast' },
    'gpt-4': { provider: 'openai', cost: 0.03, speed: 'medium' },
    'gpt-3.5-turbo': { provider: 'openai', cost: 0.001, speed: 'very-fast' },
    'claude-3-opus': { provider: 'anthropic', cost: 0.015, speed: 'medium' },
    'claude-3-sonnet': { provider: 'anthropic', cost: 0.003, speed: 'fast' },
    'gemini-pro': { provider: 'google', cost: 0.001, speed: 'fast' },
    'gemini-pro-vision': { provider: 'google', cost: 0.002, speed: 'fast' }
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.gemini = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_API_KEY || ''
    );
  }

  /**
   * Automatically select the best AI model based on query
   */
  selectModel(query: string, options?: any): string {
    const lowerQuery = query.toLowerCase();
    
    // Check for specific requirements
    if (options?.needsVision || /image|photo|picture|visual/.test(lowerQuery)) {
      return 'gemini-pro-vision';
    }
    
    if (options?.needsCode || /code|program|function|script/.test(lowerQuery)) {
      return 'gpt-4-turbo';
    }
    
    if (options?.needsReasoning || /analyze|reason|think|complex/.test(lowerQuery)) {
      return 'claude-3-opus';
    }
    
    if (options?.needsSpeed || query.length < 100) {
      return 'gpt-3.5-turbo';
    }
    
    // Default to balanced model
    return 'gpt-4-turbo';
  }

  /**
   * Stream response from selected AI model
   */
  async streamResponse(
    messages: Message | Message[],
    options: StreamOptions = {}
  ): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    const model = options.model || this.selectModel(messageArray[messageArray.length - 1].content);
    const modelConfig = this.models[model as keyof typeof this.models];

    try {
      switch (modelConfig.provider) {
        case 'openai':
          await this.streamFromOpenAI(messageArray, model, options);
          break;
        case 'anthropic':
          await this.streamFromClaude(messageArray, model, options);
          break;
        case 'google':
          await this.streamFromGemini(messageArray, model, options);
          break;
        default:
          throw new Error(`Unknown provider: ${modelConfig.provider}`);
      }
    } catch (error) {
      console.error('Stream error:', error);
      options.onError?.(error as Error);
      
      // Fallback to another model
      if (model !== 'gpt-3.5-turbo') {
        await this.streamFromOpenAI(messageArray, 'gpt-3.5-turbo', options);
      }
    }
  }

  /**
   * Stream from OpenAI (ChatGPT)
   */
  private async streamFromOpenAI(
    messages: Message[],
    model: string,
    options: StreamOptions
  ): Promise<void> {
    const stream = await this.openai.chat.completions.create({
      model,
      messages: messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: true
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        options.onToken?.(content);
      }
    }

    options.onComplete?.({
      model,
      content: fullResponse,
      provider: 'openai',
      tokens: this.estimateTokens(fullResponse)
    });
  }

  /**
   * Stream from Claude (Anthropic)
   */
  private async streamFromClaude(
    messages: Message[],
    model: string,
    options: StreamOptions
  ): Promise<void> {
    // Convert messages to Claude format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const stream = await this.anthropic.messages.create({
      model,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      stream: true
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && 
          chunk.delta.type === 'text_delta') {
        const content = chunk.delta.text;
        fullResponse += content;
        options.onToken?.(content);
      }
    }

    options.onComplete?.({
      model,
      content: fullResponse,
      provider: 'anthropic',
      tokens: this.estimateTokens(fullResponse)
    });
  }

  /**
   * Stream from Gemini (Google)
   */
  private async streamFromGemini(
    messages: Message[],
    model: string,
    options: StreamOptions
  ): Promise<void> {
    const geminiModel = this.gemini.getGenerativeModel({ model });
    
    // Convert messages to Gemini format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    const result = await geminiModel.generateContentStream(prompt);
    let fullResponse = '';

    for await (const chunk of result.stream) {
      const content = chunk.text();
      fullResponse += content;
      options.onToken?.(content);
    }

    options.onComplete?.({
      model,
      content: fullResponse,
      provider: 'google',
      tokens: this.estimateTokens(fullResponse)
    });
  }

  /**
   * Process image with vision models
   */
  async analyzeImage(
    image: string, // base64 or URL
    prompt: string = 'Describe this image in detail'
  ): Promise<any> {
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: image.split(',')[1] // Remove data:image/jpeg;base64, prefix
          }
        }
      ]);

      return {
        description: result.response.text(),
        model: 'gemini-pro-vision',
        provider: 'google'
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get model information
   */
  getModelInfo(model: string) {
    return this.models[model as keyof typeof this.models];
  }

  /**
   * List available models
   */
  listModels() {
    return Object.entries(this.models).map(([name, config]) => ({
      name,
      ...config
    }));
  }
}
