/**
 * GenSpark-Level Super Agent Suite
 * 
 * Complete AI Agent System with:
 * - Multi-step reasoning
 * - Web scraping & content extraction
 * - Code execution sandbox
 * - Deep research capabilities
 * - Tool orchestration
 * - Memory & context management
 * - Multi-modal processing
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { FreeModelOrchestrator, Message } from './freeModelOrchestrator.js';
import { EnhancedSearchService } from './enhancedSearchService.js';
import { VoiceService } from './voiceService.js';
import { VM } from 'vm2';

export interface AgentTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

export interface AgentStep {
  step: number;
  thought: string;
  action: string;
  tool?: string;
  input?: any;
  output?: any;
  timestamp: number;
}

export interface AgentResult {
  query: string;
  answer: string;
  steps: AgentStep[];
  sources: any[];
  confidence: number;
  duration: number;
}

export class SuperAgentSuite {
  private modelOrchestrator: FreeModelOrchestrator;
  private searchService: EnhancedSearchService;
  private voiceService: VoiceService;
  private tools: Map<string, AgentTool>;
  private conversationHistory: Message[] = [];

  constructor() {
    this.modelOrchestrator = new FreeModelOrchestrator();
    this.searchService = new EnhancedSearchService();
    this.voiceService = new VoiceService();
    this.tools = new Map();
    
    this.registerDefaultTools();
  }

  /**
   * Register all default tools
   */
  private registerDefaultTools() {
    // Web Search Tool
    this.registerTool({
      name: 'web_search',
      description: 'Search the internet for current information. Use this when you need real-time data, news, or factual information.',
      parameters: {
        query: 'string - the search query',
      },
      execute: async ({ query }) => {
        const results = await this.searchService.quickSearch(query);
        return {
          results: results.slice(0, 5).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.snippet,
          })),
        };
      },
    });

    // Deep Research Tool
    this.registerTool({
      name: 'deep_research',
      description: 'Perform comprehensive research on a topic with AI synthesis. Use for complex questions requiring multiple sources.',
      parameters: {
        query: 'string - the research question',
      },
      execute: async ({ query }) => {
        return await this.searchService.deepResearch(query);
      },
    });

    // Web Scrape Tool
    this.registerTool({
      name: 'scrape_url',
      description: 'Extract content from a specific URL. Use when you need detailed information from a webpage.',
      parameters: {
        url: 'string - the URL to scrape',
        selector: 'string (optional) - CSS selector for specific content',
      },
      execute: async ({ url, selector }) => {
        return await this.scrapeWebpage(url, selector);
      },
    });

    // Code Execution Tool
    this.registerTool({
      name: 'execute_code',
      description: 'Execute Python or JavaScript code in a sandbox. Use for calculations, data processing, or testing code.',
      parameters: {
        language: 'string - "python" or "javascript"',
        code: 'string - the code to execute',
      },
      execute: async ({ language, code }) => {
        return await this.executeCode(language, code);
      },
    });

    // Calculator Tool
    this.registerTool({
      name: 'calculate',
      description: 'Perform mathematical calculations. Use for any math operations.',
      parameters: {
        expression: 'string - mathematical expression',
      },
      execute: async ({ expression }) => {
        try {
          const vm = new VM({ timeout: 1000 });
          const result = vm.run(`return ${expression}`);
          return { result, expression };
        } catch (error) {
          return { error: 'Calculation failed', expression };
        }
      },
    });

    // Text Analysis Tool
    this.registerTool({
      name: 'analyze_text',
      description: 'Analyze text for sentiment, entities, keywords, etc.',
      parameters: {
        text: 'string - text to analyze',
        type: 'string - "sentiment", "keywords", "summary"',
      },
      execute: async ({ text, type }) => {
        return await this.analyzeText(text, type);
      },
    });

    // Image Analysis Tool (if URL provided)
    this.registerTool({
      name: 'analyze_image',
      description: 'Analyze an image from a URL',
      parameters: {
        url: 'string - image URL',
        query: 'string - what to analyze',
      },
      execute: async ({ url, query }) => {
        // This would integrate with vision models
        return { analysis: 'Image analysis not yet implemented', url, query };
      },
    });

    // Knowledge Base Tool
    this.registerTool({
      name: 'query_knowledge',
      description: 'Query internal knowledge base or documentation',
      parameters: {
        query: 'string - the knowledge query',
      },
      execute: async ({ query }) => {
        // This would query a vector database or knowledge base
        return { answer: 'Knowledge base query not yet implemented', query };
      },
    });
  }

  /**
   * Register a custom tool
   */
  registerTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
    console.log(`✓ Registered tool: ${tool.name}`);
  }

  /**
   * Main agent execution with ReAct-style reasoning
   */
  async executeAgent(query: string, maxSteps: number = 10): Promise<AgentResult> {
    console.log(`\n🤖 Super Agent Starting: "${query}"\n`);
    
    const startTime = Date.now();
    const steps: AgentStep[] = [];
    const sources: any[] = [];
    let finalAnswer = '';
    
    // Create system prompt with tools
    const toolDescriptions = Array.from(this.tools.values())
      .map(tool => `- ${tool.name}: ${tool.description}`)
      .join('\n');

    const systemPrompt = `You are a powerful AI agent with access to various tools. Your goal is to answer the user's query accurately and comprehensively.

Available Tools:
${toolDescriptions}

Use ReAct (Reasoning + Acting) format:
Thought: [Your reasoning about what to do next]
Action: [Tool name to use]
Action Input: [Input for the tool in JSON format]

After getting results, continue reasoning or provide a final answer.

When you have enough information, respond with:
Final Answer: [Your comprehensive answer]`;

    let stepCount = 0;
    let context = [...this.conversationHistory];
    context.push({ role: 'system', content: systemPrompt });
    context.push({ role: 'user', content: query });

    while (stepCount < maxSteps) {
      stepCount++;
      console.log(`\n--- Step ${stepCount} ---`);

      // Get agent's response
      let agentResponse = '';
      const stream = this.modelOrchestrator.streamResponse(context);
      
      for await (const chunk of stream) {
        agentResponse += chunk;
      }

      console.log(agentResponse);

      // Check if agent provided final answer
      if (agentResponse.includes('Final Answer:')) {
        const answerMatch = agentResponse.match(/Final Answer:\s*(.+)/s);
        if (answerMatch) {
          finalAnswer = answerMatch[1].trim();
          steps.push({
            step: stepCount,
            thought: 'Providing final answer',
            action: 'answer',
            output: finalAnswer,
            timestamp: Date.now(),
          });
          break;
        }
      }

      // Parse thought and action
      const thoughtMatch = agentResponse.match(/Thought:\s*(.+?)(?=Action:|$)/s);
      const actionMatch = agentResponse.match(/Action:\s*(\w+)/);
      const inputMatch = agentResponse.match(/Action Input:\s*(\{.+?\})/s);

      if (!actionMatch) {
        // No action found, use response as final answer
        finalAnswer = agentResponse;
        break;
      }

      const thought = thoughtMatch ? thoughtMatch[1].trim() : '';
      const action = actionMatch[1].trim();
      const input = inputMatch ? JSON.parse(inputMatch[1]) : {};

      // Execute tool
      const tool = this.tools.get(action);
      let output: any;

      if (tool) {
        try {
          console.log(`\n🔧 Executing tool: ${action}`);
          output = await tool.execute(input);
          console.log(`✓ Tool output:`, JSON.stringify(output, null, 2));
          
          // Collect sources
          if (output.results) sources.push(...output.results);
          if (output.sources) sources.push(...output.sources);
        } catch (error) {
          output = { error: error instanceof Error ? error.message : 'Tool execution failed' };
          console.error(`✗ Tool error:`, output.error);
        }
      } else {
        output = { error: `Tool "${action}" not found` };
        console.error(output.error);
      }

      // Record step
      steps.push({
        step: stepCount,
        thought,
        action,
        tool: action,
        input,
        output,
        timestamp: Date.now(),
      });

      // Add observation to context
      context.push({ role: 'assistant', content: agentResponse });
      context.push({
        role: 'user',
        content: `Observation: ${JSON.stringify(output)}`,
      });

      // Check for errors and guide agent
      if (output.error) {
        context.push({
          role: 'user',
          content: 'The tool returned an error. Try a different approach or provide a final answer with what you know.',
        });
      }
    }

    // If no final answer yet, get one
    if (!finalAnswer) {
      context.push({
        role: 'user',
        content: 'Based on all the information gathered, provide a comprehensive final answer.',
      });

      const stream = this.modelOrchestrator.streamResponse(context);
      for await (const chunk of stream) {
        finalAnswer += chunk;
      }
    }

    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Agent Complete in ${duration}ms`);
    console.log(`Final Answer:\n${finalAnswer}\n`);

    return {
      query,
      answer: finalAnswer,
      steps,
      sources: this.deduplicateSources(sources),
      confidence: this.calculateConfidence(steps, sources),
      duration,
    };
  }

  /**
   * Simple agent (no tools, direct answer)
   */
  async simpleAgent(query: string): Promise<string> {
    let response = '';
    const stream = this.modelOrchestrator.streamResponse([
      { role: 'user', content: query },
    ]);

    for await (const chunk of stream) {
      response += chunk;
    }

    return response;
  }

  /**
   * Conversational agent (maintains context)
   */
  async chat(message: string): Promise<AsyncGenerator<string>> {
    this.conversationHistory.push({ role: 'user', content: message });
    
    return this.modelOrchestrator.streamResponse(this.conversationHistory);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Web scraping implementation
   */
  private async scrapeWebpage(url: string, selector?: string): Promise<any> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FlowStateBot/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      $('script, style, nav, footer, iframe').remove();

      if (selector) {
        const content = $(selector).text().trim();
        return {
          url,
          content,
          selector,
        };
      }

      // Extract main content
      const title = $('title').text().trim();
      const headings = $('h1, h2, h3')
        .map((_, el) => $(el).text().trim())
        .get();
      const paragraphs = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(p => p.length > 50)
        .slice(0, 10);

      return {
        url,
        title,
        headings,
        paragraphs,
        content: paragraphs.join('\n\n'),
      };
    } catch (error) {
      return {
        error: 'Failed to scrape webpage',
        url,
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Code execution implementation
   */
  private async executeCode(language: string, code: string): Promise<any> {
    if (language === 'javascript') {
      try {
        const vm = new VM({
          timeout: 5000,
          sandbox: {
            console: {
              log: (...args: any[]) => args.join(' '),
            },
          },
        });

        const result = vm.run(code);
        return {
          success: true,
          result,
          language,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Execution failed',
          language,
        };
      }
    } else if (language === 'python') {
      // Python execution would require a separate service
      return {
        error: 'Python execution requires additional setup',
        language,
      };
    }

    return {
      error: `Unsupported language: ${language}`,
      language,
    };
  }

  /**
   * Text analysis implementation
   */
  private async analyzeText(text: string, type: string): Promise<any> {
    if (type === 'sentiment') {
      // Simple sentiment analysis
      const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'best'];
      const negative = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor'];
      
      const lowerText = text.toLowerCase();
      const positiveCount = positive.filter(word => lowerText.includes(word)).length;
      const negativeCount = negative.filter(word => lowerText.includes(word)).length;
      
      let sentiment = 'neutral';
      if (positiveCount > negativeCount) sentiment = 'positive';
      if (negativeCount > positiveCount) sentiment = 'negative';
      
      return { sentiment, positiveCount, negativeCount, type };
    }

    if (type === 'keywords') {
      // Extract keywords (simple word frequency)
      const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const frequency: Record<string, number> = {};
      
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      const keywords = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
      
      return { keywords, type };
    }

    if (type === 'summary') {
      // For summary, use AI model
      const prompt = `Summarize this text in 2-3 sentences:\n\n${text}`;
      const summary = await this.simpleAgent(prompt);
      return { summary, type };
    }

    return { error: 'Unknown analysis type', type };
  }

  /**
   * Deduplicate sources
   */
  private deduplicateSources(sources: any[]): any[] {
    const seen = new Set<string>();
    return sources.filter(source => {
      const key = source.url || source.title || JSON.stringify(source);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(steps: AgentStep[], sources: any[]): number {
    let confidence = 0.5; // Base confidence

    // More steps with successful outputs = higher confidence
    const successfulSteps = steps.filter(s => s.output && !s.output.error).length;
    confidence += (successfulSteps / steps.length) * 0.3;

    // More sources = higher confidence
    if (sources.length > 0) {
      confidence += Math.min(sources.length / 10, 0.2);
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get available tools
   */
  getTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }
}
