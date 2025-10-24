import { test } from 'node:test';
import assert from 'node:assert';
import { AIOrchestrator } from '../src/ai/AIOrchestrator.js';

test('AIOrchestrator - Initialization', async () => {
  const ai = new AIOrchestrator();
  await ai.initialize();
  
  assert.ok(ai.models.size >= 5);
  assert.ok(ai.stats.totalQueries >= 0);
});

test('AIOrchestrator - Model Registration', async () => {
  const ai = new AIOrchestrator();
  await ai.initialize();
  
  const initialSize = ai.models.size;
  
  const modelId = await ai.registerModel({
    id: 'test-model',
    type: 'test',
    capabilities: ['testing'],
    priority: 5
  });
  
  assert.ok(modelId);
  assert.strictEqual(ai.models.size, initialSize + 1);
  assert.ok(ai.models.has('test-model'));
});

test('AIOrchestrator - Query Processing', async () => {
  const ai = new AIOrchestrator();
  await ai.initialize();
  
  const query = {
    id: 'test-query',
    content: 'Test query content',
    complexity: 'medium'
  };
  
  const result = await ai.process(query);
  
  assert.ok(result);
  assert.ok(result.modelId);
  assert.ok(result.response);
  assert.ok(result.confidence >= 0 && result.confidence <= 100);
  assert.strictEqual(ai.stats.totalQueries, 1);
});

test('AIOrchestrator - Model Selection', async () => {
  const ai = new AIOrchestrator();
  await ai.initialize();
  
  const requirements = {
    type: 'general',
    complexity: 'medium',
    capabilities: ['reasoning'],
    priority: 5
  };
  
  const models = ai.selectModels(requirements);
  
  assert.ok(models.length > 0);
  assert.ok(models[0].capabilities);
});

test('AIOrchestrator - Statistics', async () => {
  const ai = new AIOrchestrator();
  await ai.initialize();
  
  // Process a query
  await ai.process({ content: 'test', complexity: 'low' });
  
  const stats = ai.getStats();
  
  assert.ok(stats.totalQueries > 0);
  assert.ok(stats.registeredModels >= 5);
  assert.ok(stats.models.length > 0);
});

test('AIOrchestrator - Cache', async () => {
  const ai = new AIOrchestrator();
  await ai.initialize();
  
  const query = { content: 'cached query', complexity: 'low' };
  
  // First query - not cached
  const result1 = await ai.process(query);
  
  // Second identical query - should use cache
  const result2 = await ai.process(query);
  
  assert.ok(result1);
  assert.ok(result2);
  assert.strictEqual(ai.modelCache.size > 0, true);
  
  // Clear cache
  ai.clearCache();
  assert.strictEqual(ai.modelCache.size, 0);
});
