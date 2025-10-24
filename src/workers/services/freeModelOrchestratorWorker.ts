/**
 * Cloudflare Workers-Compatible Free Model Orchestrator
 * 
 * Uses Cloudflare Workers environment variables instead of process.env
 */

export interface ModelConfig {
  name: string;
  provider: 'groq' | 'together' | 'gemini' | 'huggingface' | 'ollama';
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

export interface WorkerEnv {
  GROQ_API_KEY?: string;
  TOGETHER_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  HUGGINGFACE_API_KEY?: string;
}

export class FreeModelOrchestratorWorker {
  private env: WorkerEnv;
  private models: ModelConfig[] = [
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
      name: 'Llama 3 70B (Together)',
      provider: 'together',
      model: 'meta-llama/Llama-3-70b-chat-hf',
      maxTokens: 8192,
      contextWindow: 8192,
      speed: 'fast',
      capabilities: ['chat', 'reasoning'],
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
      name: 'Zephyr 7B (HuggingFace)',
      provider: 'huggingface',
      model: 'HuggingFaceH4/zephyr-7b-beta',
      maxTokens: 4096,
      contextWindow: 4096,
      speed: 'medium',
      capabilities: ['chat', 'reasoning'],
    },
  ];

  constructor(env: WorkerEnv) {
    this.env = env;
  }

  async listAvailableModels(): Promise<ModelConfig[]> {
    const available: ModelConfig[] = [];

    for (const model of this.models) {
      const isAvailable = await this.checkModelAvailability(model);
      if (isAvailable) {
        available.push(model);
      }
    }

    return available;
  }

  private async checkModelAvailability(model: ModelConfig): Promise<boolean> {
    try {
      switch (model.provider) {
        case 'groq':
          return !!this.env.GROQ_API_KEY;
        case 'together':
          return !!this.env.TOGETHER_API_KEY;
        case 'gemini':
          return !!this.env.GOOGLE_AI_API_KEY;
        case 'huggingface':
          return !!this.env.HUGGINGFACE_API_KEY;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  async *streamResponse(messages: Message[]): AsyncGenerator<string> {
    // Try each available model in order
    for (const model of this.models) {
      const isAvailable = await this.checkModelAvailability(model);
      if (!isAvailable) continue;

      try {
        switch (model.provider) {
          case 'groq':
            yield* this.streamGroq(messages, model);
            return;
          case 'together':
            yield* this.streamTogether(messages, model);
            return;
          case 'gemini':
            yield* this.streamGemini(messages, model);
            return;
        }
      } catch (error) {
        console.error(`Model ${model.name} failed:`, error);
        continue;
      }
    }

    throw new Error('No models available. Please configure API keys.');
  }

  private async *streamGroq(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: model.model,
        messages,
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  private async *streamTogether(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: model.model,
        messages,
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  private async *streamGemini(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    // Gemini uses a different API format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.model}:generateContent?key=${this.env.GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Simulate streaming by yielding chunks
    const chunkSize = 50;
    for (let i = 0; i < text.length; i += chunkSize) {
      yield text.slice(i, i + chunkSize);
    }
  }

  private async *streamHuggingFace(messages: Message[], model: ModelConfig): AsyncGenerator<string> {
    // Convert messages to prompt
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model.model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data[0]?.generated_text || '';
    
    // Simulate streaming by yielding chunks
    const chunkSize = 50;
    for (let i = 0; i < text.length; i += chunkSize) {
      yield text.slice(i, i + chunkSize);
    }
  }
}
