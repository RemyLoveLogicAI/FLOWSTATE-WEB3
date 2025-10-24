/**
 * Enhanced AI Orchestrator - The Brain of FlowState AI
 * 
 * Combines:
 * - ChatGPT's conversational excellence
 * - Claude's reasoning power
 * - Gemini's multimodal capabilities
 * - GenSpark's research depth
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VoiceService } from './voiceService.js';
import { SearchService } from './searchService.js';
import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    model?: string;
    tokens?: number;
    timestamp?: number;
    attachments?: Attachment[];
    sources?: Source[];
  };
}

export interface Attachment {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  mimeType?: string;
  name?: string;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
  relevance?: number;
}

export interface AgentTask {
  type: 'research' | 'code' | 'creative' | 'analysis' | 'multimodal';
  query: string;
  context?: Message[];
  options?: AgentOptions;
}

export interface AgentOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  useSearch?: boolean;
  useVision?: boolean;
  useVoice?: boolean;
  streaming?: boolean;
}

export class EnhancedAIOrchestrator {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;
  private voiceService: VoiceService;
  private searchService: SearchService;

  // Model selection logic
  private models = {
    // ChatGPT models - Best for conversation, code, general tasks
    gpt4: {
      name: 'gpt-4-turbo-preview',
      provider: 'openai',
      strengths: ['reasoning', 'code', 'conversation'],
      cost: 'high',
      contextWindow: 128000,
    },
    gpt4Vision: {
      name: 'gpt-4-vision-preview',
      provider: 'openai',
      strengths: ['vision', 'multimodal'],
      cost: 'high',
      contextWindow: 128000,
    },
    gpt35: {
      name: 'gpt-3.5-turbo',
      provider: 'openai',
      strengths: ['speed', 'efficiency'],
      cost: 'low',
      contextWindow: 16000,
    },

    // Claude models - Best for reasoning, analysis, long context
    claude3Opus: {
      name: 'claude-3-opus-20240229',
      provider: 'anthropic',
      strengths: ['reasoning', 'analysis', 'complex-tasks'],
      cost: 'high',
      contextWindow: 200000,
    },
    claude3Sonnet: {
      name: 'claude-3-sonnet-20240229',
      provider: 'anthropic',
      strengths: ['balanced', 'speed', 'quality'],
      cost: 'medium',
      contextWindow: 200000,
    },
    claude3Haiku: {
      name: 'claude-3-haiku-20240307',
      provider: 'anthropic',
      strengths: ['speed', 'efficiency', 'simple-tasks'],
      cost: 'low',
      contextWindow: 200000,
    },

    // Gemini models - Best for multimodal, vision, realtime
    geminiPro: {
      name: 'gemini-pro',
      provider: 'google',
      strengths: ['multimodal', 'vision', 'realtime'],
      cost: 'medium',
      contextWindow: 32000,
    },
    geminiProVision: {
      name: 'gemini-pro-vision',
      provider: 'google',
      strengths: ['vision', 'multimodal', 'image-analysis'],
      cost: 'medium',
      contextWindow: 16000,
    },
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.gemini = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_API_KEY || ''
    );

    this.voiceService = new VoiceService();
    this.searchService = new SearchService();
  }

  /**
   * Intelligent model selection based on task requirements
   */
  private selectBestModel(task: AgentTask): string {
    const { type, query, options } = task;

    // Multimodal tasks -> Gemini or GPT-4 Vision
    if (type === 'multimodal' || options?.useVision) {
      return options?.model || 'geminiProVision';
    }

    // Deep research/analysis -> Claude Opus
    if (type === 'research' || type === 'analysis') {
      return options?.model || 'claude3Opus';
    }

    // Code generation/review -> GPT-4
    if (type === 'code' || query.toLowerCase().includes('code')) {
      return options?.model || 'gpt4';
    }

    // Creative tasks -> GPT-4 or Claude Sonnet
    if (type === 'creative') {
      return options?.model || 'gpt4';
    }

    // Default to GPT-4 for best results
    return options?.model || 'gpt4';
  }

  /**
   * GenSpark-style Super Agent
   * Performs deep research, multi-source synthesis, and comprehensive analysis
   */
  async superAgent(task: AgentTask): Promise<AsyncGenerator<string>> {
    const model = this.selectBestModel(task);
    const { query, context = [], options = {} } = task;

    return this.processWithModel(model, query, context, {
      ...options,
      useSearch: options.useSearch !== false, // Default to true for super agent
      streaming: options.streaming !== false, // Default to streaming
    });
  }

  /**
   * Process with selected model
   */
  private async *processWithModel(
    modelKey: string,
    query: string,
    context: Message[],
    options: AgentOptions
  ): AsyncGenerator<string> {
    const modelConfig = this.models[modelKey as keyof typeof this.models];

    if (!modelConfig) {
      throw new Error(`Unknown model: ${modelKey}`);
    }

    // Add research context if enabled
    let enhancedQuery = query;
    let sources: Source[] = [];

    if (options.useSearch) {
      const searchResults = await this.searchService.deepResearch(query);
      sources = searchResults.sources;
      enhancedQuery = this.enrichQueryWithResearch(query, searchResults);
    }

    // Route to appropriate provider
    if (modelConfig.provider === 'openai') {
      yield* this.streamOpenAI(modelConfig.name, enhancedQuery, context, options);
    } else if (modelConfig.provider === 'anthropic') {
      yield* this.streamAnthropic(modelConfig.name, enhancedQuery, context, options);
    } else if (modelConfig.provider === 'google') {
      yield* this.streamGemini(modelConfig.name, enhancedQuery, context, options);
    }

    // Add sources at the end if research was used
    if (sources.length > 0) {
      yield '\n\n---\n**Sources:**\n';
      for (const source of sources) {
        yield `\n- [${source.title}](${source.url})\n  ${source.snippet}\n`;
      }
    }
  }

  /**
   * Stream from OpenAI (ChatGPT)
   */
  private async *streamOpenAI(
    model: string,
    query: string,
    context: Message[],
    options: AgentOptions
  ): AsyncGenerator<string> {
    const messages = [
      ...context.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content: query },
    ];

    const stream = await this.openai.chat.completions.create({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Stream from Anthropic (Claude)
   */
  private async *streamAnthropic(
    model: string,
    query: string,
    context: Message[],
    options: AgentOptions
  ): AsyncGenerator<string> {
    const messages = [
      ...context.filter(msg => msg.role !== 'system').map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: query },
    ];

    const systemMessage = context.find(msg => msg.role === 'system')?.content || '';

    const stream = await this.anthropic.messages.stream({
      model,
      messages,
      system: systemMessage,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  /**
   * Stream from Google (Gemini)
   */
  private async *streamGemini(
    model: string,
    query: string,
    context: Message[],
    options: AgentOptions
  ): AsyncGenerator<string> {
    const geminiModel = this.gemini.getGenerativeModel({ model });

    const chat = geminiModel.startChat({
      history: context.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 4000,
      },
    });

    const result = await chat.sendMessageStream(query);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  /**
   * Enrich query with research findings
   */
  private enrichQueryWithResearch(query: string, research: any): string {
    const context = research.synthesis || research.summary || '';
    return `${query}\n\nAdditional Context from Research:\n${context}`;
  }

  /**
   * Multimodal processing (images, video, audio)
   */
  async processMultimodal(
    query: string,
    attachments: Attachment[],
    context: Message[] = []
  ): Promise<AsyncGenerator<string>> {
    const hasImages = attachments.some(a => a.type === 'image');
    const hasVideo = attachments.some(a => a.type === 'video');
    const hasAudio = attachments.some(a => a.type === 'audio');

    // Process audio first (transcribe)
    if (hasAudio) {
      for (const attachment of attachments.filter(a => a.type === 'audio')) {
        const audioBuffer = await this.fetchAttachment(attachment.url);
        const transcription = await this.voiceService.transcribe(audioBuffer);
        query += `\n\nAudio transcription: ${transcription}`;
      }
    }

    // Use vision-capable model for images/video
    if (hasImages || hasVideo) {
      return this.processWithModel('geminiProVision', query, context, {
        useVision: true,
        streaming: true,
      });
    }

    // Regular text processing
    return this.superAgent({ type: 'analysis', query, context });
  }

  /**
   * Fetch attachment content
   */
  private async fetchAttachment(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  /**
   * Get model info
   */
  getModelInfo(modelKey: string) {
    return this.models[modelKey as keyof typeof this.models];
  }

  /**
   * List available models
   */
  listModels() {
    return Object.entries(this.models).map(([key, config]) => ({
      key,
      ...config,
    }));
  }

  /**
   * Analyze conversation and suggest best model
   */
  suggestModel(messages: Message[]): string {
    const lastMessage = messages[messages.length - 1];
    const hasImages = lastMessage.metadata?.attachments?.some(a => a.type === 'image');
    const hasCode = lastMessage.content.includes('```') || 
                   lastMessage.content.toLowerCase().includes('code');
    const isComplex = lastMessage.content.length > 500;
    const needsResearch = lastMessage.content.toLowerCase().includes('research') ||
                         lastMessage.content.includes('?');

    if (hasImages) return 'geminiProVision';
    if (hasCode) return 'gpt4';
    if (needsResearch && isComplex) return 'claude3Opus';
    if (isComplex) return 'claude3Sonnet';
    
    return 'gpt4';
  }
}
