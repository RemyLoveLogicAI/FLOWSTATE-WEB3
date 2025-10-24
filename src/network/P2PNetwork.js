import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

/**
 * P2PNetwork - Peer-to-peer networking layer
 * Manages decentralized communication between nodes
 */
export class P2PNetwork extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      port: config.port || process.env.P2P_PORT || 9000,
      bootstrapPeers: config.bootstrapPeers || [],
      maxPeers: config.maxPeers || 50,
      ...config
    };
    
    this.nodeId = config.nodeId || nanoid();
    this.peers = new Map();
    this.connections = new Map();
    this.messageHandlers = new Map();
    this.listening = false;
    
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      connections: 0
    };
  }

  /**
   * Initialize P2P network
   */
  async initialize() {
    console.log(`🌐 Initializing P2P network on port ${this.config.port}...`);
    
    try {
      // In real implementation, would initialize libp2p or hyperswarm
      this.listening = true;
      
      // Register default message handlers
      this.registerDefaultHandlers();
      
      // Connect to bootstrap peers
      await this.connectToBootstrapPeers();
      
      console.log(`✅ P2P network initialized. Node ID: ${this.nodeId}`);
      this.emit('initialized');
      
      return true;
    } catch (error) {
      console.error('❌ P2P initialization failed:', error);
      throw error;
    }
  }

  /**
   * Register default message handlers
   */
  registerDefaultHandlers() {
    this.registerHandler('ping', this.handlePing.bind(this));
    this.registerHandler('query', this.handleQuery.bind(this));
    this.registerHandler('sync', this.handleSync.bind(this));
    this.registerHandler('discovery', this.handleDiscovery.bind(this));
  }

  /**
   * Connect to bootstrap peers
   */
  async connectToBootstrapPeers() {
    if (this.config.bootstrapPeers.length === 0) {
      console.log('⚠️  No bootstrap peers configured');
      return;
    }

    console.log(`🔗 Connecting to ${this.config.bootstrapPeers.length} bootstrap peers...`);
    
    for (const peer of this.config.bootstrapPeers) {
      try {
        await this.connectToPeer(peer);
      } catch (error) {
        console.warn(`Failed to connect to bootstrap peer ${peer}:`, error.message);
      }
    }
  }

  /**
   * Connect to a specific peer
   */
  async connectToPeer(peerAddress) {
    // Parse peer address (would be multiaddr in real implementation)
    const peerId = this.parsePeerAddress(peerAddress);
    
    if (this.peers.has(peerId)) {
      console.log(`Already connected to peer ${peerId}`);
      return;
    }

    // Simulate connection
    const connection = {
      peerId,
      address: peerAddress,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      latency: Math.random() * 100 + 10
    };

    this.connections.set(peerId, connection);
    this.peers.set(peerId, {
      id: peerId,
      address: peerAddress,
      capabilities: ['compute', 'storage'],
      reputation: 100
    });

    this.stats.connections++;
    
    console.log(`🤝 Connected to peer: ${peerId}`);
    this.emit('peer:connected', { peerId, connection });
    
    // Send discovery message
    await this.sendToPeer(peerId, {
      type: 'discovery',
      nodeId: this.nodeId,
      capabilities: ['compute', 'ai', 'storage']
    });
  }

  /**
   * Disconnect from a peer
   */
  disconnectFromPeer(peerId) {
    if (!this.peers.has(peerId)) {
      return;
    }

    this.connections.delete(peerId);
    this.peers.delete(peerId);
    this.stats.connections--;
    
    console.log(`👋 Disconnected from peer: ${peerId}`);
    this.emit('peer:disconnected', { peerId });
  }

  /**
   * Send message to specific peer
   */
  async sendToPeer(peerId, message) {
    if (!this.connections.has(peerId)) {
      throw new Error(`Not connected to peer ${peerId}`);
    }

    const envelope = {
      from: this.nodeId,
      to: peerId,
      timestamp: Date.now(),
      id: nanoid(),
      ...message
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

    this.stats.messagesSent++;
    this.stats.bytesSent += JSON.stringify(envelope).length;
    
    this.emit('message:sent', { peerId, message: envelope });
    
    // In real implementation, would actually send over network
    return envelope.id;
  }

  /**
   * Broadcast message to all peers
   */
  async broadcast(message, options = {}) {
    const { exclude = [] } = options;
    
    console.log(`📢 Broadcasting message: ${message.type}`);
    
    const promises = [];
    for (const peerId of this.peers.keys()) {
      if (!exclude.includes(peerId)) {
        promises.push(this.sendToPeer(peerId, message));
      }
    }

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Broadcast complete: ${successful}/${results.length} successful`);
    
    return { sent: successful, total: results.length };
  }

  /**
   * Register a message handler
   */
  registerHandler(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
    console.log(`📝 Handler registered: ${messageType}`);
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message, fromPeer) {
    this.stats.messagesReceived++;
    this.stats.bytesReceived += JSON.stringify(message).length;
    
    // Update peer activity
    if (this.connections.has(fromPeer)) {
      this.connections.get(fromPeer).lastActivity = Date.now();
    }

    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      try {
        await handler(message, fromPeer);
      } catch (error) {
        console.error(`Error handling message ${message.type}:`, error);
        this.emit('message:error', { message, error });
      }
    } else {
      console.warn(`No handler for message type: ${message.type}`);
    }
  }

  /**
   * Handle ping message
   */
  async handlePing(message, fromPeer) {
    await this.sendToPeer(fromPeer, {
      type: 'pong',
      pingId: message.id,
      timestamp: Date.now()
    });
  }

  /**
   * Handle query message
   */
  async handleQuery(message, fromPeer) {
    console.log(`🔍 Received query from ${fromPeer}`);
    
    this.emit('query:received', {
      query: message.query,
      fromPeer
    });
    
    // Would process query and send response
    await this.sendToPeer(fromPeer, {
      type: 'query:response',
      queryId: message.queryId,
      result: { status: 'processing' }
    });
  }

  /**
   * Handle sync message
   */
  async handleSync(message, fromPeer) {
    console.log(`🔄 Received sync request from ${fromPeer}`);
    
    this.emit('sync:requested', {
      data: message.data,
      fromPeer
    });
  }

  /**
   * Handle discovery message
   */
  async handleDiscovery(message, fromPeer) {
    console.log(`🔍 Peer discovery from ${fromPeer}`);
    
    // Update peer info
    if (this.peers.has(fromPeer)) {
      const peer = this.peers.get(fromPeer);
      peer.capabilities = message.capabilities || [];
      this.peers.set(fromPeer, peer);
    }

    // Send our info back
    await this.sendToPeer(fromPeer, {
      type: 'discovery:response',
      nodeId: this.nodeId,
      capabilities: ['compute', 'ai', 'storage']
    });
  }

  /**
   * Discover new peers
   */
  async discoverPeers() {
    console.log('🔍 Discovering new peers...');
    
    await this.broadcast({
      type: 'discovery:request',
      nodeId: this.nodeId
    });
    
    // In real implementation, would use DHT or mDNS
    return this.peers.size;
  }

  /**
   * Get peer information
   */
  getPeer(peerId) {
    return this.peers.get(peerId);
  }

  /**
   * Get all connected peers
   */
  getPeers() {
    return Array.from(this.peers.values());
  }

  /**
   * Get network statistics
   */
  getStats() {
    return {
      ...this.stats,
      peers: this.peers.size,
      uptime: Date.now() - (this.stats.startTime || Date.now())
    };
  }

  /**
   * Parse peer address
   */
  parsePeerAddress(address) {
    // Simple parsing - in real implementation would handle multiaddr
    if (address.includes('/p2p/')) {
      return address.split('/p2p/')[1];
    }
    return address;
  }

  /**
   * Check peer health
   */
  async checkPeerHealth(peerId) {
    try {
      const startTime = Date.now();
      await this.sendToPeer(peerId, { type: 'ping' });
      const latency = Date.now() - startTime;
      
      return {
        healthy: true,
        latency,
        peerId
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        peerId
      };
    }
  }

  /**
   * Shutdown P2P network
   */
  async shutdown() {
    console.log('🛑 Shutting down P2P network...');
    
    // Notify all peers
    await this.broadcast({
      type: 'shutdown',
      nodeId: this.nodeId
    });

    // Close all connections
    for (const peerId of this.peers.keys()) {
      this.disconnectFromPeer(peerId);
    }

    this.listening = false;
    this.emit('shutdown');
    
    console.log('✅ P2P network shutdown complete');
  }
}

export default P2PNetwork;
