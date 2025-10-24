/**
 * Cloudflare Workers-Compatible Super Agent Suite
 * 
 * Complete AI Agent System optimized for edge computing:
 * - Multi-step reasoning
 * - Web scraping & content extraction  
 * - Safe calculation evaluation
 * - Deep research capabilities
 * - Tool orchestration
 * - Memory & context management
 */

import { FreeModelOrchestrator, Message } from '../../services/freeModelOrchestrator';

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

export class SuperAgentWorker {
  private modelOrchestrator: FreeModelOrchestrator;
  private tools: Map<string, AgentTool>;
  private conversationHistory: Message[] = [];

  constructor() {
    this.modelOrchestrator = new FreeModelOrchestrator();
    this.tools = new Map();
    
    this.registerDefaultTools();
  }

  /**
   * Register all default tools (Cloudflare Workers compatible)
   */
  private registerDefaultTools() {
    // Web Search Tool - DISABLED (requires external API)
    this.registerTool({
      name: 'web_search',
      description: 'Search the internet for current information. Use this when you need real-time data, news, or factual information.',
      parameters: {
        query: 'string - the search query',
      },
      execute: async ({ query }) => {
        return {
          info: 'Web search requires API key configuration',
          query,
          results: [],
        };
      },
    });

    // Deep Research Tool - DISABLED (requires external API)
    this.registerTool({
      name: 'deep_research',
      description: 'Perform comprehensive research on a topic with AI synthesis. Use for complex questions requiring multiple sources.',
      parameters: {
        query: 'string - the research question',
      },
      execute: async ({ query }) => {
        return {
          info: 'Deep research requires API key configuration',
          query,
        };
      },
    });

    // Web Scrape Tool
    this.registerTool({
      name: 'scrape_url',
      description: 'Extract content from a specific URL. Use when you need detailed information from a webpage.',
      parameters: {
        url: 'string - the URL to scrape',
      },
      execute: async ({ url }) => {
        return await this.scrapeWebpage(url);
      },
    });

    // Calculator Tool (safe evaluation)
    this.registerTool({
      name: 'calculate',
      description: 'Perform mathematical calculations. Use for any math operations.',
      parameters: {
        expression: 'string - mathematical expression',
      },
      execute: async ({ expression }) => {
        return await this.safeCalculate(expression);
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

    // Knowledge Base Tool
    this.registerTool({
      name: 'query_knowledge',
      description: 'Query internal knowledge base or documentation',
      parameters: {
        query: 'string - the knowledge query',
      },
      execute: async ({ query }) => {
        return { answer: 'Knowledge base query not yet implemented', query };
      },
    });
  }

  /**
   * Register a custom tool
   */
  registerTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Main agent execution with ReAct-style reasoning
   */
  async executeAgent(query: string, maxSteps: number = 10): Promise<AgentResult> {
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

      // Get agent's response
      let agentResponse = '';
      const stream = this.modelOrchestrator.streamResponse(context);
      
      for await (const chunk of stream) {
        agentResponse += chunk;
      }

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
          output = await tool.execute(input);
          
          // Collect sources
          if (output.results) sources.push(...output.results);
          if (output.sources) sources.push(...output.sources);
        } catch (error) {
          output = { error: error instanceof Error ? error.message : 'Tool execution failed' };
        }
      } else {
        output = { error: `Tool "${action}" not found` };
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
   * Web scraping implementation (edge-compatible)
   */
  private async scrapeWebpage(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FlowStateBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Basic HTML parsing without cheerio (edge-compatible)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract text content (remove HTML tags)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // Limit to 5000 chars

      return {
        url,
        title,
        content: textContent,
        length: textContent.length,
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
   * Safe calculator (without vm2/eval)
   */
  private async safeCalculate(expression: string): Promise<any> {
    try {
      // Remove whitespace
      const expr = expression.replace(/\s+/g, '');
      
      // Only allow numbers and basic operators
      if (!/^[\d+\-*/.()]+$/.test(expr)) {
        return {
          error: 'Invalid expression. Only numbers and +, -, *, /, (, ) are allowed.',
          expression,
        };
      }

      // Use Function constructor (safer than eval, still restricted)
      const result = new Function(`return ${expr}`)();
      
      return {
        result,
        expression,
        success: true,
      };
    } catch (error) {
      return {
        error: 'Calculation failed',
        expression,
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
      let summary = '';
      const stream = this.modelOrchestrator.streamResponse([
        { role: 'user', content: prompt },
      ]);
      
      for await (const chunk of stream) {
        summary += chunk;
      }
      
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
    if (steps.length > 0) {
      confidence += (successfulSteps / steps.length) * 0.3;
    }

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
