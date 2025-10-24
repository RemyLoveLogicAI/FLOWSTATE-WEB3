/**
 * Free Model Orchestrator
 * 
 * Supports:
 * - Cloud: Groq, Together AI, Hugging Face Inference API, Google Gemini (free tier)
 * - Local: Ollama, LM Studio
 * - Fallback cascade for reliability
 */

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModelConfig {
  name: string;
  provider: 'groq' | 'together' | 'huggingface' | 'gemini' | 'ollama' | 'lmstudio';
  endpoint?: string;
  model: string;
  maxTokens: number;
  contextWindow: number;
  speed: 'very-fast' | 'fast' | 'medium';
  capabilities: string[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class FreeModelOrchestrator {
  private models: ModelConfig[] = [
    // Cloud Models (Free Tier)
    {
      name: 'Llama 3 70B (Groq)',
      provider: 'groq',
      model: 'llama3-70b-8192',
      maxTokens: 8192,
      contextWindow: 8192,
      speed: 'very-fast',
      capabilities: ['chat', 'reasoning', 'code'],
    },
    {
      name: 'Mixtral 8x7B (Groq)',
      provider: 'groq',
      model: 'mixtral-8x7b-32768',
      maxTokens: 32768,
      contextWindow: 32768,
      speed: 'very-fast',
      capabilities: ['chat', 'reasoning', 'multilingual'],
    },
    {
      name: 'Gemma 7B (Groq)',
      provider: 'groq',
      model: 'gemma-7b-it',
      maxTokens: 8192,
      contextWindow: 8192,
      speed: 'very-fast',
      capabilities: ['chat', 'fast'],
    },
    {
      name: 'Llama 3 70B (Together)',
      provider: 'together',
      model: 'meta-llama/Llama-3-70b-chat-hf',
      maxTokens: 8192,
      contextWindow: 8192,
      speed: 'fast',
      capabilities: ['chat', 'reasoning'],
    },
    {
      name: 'Mixtral 8x22B (Together)',
      provider: 'together',
      model: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
      maxTokens: 65536,
      contextWindow: 65536,
      speed: 'medium',
      capabilities: ['chat', 'reasoning', 'long-context'],
    },
    {
      name: 'Gemini Pro (Free)',
      provider: 'gemini',
      model: 'gemini-pro',
      maxTokens: 30720,
      contextWindow: 30720,
      speed: 'fast',
      capabilities: ['chat', 'reasoning', 'multimodal'],
    },
    {
      name: 'Zephyr 7B (HF)',
      provider: 'huggingface',
      model: 'HuggingFaceH4/zephyr-7b-beta',
      maxTokens: 4096,
      contextWindow: 4096,
      speed: 'medium',
      capabilities: ['chat'],
    },
    // Local Models (Always available if running)
    {
      name: 'Llama 3 8B (Local)',
      provider: 'ollama',
      endpoint: 'http://localhost:11434',
      model: 'llama3:8b',
      maxTokens: 8192,
      contextWindow: 8192,
      speed: 'fast',
      capabilities: ['chat', 'code', 'offline'],
    },
    {
      name: 'Mistral 7B (Local)',
      provider: 'ollama',
      endpoint: 'http://localhost:11434',
      model: 'mistral:7b',
      maxTokens: 8192,
      contextWindow: 8192,
      speed: 'fast',
      capabilities: ['chat', 'code', 'offline'],
    },
    {
      name: 'CodeLlama 13B (Local)',
      provider: 'ollama',
      endpoint: 'http://localhost:11434',
      model: 'codellama:13b',
      maxTokens: 4096,
      contextWindow: 4096,
      speed: 'medium',
      capabilities: ['code', 'offline'],
    },
  ];

  private gemini: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize Gemini if API key available
    if (process.env.GOOGLE_AI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  /**
   * Smart model selection with fallback cascade
   */
  async selectBestAvailableModel(
    query: string,
    requirements?: {
      needsCode?: boolean;
      needsReasoning?: boolean;
      needsSpeed?: boolean;
      preferLocal?: boolean;
    }
  ): Promise<ModelConfig> {
    // Filter models based on requirements
    let candidates = this.models;

    if (requirements?.needsCode) {
      candidates = candidates.filter(m => m.capabilities.includes('code'));
    }

    if (requirements?.preferLocal) {
      candidates = candidates.filter(m => m.provider === 'ollama' || m.provider === 'lmstudio');
    }

    if (requirements?.needsSpeed) {
      candidates = candidates.filter(m => m.speed === 'very-fast' || m.speed === 'fast');
    }

    // Test models in order of preference
    for (const model of candidates) {
      const isAvailable = await this.testModelAvailability(model);
      if (isAvailable) {
        console.log(`✓ Selected model: ${model.name}`);
        return model;
      }
    }

    // Fallback to Gemini (usually available)
    const geminiModel = this.models.find(m => m.provider === 'gemini');
    if (geminiModel) {
      console.log('⚠ Falling back to Gemini');
      return geminiModel;
    }

    // Last resort: first local model
    const localModel = this.models.find(m => m.provider === 'ollama');
    if (localModel) {
      console.log('⚠ Falling back to local model');
      return localModel;
    }

    throw new Error('No available models found');
  }

  /**
   * Test if a model is available
   */
  private async testModelAvailability(model: ModelConfig): Promise<boolean> {
    try {
      switch (model.provider) {
        case 'groq':
          return !!process.env.GROQ_API_KEY;
        
        case 'together':
          return !!process.env.TOGETHER_API_KEY;
        
        case 'huggingface':
          return !!process.env.HUGGINGFACE_API_KEY;
        
        case 'gemini':
          return !!this.gemini;
        
        case 'ollama':
          return await this.testOllama(model.endpoint!);
        
        case 'lmstudio':
          return await this.testLMStudio();
        
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Stream response from selected model
   */
  async *streamResponse(
    messages: Message[],
    modelConfig?: ModelConfig
  ): AsyncGenerator<string> {
    let model = modelConfig;
    
    if (!model) {
      const lastMessage = messages[messages.length - 1]?.content || '';
      model = await this.selectBestAvailableModel(lastMessage);
    }

    console.log(`🤖 Using ${model.name} (${model.provider})`);

    try {
      switch (model.provider) {
        case 'groq':
          yield* this.streamGroq(messages, model);
          break;
        
        case 'together':
          yield* this.streamTogether(messages, model);
          break;
        
        case 'huggingface':
          yield* this.streamHuggingFace(messages, model);
          break;
        
        case 'gemini':
          yield* this.streamGemini(messages, model);
          break;
        
        case 'ollama':
          yield* this.streamOllama(messages, model);
          break;
        
        case 'lmstudio':
          yield* this.streamLMStudio(messages, model);
          break;
      }
    } catch (error) {
      console.error(`Error with ${model.name}:`, error);
      
      // Try fallback
      const fallbackModel = await this.selectBestAvailableModel('', { needsSpeed: true });
      if (fallbackModel.name !== model.name) {
        console.log(`⚠ Retrying with ${fallbackModel.name}`);
        yield* this.streamResponse(messages, fallbackModel);
      } else {
        throw error;
      }
    }
  }

  /**
   * Stream from Groq (Lightning Fast!)
   */
  private async *streamGroq(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model,
        messages,
        stream: true,
        max_tokens: model.maxTokens,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

      for (const line of lines) {
        const data = line.replace('data: ', '');
        if (data === '[DONE]') return;

        try {
          const json = JSON.parse(data);
          const content = json.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {}
      }
    }
  }

  /**
   * Stream from Together AI
   */
  private async *streamTogether(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model,
        messages,
        stream: true,
        max_tokens: model.maxTokens,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

      for (const line of lines) {
        const data = line.replace('data: ', '');
        if (data === '[DONE]') return;

        try {
          const json = JSON.parse(data);
          const content = json.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {}
      }
    }
  }

  /**
   * Stream from Hugging Face Inference API
   */
  private async *streamHuggingFace(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model.model}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: model.maxTokens,
          return_full_text: false,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    yield response.data[0]?.generated_text || response.data.generated_text || '';
  }

  /**
   * Stream from Gemini
   */
  private async *streamGemini(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    if (!this.gemini) throw new Error('Gemini not initialized');

    const geminiModel = this.gemini.getGenerativeModel({ model: model.model });
    const chat = geminiModel.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessageStream(messages[messages.length - 1].content);

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  /**
   * Stream from Ollama (Local)
   */
  private async *streamOllama(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    const response = await fetch(`${model.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.model,
        messages,
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            yield json.message.content;
          }
        } catch {}
      }
    }
  }

  /**
   * Stream from LM Studio (Local)
   */
  private async *streamLMStudio(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

      for (const line of lines) {
        const data = line.replace('data: ', '');
        if (data === '[DONE]') return;

        try {
          const json = JSON.parse(data);
          const content = json.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {}
      }
    }
  }

  /**
   * Test Ollama availability
   */
  private async testOllama(endpoint: string): Promise<boolean> {
    try {
      const response = await axios.get(`${endpoint}/api/tags`, { timeout: 2000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Test LM Studio availability
   */
  private async testLMStudio(): Promise<boolean> {
    try {
      const response = await axios.get('http://localhost:1234/v1/models', { timeout: 2000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * List all available models
   */
  async listAvailableModels(): Promise<ModelConfig[]> {
    const available: ModelConfig[] = [];

    for (const model of this.models) {
      if (await this.testModelAvailability(model)) {
        available.push(model);
      }
    }

    return available;
  }

  /**
   * Get model info
   */
  getModelInfo(modelName: string): ModelConfig | undefined {
    return this.models.find(m => m.name === modelName);
  }
}
