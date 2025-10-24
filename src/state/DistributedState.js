import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

/**
 * DistributedState - CRDT-based distributed state management
 * Ensures eventual consistency across the network
 */
export class DistributedState extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.nodeId = config.nodeId || nanoid();
    this.state = new Map();
    this.vectorClock = new Map();
    this.tombstones = new Map();
    this.syncInterval = config.syncInterval || 5000;
    this.syncTimer = null;
    
    this.stats = {
      operations: 0,
      syncs: 0,
      conflicts: 0,
      lastSync: null
    };
  }

  /**
   * Initialize distributed state
   */
  async initialize() {
    console.log('🗄️  Initializing distributed state management...');
    
    this.vectorClock.set(this.nodeId, 0);
    
    // Start periodic sync
    this.startPeriodicSync();
    
    console.log('✅ Distributed state initialized');
    this.emit('initialized');
  }

  /**
   * Set a value in distributed state
   */
  async set(key, value, options = {}) {
    const operation = {
      type: 'set',
      key,
      value,
      nodeId: this.nodeId,
      timestamp: Date.now(),
      vectorClock: this.incrementClock()
    };

    this.applyOperation(operation);
    this.stats.operations++;
    
    this.emit('state:changed', { key, value, operation });
    
    // Broadcast to peers if requested
    if (options.broadcast) {
      this.emit('state:broadcast', operation);
    }

    return operation;
  }

  /**
   * Get a value from distributed state
   */
  get(key) {
    return this.state.get(key);
  }

  /**
   * Delete a value (tombstone for CRDT)
   */
  async delete(key, options = {}) {
    const operation = {
      type: 'delete',
      key,
      nodeId: this.nodeId,
      timestamp: Date.now(),
      vectorClock: this.incrementClock()
    };

    this.applyOperation(operation);
    this.stats.operations++;
    
    this.emit('state:changed', { key, value: null, operation });
    
    if (options.broadcast) {
      this.emit('state:broadcast', operation);
    }

    return operation;
  }

  /**
   * Apply an operation to local state
   */
  applyOperation(operation) {
    switch (operation.type) {
      case 'set':
        this.state.set(operation.key, {
          value: operation.value,
          timestamp: operation.timestamp,
          vectorClock: operation.vectorClock,
          nodeId: operation.nodeId
        });
        break;
        
      case 'delete':
        this.tombstones.set(operation.key, {
          timestamp: operation.timestamp,
          vectorClock: operation.vectorClock,
          nodeId: operation.nodeId
        });
        this.state.delete(operation.key);
        break;
        
      default:
        console.warn(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Merge state from remote peer
   */
  async mergeState(remoteState, remotePeerId) {
    console.log(`🔄 Merging state from peer: ${remotePeerId}`);
    
    let conflicts = 0;
    let merged = 0;

    for (const [key, remoteEntry] of remoteState.entries()) {
      const localEntry = this.state.get(key);
      
      if (!localEntry) {
        // No local entry, accept remote
        this.state.set(key, remoteEntry);
        merged++;
      } else {
        // Conflict resolution using Last-Write-Wins with vector clock
        const resolution = this.resolveConflict(key, localEntry, remoteEntry);
        
        if (resolution === 'remote') {
          this.state.set(key, remoteEntry);
          conflicts++;
          merged++;
        } else if (resolution === 'conflict') {
          conflicts++;
          // Keep local, log conflict
          console.warn(`⚠️  Conflict detected for key: ${key}`);
          this.emit('conflict', { key, localEntry, remoteEntry });
        }
      }
    }

    this.stats.conflicts += conflicts;
    this.stats.syncs++;
    this.stats.lastSync = Date.now();
    
    console.log(`✅ Merge complete: ${merged} entries merged, ${conflicts} conflicts`);
    this.emit('state:merged', { remotePeerId, merged, conflicts });
    
    return { merged, conflicts };
  }

  /**
   * Resolve conflict between local and remote entries
   */
  resolveConflict(key, localEntry, remoteEntry) {
    // Compare vector clocks
    const localClock = localEntry.vectorClock;
    const remoteClock = remoteEntry.vectorClock;
    
    const comparison = this.compareVectorClocks(localClock, remoteClock);
    
    if (comparison === 'less') {
      return 'remote'; // Remote is newer
    } else if (comparison === 'greater') {
      return 'local'; // Local is newer
    } else if (comparison === 'concurrent') {
      // Concurrent updates - use timestamp as tiebreaker
      if (remoteEntry.timestamp > localEntry.timestamp) {
        return 'remote';
      } else if (remoteEntry.timestamp < localEntry.timestamp) {
        return 'local';
      } else {
        // Same timestamp - use node ID as final tiebreaker
        return remoteEntry.nodeId > localEntry.nodeId ? 'remote' : 'local';
      }
    }
    
    return 'conflict';
  }

  /**
   * Compare vector clocks
   */
  compareVectorClocks(clock1, clock2) {
    let less = false;
    let greater = false;
    
    const allNodes = new Set([...clock1.keys(), ...clock2.keys()]);
    
    for (const node of allNodes) {
      const v1 = clock1.get(node) || 0;
      const v2 = clock2.get(node) || 0;
      
      if (v1 < v2) less = true;
      if (v1 > v2) greater = true;
    }
    
    if (less && !greater) return 'less';
    if (greater && !less) return 'greater';
    if (less && greater) return 'concurrent';
    return 'equal';
  }

  /**
   * Increment vector clock
   */
  incrementClock() {
    const current = this.vectorClock.get(this.nodeId) || 0;
    this.vectorClock.set(this.nodeId, current + 1);
    
    return new Map(this.vectorClock);
  }

  /**
   * Get current state snapshot
   */
  getSnapshot() {
    const snapshot = new Map();
    
    for (const [key, entry] of this.state.entries()) {
      snapshot.set(key, entry);
    }
    
    return {
      state: snapshot,
      vectorClock: new Map(this.vectorClock),
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.emit('sync:requested');
    }, this.syncInterval);
    
    console.log(`🔄 Periodic sync started (interval: ${this.syncInterval}ms)`);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('🛑 Periodic sync stopped');
    }
  }

  /**
   * Get all keys
   */
  keys() {
    return Array.from(this.state.keys());
  }

  /**
   * Get all values
   */
  values() {
    return Array.from(this.state.values()).map(entry => entry.value);
  }

  /**
   * Get all entries
   */
  entries() {
    const result = [];
    for (const [key, entry] of this.state.entries()) {
      result.push([key, entry.value]);
    }
    return result;
  }

  /**
   * Get state size
   */
  size() {
    return this.state.size;
  }

  /**
   * Clear all state
   */
  clear() {
    this.state.clear();
    this.tombstones.clear();
    this.emit('state:cleared');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      stateSize: this.state.size,
      tombstoneSize: this.tombstones.size,
      vectorClockSize: this.vectorClock.size
    };
  }

  /**
   * Export state for persistence
   */
  exportState() {
    return {
      state: Array.from(this.state.entries()),
      vectorClock: Array.from(this.vectorClock.entries()),
      tombstones: Array.from(this.tombstones.entries()),
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
  }

  /**
   * Import state from persistence
   */
  importState(exported) {
    this.state = new Map(exported.state);
    this.vectorClock = new Map(exported.vectorClock);
    this.tombstones = new Map(exported.tombstones);
    
    console.log(`📥 State imported: ${this.state.size} entries`);
    this.emit('state:imported', { size: this.state.size });
  }

  /**
   * Shutdown state manager
   */
  async shutdown() {
    console.log('🛑 Shutting down distributed state...');
    
    this.stopPeriodicSync();
    this.emit('shutdown');
    
    console.log('✅ Distributed state shutdown complete');
  }
}

export default DistributedState;
