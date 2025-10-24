/**
 * FlowState AI - Enhanced Server
 * 
 * Features:
 * - Multi-AI orchestration (ChatGPT, Claude, Gemini)
 * - WebSocket streaming
 * - Voice capabilities
 * - GenSpark-style research
 * - Multimodal processing
 * - Web3 integration
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { EnhancedAIOrchestrator } from './services/enhancedAIOrchestrator.js';
import { EnhancedSearchService } from './services/enhancedSearchService.js';
import { VoiceService } from './services/voiceService.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Initialize services
const aiOrchestrator = new EnhancedAIOrchestrator();
const searchService = new EnhancedSearchService();
const voiceService = new VoiceService();

// Store active conversations
const conversations = new Map<string, any>();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    features: [
      'multi-ai',
      'voice',
      'research',
      'multimodal',
      'web3',
      'streaming',
    ],
  });
});

// List available AI models
app.get('/api/models', (req, res) => {
  const models = aiOrchestrator.listModels();
  res.json({ models });
});

// Voice transcription endpoint
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language } = req.body;
    const transcription = await voiceService.transcribe(
      req.file.buffer,
      language
    );

    res.json({
      success: true,
      transcription,
      language: language || 'auto-detected',
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: 'Transcription failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Voice synthesis endpoint
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, voice = 'alloy', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await voiceService.synthesize(text, voice, { speed });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
    res.send(audioBuffer);
  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({
      error: 'Synthesis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List voices
app.get('/api/voice/voices', (req, res) => {
  const voices = voiceService.listVoices();
  res.json({ voices });
});

// Research endpoint
app.post('/api/research', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await searchService.deepResearch(query);

    res.json(results);
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({
      error: 'Research failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Quick search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await searchService.quickSearch(q);

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Multimodal upload endpoint
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(process.cwd(), 'uploads', filename);

        await fs.mkdir(path.dirname(filepath), { recursive: true });
        await fs.writeFile(filepath, file.buffer);

        return {
          id: filename,
          name: file.originalname,
          type: file.mimetype.split('/')[0],
          url: `/uploads/${filename}`,
          size: file.size,
        };
      })
    );

    res.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// WebSocket connection for real-time chat
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create or join conversation
  socket.on('join', ({ conversationId }) => {
    if (!conversationId) {
      conversationId = `conv-${Date.now()}-${socket.id}`;
    }

    socket.join(conversationId);

    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        created: Date.now(),
      });
    }

    socket.emit('joined', {
      conversationId,
      conversation: conversations.get(conversationId),
    });

    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle chat message
  socket.on('message', async (data) => {
    try {
      const {
        conversationId,
        message,
        model,
        useSearch,
        useVoice,
        attachments = [],
      } = data;

      console.log(`Message from ${socket.id} in ${conversationId}`);

      const conversation = conversations.get(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Add user message to conversation
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
        attachments,
      };
      conversation.messages.push(userMessage);

      // Emit user message confirmation
      io.to(conversationId).emit('message', userMessage);

      // Determine task type and process
      let taskType = 'analysis';
      if (useSearch) taskType = 'research';
      if (attachments.length > 0) taskType = 'multimodal';

      // Start AI response
      const startTime = Date.now();
      let fullResponse = '';
      let modelUsed = model;

      socket.emit('assistant-start', { timestamp: Date.now() });

      try {
        // Handle multimodal if attachments present
        if (attachments.length > 0) {
          const stream = await aiOrchestrator.processMultimodal(
            message,
            attachments,
            conversation.messages.slice(0, -1)
          );

          for await (const chunk of stream) {
            fullResponse += chunk;
            socket.emit('assistant-token', { content: chunk });
          }
        } else {
          // Regular AI processing
          const stream = await aiOrchestrator.superAgent({
            type: taskType as any,
            query: message,
            context: conversation.messages.slice(0, -1),
            options: {
              model: modelUsed,
              useSearch,
              streaming: true,
            },
          });

          for await (const chunk of stream) {
            fullResponse += chunk;
            socket.emit('assistant-token', { content: chunk });
          }
        }

        // Add assistant message to conversation
        const assistantMessage = {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
          metadata: {
            model: modelUsed,
            duration: Date.now() - startTime,
            tokens: Math.ceil(fullResponse.length / 4),
          },
        };
        conversation.messages.push(assistantMessage);

        socket.emit('assistant-end', {
          message: assistantMessage,
          timestamp: Date.now(),
        });

        // Generate voice if requested
        if (useVoice && fullResponse) {
          try {
            const audioBuffer = await voiceService.synthesize(fullResponse);
            const audioFilename = `voice-${Date.now()}.mp3`;
            const audioPath = path.join(process.cwd(), 'uploads', audioFilename);

            await fs.mkdir(path.dirname(audioPath), { recursive: true });
            await fs.writeFile(audioPath, audioBuffer);

            socket.emit('voice-ready', {
              url: `/uploads/${audioFilename}`,
            });
          } catch (voiceError) {
            console.error('Voice generation error:', voiceError);
          }
        }
      } catch (aiError) {
        console.error('AI processing error:', aiError);
        socket.emit('error', {
          message: 'AI processing failed',
          details: aiError instanceof Error ? aiError.message : 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Message handling error:', error);
      socket.emit('error', {
        message: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Handle voice message
  socket.on('voice-message', async (data) => {
    try {
      const { conversationId, audioData } = data;

      // Transcribe audio
      const audioBuffer = Buffer.from(audioData, 'base64');
      const transcription = await voiceService.transcribe(audioBuffer);

      // Send transcription back
      socket.emit('voice-transcribed', { transcription });

      // Process as regular message
      socket.emit('message', {
        conversationId,
        message: transcription,
        model: data.model,
        useSearch: data.useSearch,
        useVoice: true,
      });
    } catch (error) {
      console.error('Voice message error:', error);
      socket.emit('error', {
        message: 'Voice message failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get conversation history
  socket.on('get-history', ({ conversationId }) => {
    const conversation = conversations.get(conversationId);
    if (conversation) {
      socket.emit('history', conversation);
    } else {
      socket.emit('error', { message: 'Conversation not found' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         🌊 FlowState AI - Enhanced Server              ║
║                                                        ║
║  ChatGPT Beauty + Claude Power + Gemini Multimodal    ║
║  + GenSpark Research + Voice + Web3                   ║
║                                                        ║
║  Server running on port ${PORT}                         ║
║  WebSocket enabled for real-time streaming            ║
║                                                        ║
║  Features:                                            ║
║    ✓ Multi-AI orchestration                          ║
║    ✓ Voice transcription & synthesis                 ║
║    ✓ Deep research capabilities                      ║
║    ✓ Multimodal processing                           ║
║    ✓ Real-time streaming                             ║
║    ✓ Web3 ready                                      ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
