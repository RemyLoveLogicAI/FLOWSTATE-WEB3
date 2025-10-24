import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { EventEmitter } from 'events';

/**
 * APIServer - REST API interface for FlowState AI Supreme
 */
export class APIServer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      port: config.port || process.env.PORT || 3000,
      host: config.host || process.env.HOST || '0.0.0.0',
      ...config
    };
    
    this.app = express();
    this.server = null;
    this.core = null;
    
    this.stats = {
      requests: 0,
      errors: 0,
      startTime: null
    };
  }

  /**
   * Initialize API server
   */
  async initialize(core) {
    console.log(`🌐 Initializing API Server on ${this.config.host}:${this.config.port}...`);
    
    this.core = core;
    
    // Middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      this.stats.requests++;
      console.log(`📨 ${req.method} ${req.path}`);
      next();
    });

    // Register routes
    this.registerRoutes();
    
    // Error handling
    this.app.use(this.errorHandler.bind(this));

    // Start server
    await this.start();
    
    console.log('✅ API Server initialized');
    this.emit('initialized');
  }

  /**
   * Register API routes
   */
  registerRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: Date.now() - this.stats.startTime,
        timestamp: Date.now()
      });
    });

    // Status endpoint
    this.app.get('/api/status', async (req, res) => {
      try {
        const status = this.core.getStatus();
        res.json({
          success: true,
          data: status
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // AI Query endpoint
    this.app.post('/api/ai/query', async (req, res) => {
      try {
        const { query, options } = req.body;
        
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Query is required'
          });
        }

        const result = await this.core.executeDistributedQuery(query, options);
        
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Cognitive Enhancement endpoint
    this.app.post('/api/cognitive/enhance', async (req, res) => {
      try {
        const { input, options } = req.body;
        
        if (!input) {
          return res.status(400).json({
            success: false,
            error: 'Input is required'
          });
        }

        const cognitive = this.core.modules.cognitive;
        if (!cognitive) {
          return res.status(503).json({
            success: false,
            error: 'Cognitive module not available'
          });
        }

        const result = await cognitive.enhance(input, options);
        
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Network peers endpoint
    this.app.get('/api/network/peers', async (req, res) => {
      try {
        const p2p = this.core.modules.p2p;
        if (!p2p) {
          return res.status(503).json({
            success: false,
            error: 'P2P module not available'
          });
        }

        const peers = p2p.getPeers();
        
        res.json({
          success: true,
          data: {
            count: peers.length,
            peers
          }
        });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // State sync endpoint
    this.app.post('/api/state/sync', async (req, res) => {
      try {
        const state = this.core.modules.state;
        if (!state) {
          return res.status(503).json({
            success: false,
            error: 'State module not available'
          });
        }

        const snapshot = state.getSnapshot();
        
        res.json({
          success: true,
          data: snapshot
        });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Blockchain operations endpoint
    this.app.post('/api/blockchain/record', async (req, res) => {
      try {
        const { operation } = req.body;
        
        if (!operation) {
          return res.status(400).json({
            success: false,
            error: 'Operation is required'
          });
        }

        const blockchain = this.core.modules.blockchain;
        if (!blockchain) {
          return res.status(503).json({
            success: false,
            error: 'Blockchain module not available'
          });
        }

        const result = await blockchain.recordOperation(operation);
        
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // AI Models endpoint
    this.app.get('/api/ai/models', async (req, res) => {
      try {
        const ai = this.core.modules.ai;
        if (!ai) {
          return res.status(503).json({
            success: false,
            error: 'AI module not available'
          });
        }

        const stats = ai.getStats();
        
        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Statistics endpoint
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = {
          api: this.stats,
          core: this.core.getStatus(),
          ai: this.core.modules.ai?.getStats(),
          network: this.core.modules.p2p?.getStats(),
          state: this.core.modules.state?.getStats(),
          cognitive: this.core.modules.cognitive?.getStats()
        };

        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    console.log('📝 API routes registered');
  }

  /**
   * Error handler middleware
   */
  errorHandler(err, req, res, next) {
    console.error('❌ API Error:', err);
    this.stats.errors++;
    
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }

  /**
   * Start the server
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, this.config.host, () => {
          this.stats.startTime = Date.now();
          console.log(`✅ API Server listening on http://${this.config.host}:${this.config.port}`);
          this.emit('started');
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('❌ Server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🛑 API Server stopped');
          this.emit('stopped');
          resolve();
        });
      });
    }
  }
}

export default APIServer;
