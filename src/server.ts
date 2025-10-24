import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { AIOrchestrator } from './services/aiOrchestrator.js';
import { VoiceService } from './services/voiceService.js';
import { SearchService } from './services/searchService.js';
import { Web3Service } from './services/web3Service.js';
import { chatRouter } from './api/chat.js';
import { voiceRouter } from './api/voice.js';
import { searchRouter } from './api/search.js';
import { web3Router } from './api/web3.js';
import { uploadRouter } from './api/upload.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Services initialization
const aiOrchestrator = new AIOrchestrator();
const voiceService = new VoiceService();
const searchService = new SearchService();
const web3Service = new Web3Service();

// Attach services to app
app.locals.services = {
  ai: aiOrchestrator,
  voice: voiceService,
  search: searchService,
  web3: web3Service
};

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/search', searchRouter);
app.use('/api/web3', web3Router);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ai: 'operational',
      voice: 'operational',
      search: 'operational',
      web3: 'operational'
    }
  });
});

// WebSocket for real-time streaming
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle chat messages with streaming
  socket.on('chat:message', async (data) => {
    try {
      const { message, conversationId, options } = data;
      
      // Stream response token by token
      await aiOrchestrator.streamResponse(message, {
        onToken: (token: string) => {
          socket.emit('chat:token', { token, conversationId });
        },
        onComplete: (response: any) => {
          socket.emit('chat:complete', { response, conversationId });
        },
        onError: (error: Error) => {
          socket.emit('chat:error', { error: error.message, conversationId });
        },
        ...options
      });
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('chat:error', { error: (error as Error).message });
    }
  });

  // Handle voice input
  socket.on('voice:input', async (data) => {
    try {
      const { audio, language } = data;
      const transcription = await voiceService.transcribe(audio, language);
      socket.emit('voice:transcription', { transcription });
    } catch (error) {
      socket.emit('voice:error', { error: (error as Error).message });
    }
  });

  // Handle voice output request
  socket.on('voice:synthesize', async (data) => {
    try {
      const { text, voice, options } = data;
      const audioStream = await voiceService.synthesize(text, voice, options);
      socket.emit('voice:audio', { audio: audioStream });
    } catch (error) {
      socket.emit('voice:error', { error: (error as Error).message });
    }
  });

  // Handle search requests
  socket.on('search:query', async (data) => {
    try {
      const { query, options } = data;
      const results = await searchService.search(query, options);
      socket.emit('search:results', { results });
    } catch (error) {
      socket.emit('search:error', { error: (error as Error).message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🌊 FlowState AI Web3 - Server Started            ║
║                                                              ║
║   🚀 Port: ${PORT}                                              ║
║   🌐 Environment: ${process.env.NODE_ENV || 'development'}                          ║
║   🤖 AI Models: Ready                                       ║
║   🎤 Voice: Ready                                           ║
║   🔍 Search: Ready                                          ║
║   ⛓️  Web3: Ready                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export { app, io };
