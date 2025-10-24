import { test } from 'node:test';
import assert from 'node:assert';
import { DistributedState } from '../src/state/DistributedState.js';

test('DistributedState - Initialization', async () => {
  const state = new DistributedState({ nodeId: 'test-node' });
  await state.initialize();
  
  assert.strictEqual(state.nodeId, 'test-node');
  assert.ok(state.vectorClock.has('test-node'));
  
  await state.shutdown();
});

test('DistributedState - Set and Get', async () => {
  const state = new DistributedState();
  await state.initialize();
  
  await state.set('key1', 'value1');
  const value = state.get('key1');
  
  assert.ok(value);
  assert.strictEqual(value.value, 'value1');
  assert.ok(value.timestamp);
  
  await state.shutdown();
});

test('DistributedState - Delete', async () => {
  const state = new DistributedState();
  await state.initialize();
  
  await state.set('key1', 'value1');
  assert.ok(state.get('key1'));
  
  await state.delete('key1');
  assert.strictEqual(state.get('key1'), undefined);
  
  await state.shutdown();
});

test('DistributedState - Vector Clock', async () => {
  const state = new DistributedState({ nodeId: 'node1' });
  await state.initialize();
  
  const clock1 = state.vectorClock.get('node1');
  
  await state.set('key1', 'value1');
  
  const clock2 = state.vectorClock.get('node1');
  
  assert.ok(clock2 > clock1);
  
  await state.shutdown();
});

test('DistributedState - State Merge', async () => {
  const state1 = new DistributedState({ nodeId: 'node1' });
  const state2 = new DistributedState({ nodeId: 'node2' });
  
  await state1.initialize();
  await state2.initialize();
  
  await state1.set('key1', 'value1');
  await state2.set('key2', 'value2');
  
  // Get snapshot from state2
  const snapshot = state2.getSnapshot();
  
  // Merge into state1
  const result = await state1.mergeState(snapshot.state, 'node2');
  
  assert.ok(result.merged >= 0);
  assert.ok(state1.get('key2'));
  
  await state1.shutdown();
  await state2.shutdown();
});

test('DistributedState - Conflict Resolution', async () => {
  const state = new DistributedState();
  await state.initialize();
  
  const localEntry = {
    value: 'local',
    timestamp: 1000,
    vectorClock: new Map([['node1', 1]]),
    nodeId: 'node1'
  };
  
  const remoteEntry = {
    value: 'remote',
    timestamp: 2000,
    vectorClock: new Map([['node2', 1]]),
    nodeId: 'node2'
  };
  
  const resolution = state.resolveConflict('key', localEntry, remoteEntry);
  
  // Remote has higher timestamp, should win
  assert.strictEqual(resolution, 'remote');
  
  await state.shutdown();
});

test('DistributedState - Export/Import', async () => {
  const state1 = new DistributedState({ nodeId: 'export-test' });
  await state1.initialize();
  
  await state1.set('key1', 'value1');
  await state1.set('key2', 'value2');
  
  const exported = state1.exportState();
  
  assert.ok(exported.state);
  assert.ok(exported.vectorClock);
  assert.strictEqual(exported.nodeId, 'export-test');
  
  const state2 = new DistributedState();
  await state2.initialize();
  
  state2.importState(exported);
  
  assert.ok(state2.get('key1'));
  assert.ok(state2.get('key2'));
  
  await state1.shutdown();
  await state2.shutdown();
});

test('DistributedState - Statistics', async () => {
  const state = new DistributedState();
  await state.initialize();
  
  await state.set('key1', 'value1');
  await state.set('key2', 'value2');
  
  const stats = state.getStats();
  
  assert.strictEqual(stats.stateSize, 2);
  assert.ok(stats.operations >= 2);
  
  await state.shutdown();
});
