#!/usr/bin/env node

import { config } from 'dotenv';
import { DecentralizedCore } from './core/DecentralizedCore.js';
import { BlockchainConnector } from './core/BlockchainConnector.js';
import { AIOrchestrator } from './ai/AIOrchestrator.js';
import { P2PNetwork } from './network/P2PNetwork.js';
import { DistributedState } from './state/DistributedState.js';
import { CognitiveEnhancer } from './cognitive/CognitiveEnhancer.js';
import { APIServer } from './api/APIServer.js';

// Load environment variables
config();

/**
 * FlowState AI Supreme - Main Application
 * Decentralized Genius Level AI Platform
 */
class FlowStateAISupreme {
  constructor() {
    this.core = null;
    this.apiServer = null;
    this.shutdownHandlers = [];
  }

  /**
   * Initialize and start the platform
   */
  async start() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║      🧠 FlowState AI Supreme - Starting...           ║');
    console.log('║      Decentralized Genius Level AI Platform           ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

    try {
      // Initialize Decentralized Core
      console.log('Step 1/7: Initializing Decentralized Core...');
      this.core = new DecentralizedCore({
        nodeId: process.env.NODE_ID,
        nodeType: process.env.NODE_TYPE || 'full'
      });
      await this.core.initialize();
      console.log('');

      // Initialize Blockchain Connector
      console.log('Step 2/7: Initializing Blockchain Connector...');
      const blockchain = new BlockchainConnector({
        rpcUrl: process.env.ETHEREUM_RPC_URL,
        contractAddress: process.env.CONTRACT_ADDRESS
      });
      await blockchain.initialize();
      this.core.registerModule('blockchain', blockchain);
      console.log('');

      // Initialize AI Orchestrator
      console.log('Step 3/7: Initializing AI Orchestrator...');
      const ai = new AIOrchestrator({
        maxConcurrentModels: parseInt(process.env.MAX_CONCURRENT_MODELS || '10')
      });
      await ai.initialize();
      this.core.registerModule('ai', ai);
      console.log('');

      // Initialize P2P Network
      console.log('Step 4/7: Initializing P2P Network...');
      const p2p = new P2PNetwork({
        nodeId: this.core.nodeId,
        port: parseInt(process.env.P2P_PORT || '9000'),
        bootstrapPeers: this.parseBootstrapPeers()
      });
      await p2p.initialize();
      this.core.registerModule('p2p', p2p);
      console.log('');

      // Initialize Distributed State
      console.log('Step 5/7: Initializing Distributed State...');
      const state = new DistributedState({
        nodeId: this.core.nodeId,
        syncInterval: parseInt(process.env.STATE_SYNC_INTERVAL || '5000')
      });
      await state.initialize();
      this.core.registerModule('state', state);
      console.log('');

      // Initialize Cognitive Enhancer
      console.log('Step 6/7: Initializing Cognitive Enhancer...');
      const cognitive = new CognitiveEnhancer({
        level: process.env.COGNITIVE_ENHANCEMENT_LEVEL || 'supreme'
      });
      await cognitive.initialize();
      this.core.registerModule('cognitive', cognitive);
      console.log('');

      // Initialize API Server
      console.log('Step 7/7: Initializing API Server...');
      this.apiServer = new APIServer({
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || '0.0.0.0'
      });
      await this.apiServer.initialize(this.core);
      console.log('');

      // Wire up module communications
      this.wireModuleCommunications();

      // Setup graceful shutdown
      this.setupShutdownHandlers();

      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║                                                        ║');
      console.log('║      ✅ FlowState AI Supreme - READY                  ║');
      console.log('║                                                        ║');
      console.log('║      🌐 API: http://0.0.0.0:' + (process.env.PORT || '3000') + '                         ║');
      console.log('║      🔗 P2P Port: ' + (process.env.P2P_PORT || '9000') + '                              ║');
      console.log('║      🧠 Cognitive Level: SUPREME                      ║');
      console.log('║                                                        ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('📊 Platform Status:');
      console.log('   ├─ Decentralized Core: ✅ Active');
      console.log('   ├─ Blockchain: ✅ Connected');
      console.log('   ├─ AI Orchestrator: ✅ Ready (5 models)');
      console.log('   ├─ P2P Network: ✅ Listening');
      console.log('   ├─ Distributed State: ✅ Synchronized');
      console.log('   ├─ Cognitive Enhancer: ✅ Supreme Mode');
      console.log('   └─ API Server: ✅ Running');
      console.log('');
      console.log('🚀 Ready to process genius-level AI queries!');
      console.log('');

    } catch (error) {
      console.error('');
      console.error('╔════════════════════════════════════════════════════════╗');
      console.error('║                                                        ║');
      console.error('║      ❌ INITIALIZATION FAILED                         ║');
      console.error('║                                                        ║');
      console.error('╚════════════════════════════════════════════════════════╝');
      console.error('');
      console.error('Error:', error);
      process.exit(1);
    }
  }

  /**
   * Wire up communications between modules
   */
  wireModuleCommunications() {
    const { ai, p2p, state, cognitive, blockchain } = this.core.modules;

    // P2P query handling
    p2p.on('query:received', async ({ query, fromPeer }) => {
      try {
        const result = await ai.process(query);
        await p2p.sendToPeer(fromPeer, {
          type: 'query:response',
          queryId: query.id,
          result
        });
      } catch (error) {
        console.error('Error processing P2P query:', error);
      }
    });

    // State sync handling
    state.on('sync:requested', async () => {
      const snapshot = state.getSnapshot();
      await p2p.broadcast({
        type: 'state:sync',
        snapshot
      });
    });

    // AI query completion - record on blockchain
    ai.on('query:completed', async ({ queryId, result }) => {
      try {
        await blockchain.recordOperation({
          id: queryId,
          type: 'ai_query',
          result: result
        });
      } catch (error) {
        console.error('Error recording operation on blockchain:', error);
      }
    });

    // Cognitive enhancement events
    cognitive.on('enhancement:completed', (result) => {
      state.set(`enhancement:${result.id}`, result, { broadcast: true });
    });

    console.log('🔌 Module communications wired');
  }

  /**
   * Parse bootstrap peers from environment
   */
  parseBootstrapPeers() {
    const peers = process.env.BOOTSTRAP_PEERS;
    if (!peers) return [];
    return peers.split(',').map(p => p.trim()).filter(p => p.length > 0);
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupShutdownHandlers() {
    const shutdown = async (signal) => {
      console.log('');
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      
      try {
        // Stop API server
        if (this.apiServer) {
          await this.apiServer.stop();
        }

        // Shutdown modules
        if (this.core) {
          const { p2p, state, blockchain } = this.core.modules;
          
          if (state) await state.shutdown();
          if (p2p) await p2p.shutdown();
          if (blockchain) await blockchain.disconnect();
          
          await this.core.shutdown();
        }

        console.log('✅ Shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Start the platform
const platform = new FlowStateAISupreme();
platform.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
