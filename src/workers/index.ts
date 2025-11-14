/**
 * Cloudflare Worker for FlowState AI Backend
 * 
 * Handles API requests, AI orchestration, and real-time features
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { FreeModelOrchestratorWorker } from './services/freeModelOrchestratorWorker';
import { SuperAgentWorker } from './services/superAgentWorker';

// Cloudflare Worker environment
export interface Env {
  UPLOADS: R2Bucket;
  DB: D1Database;
  CACHE: KVNamespace;
  ANALYTICS: AnalyticsEngineDataset;
  CHAT_SESSIONS: DurableObjectNamespace;
  
  // AI API Keys (set in Cloudflare dashboard)
  GROQ_API_KEY?: string;
  TOGETHER_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  HUGGINGFACE_API_KEY?: string;
  
  // Search API Keys
  BRAVE_SEARCH_API_KEY?: string;
  SERPER_API_KEY?: string;
  TAVILY_API_KEY?: string;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// CORS configuration
app.use('/*', cors({
  origin: ['https://flowstate.pages.dev', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    worker: 'flowstate-ai-backend',
    version: '3.0.0',
    features: ['free-models', 'super-agent', 'voice', 'research'],
    keysConfigured: {
      groq: !!c.env.GROQ_API_KEY,
      together: !!c.env.TOGETHER_API_KEY,
      gemini: !!c.env.GOOGLE_AI_API_KEY,
      huggingface: !!c.env.HUGGINGFACE_API_KEY,
    },
  });
});

// List available models
app.get('/api/models', async (c) => {
  try {
    const orchestrator = new FreeModelOrchestratorWorker(c.env);
    const models = await orchestrator.listAvailableModels();
    
    return c.json({
      success: true,
      models: models.map(m => ({
        name: m.name,
        provider: m.provider,
        speed: m.speed,
        capabilities: m.capabilities,
      })),
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list models',
    }, 500);
  }
});

// Chat endpoint (streaming)
app.post('/api/chat', async (c) => {
  try {
    const { message, conversationId, model, useSearch } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Initialize orchestrator
    const orchestrator = new FreeModelOrchestratorWorker(c.env);
    
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = orchestrator.streamResponse([
            { role: 'user', content: message },
          ]);

          for await (const chunk of messageStream) {
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }

          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Chat failed',
    }, 500);
  }
});

// Super Agent endpoint
app.post('/api/agent', async (c) => {
  try {
    const { query, maxSteps = 10 } = await c.req.json();

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const agent = new SuperAgentWorker();
    const result = await agent.executeAgent(query, maxSteps);

    return c.json({
      success: true,
      result,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Agent execution failed',
    }, 500);
  }
});

// Research endpoint
app.post('/api/research', async (c) => {
  try {
    const { query } = await c.req.json();

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    // Check cache first
    const cacheKey = `research:${query}`;
    const cached = await c.env.CACHE.get(cacheKey);
    
    if (cached) {
      return c.json({
        success: true,
        cached: true,
        result: JSON.parse(cached),
      });
    }

    // Perform research
    const agent = new SuperAgentWorker();
    const tool = agent.getTools().find(t => t.name === 'deep_research');
    
    if (!tool) {
      return c.json({ error: 'Research tool not available' }, 500);
    }

    const result = await tool.execute({ query });

    // Cache for 1 hour
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });

    return c.json({
      success: true,
      cached: false,
      result,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Research failed',
    }, 500);
  }
});

// File upload endpoint
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Upload to R2
    const filename = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();
    
    await c.env.UPLOADS.put(filename, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    return c.json({
      success: true,
      filename,
      url: `/api/files/${filename}`,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }, 500);
  }
});

// File retrieval endpoint
app.get('/api/files/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    const object = await c.env.UPLOADS.get(filename);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'File retrieval failed',
    }, 500);
  }
});

// Analytics endpoint
app.post('/api/analytics', async (c) => {
  try {
    const { event, data } = await c.req.json();

    c.env.ANALYTICS.writeDataPoint({
      blobs: [event],
      doubles: [Date.now()],
      indexes: [event],
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Analytics failed',
    }, 500);
  }
});

// WebSocket handler for real-time chat (using Durable Objects)
app.get('/api/ws/:conversationId', async (c) => {
  const conversationId = c.req.param('conversationId');
  
  // Get Durable Object stub
  const id = c.env.CHAT_SESSIONS.idFromName(conversationId);
  const stub = c.env.CHAT_SESSIONS.get(id);
  
  return stub.fetch(c.req.raw);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message,
  }, 500);
});

export default app;

// Durable Object for chat sessions
export class ChatSession implements DurableObject {
  private state: DurableObjectState;
  private sessions: Map<WebSocket, string>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.sessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    // Upgrade to WebSocket
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Accept WebSocket
    server.accept();
    
    // Store session
    const sessionId = crypto.randomUUID();
    this.sessions.set(server, sessionId);

    // Handle messages
    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data as string);
        
        // Handle different message types
        if (data.type === 'chat') {
          // Process with AI
          const response = await this.processChat(data.message);
          server.send(JSON.stringify({
            type: 'response',
            content: response,
          }));
        }
      } catch (error) {
        server.send(JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    });

    // Handle close
    server.addEventListener('close', () => {
      this.sessions.delete(server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async processChat(message: string): Promise<string> {
    // Implement chat processing logic
    return `Received: ${message}`;
  }
}
