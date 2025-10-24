import { test } from 'node:test';
import assert from 'node:assert';
import { DecentralizedCore } from '../src/core/DecentralizedCore.js';

test('DecentralizedCore - Initialization', async () => {
  const core = new DecentralizedCore({ nodeId: 'test-node' });
  const result = await core.initialize();
  
  assert.strictEqual(result, true);
  assert.strictEqual(core.nodeId, 'test-node');
  assert.strictEqual(core.state.status, 'ready');
  assert.ok(core.state.capabilities.length > 0);
  
  await core.shutdown();
});

test('DecentralizedCore - Module Registration', async () => {
  const core = new DecentralizedCore();
  await core.initialize();
  
  const mockModule = { name: 'test', initialized: true };
  core.registerModule('ai', mockModule);
  
  assert.strictEqual(core.modules.ai, mockModule);
  
  await core.shutdown();
});

test('DecentralizedCore - Peer Management', async () => {
  const core = new DecentralizedCore();
  await core.initialize();
  
  const peerId = 'peer-123';
  const peerInfo = { address: '127.0.0.1', capabilities: ['compute'] };
  
  core.registerPeer(peerId, peerInfo);
  assert.strictEqual(core.peers.size, 1);
  assert.ok(core.peers.has(peerId));
  
  core.unregisterPeer(peerId);
  assert.strictEqual(core.peers.size, 0);
  
  await core.shutdown();
});

test('DecentralizedCore - Query Execution', async () => {
  const core = new DecentralizedCore();
  await core.initialize();
  
  // Register mock AI module
  const mockAI = {
    process: async (query) => ({ result: 'processed', query })
  };
  core.registerModule('ai', mockAI);
  
  const query = { id: 'test', content: 'test query', complexity: 'low' };
  const result = await core.executeDistributedQuery(query);
  
  assert.ok(result);
  assert.strictEqual(result.result, 'processed');
  assert.strictEqual(core.metrics.queriesProcessed, 1);
  
  await core.shutdown();
});

test('DecentralizedCore - Status Reporting', async () => {
  const core = new DecentralizedCore({ nodeId: 'status-test' });
  await core.initialize();
  
  const status = core.getStatus();
  
  assert.strictEqual(status.nodeId, 'status-test');
  assert.ok(status.state);
  assert.ok(status.metrics);
  assert.strictEqual(status.peers, 0);
  
  await core.shutdown();
});
