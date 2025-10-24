import { test } from 'node:test';
import assert from 'node:assert';
import { CognitiveEnhancer } from '../src/cognitive/CognitiveEnhancer.js';

test('CognitiveEnhancer - Initialization', async () => {
  const cognitive = new CognitiveEnhancer({ level: 'supreme' });
  await cognitive.initialize();
  
  assert.strictEqual(cognitive.enhancementLevel, 'supreme');
  assert.ok(cognitive.capabilities);
  assert.ok(cognitive.knowledge_graph.size > 0);
  assert.ok(cognitive.learned_patterns.length > 0);
});

test('CognitiveEnhancer - Enhancement Pipeline', async () => {
  const cognitive = new CognitiveEnhancer();
  await cognitive.initialize();
  
  const input = {
    content: 'Optimize this algorithm',
    context: 'optimization'
  };
  
  const result = await cognitive.enhance(input);
  
  assert.ok(result.id);
  assert.ok(result.enhanced);
  assert.ok(result.analysis);
  assert.ok(result.reasoning);
  assert.ok(result.learning);
  assert.ok(result.creative);
  assert.ok(result.confidenceScore >= 0 && result.confidenceScore <= 100);
  assert.strictEqual(cognitive.stats.enhancementsApplied, 1);
});

test('CognitiveEnhancer - Input Analysis', async () => {
  const cognitive = new CognitiveEnhancer();
  await cognitive.initialize();
  
  const input = {
    content: 'Analyze image patterns and optimize visual recognition',
    type: 'analysis'
  };
  
  const analysis = await cognitive.analyzeInput(input);
  
  assert.ok(analysis.complexity >= 0 && analysis.complexity <= 1);
  assert.ok(Array.isArray(analysis.domains));
  assert.ok(Array.isArray(analysis.patterns));
  assert.ok(analysis.requires);
});

test('CognitiveEnhancer - Reasoning Enhancement', async () => {
  const cognitive = new CognitiveEnhancer();
  await cognitive.initialize();
  
  const input = { content: 'Complex reasoning task' };
  const analysis = { complexity: 0.8, domains: ['logic'] };
  
  const reasoning = await cognitive.enhanceReasoning(input, analysis);
  
  assert.ok(Array.isArray(reasoning.methods));
  assert.ok(Array.isArray(reasoning.chains));
  assert.ok(reasoning.synthesis);
  assert.ok(reasoning.methods.length > 0);
});

test('CognitiveEnhancer - Meta-Learning', async () => {
  const cognitive = new CognitiveEnhancer();
  await cognitive.initialize();
  
  const input = { content: 'Learn from experience' };
  const reasoning = { methods: ['inductive'], chains: [] };
  
  const learning = await cognitive.applyMetaLearning(input, reasoning);
  
  assert.ok(Array.isArray(learning.similar_patterns));
  assert.ok(Array.isArray(learning.transferable));
  assert.ok(learning.new_pattern);
  assert.ok(learning.new_pattern.name);
});

test('CognitiveEnhancer - Creative Enhancement', async () => {
  const cognitive = new CognitiveEnhancer();
  await cognitive.initialize();
  
  const input = { content: 'Generate creative solution' };
  const learning = { adapted: ['concept1', 'concept2'] };
  
  const creative = await cognitive.enhanceCreativity(input, learning);
  
  assert.ok(Array.isArray(creative.approaches));
  assert.ok(creative.noveltyScore >= 0 && creative.noveltyScore <= 1);
  assert.ok(creative.practicality >= 0 && creative.practicality <= 1);
  assert.strictEqual(cognitive.stats.creativeSolutions, 1);
});

test('CognitiveEnhancer - Knowledge Graph', async () => {
  const cognitive = new CognitiveEnhancer();
  await cognitive.initialize();
  
  cognitive.addConcept('test-concept', {
    type: 'test',
    attributes: ['attr1', 'attr2']
  });
  
  assert.ok(cognitive.knowledge_graph.has('test-concept'));
  
  const concept = cognitive.knowledge_graph.get('test-concept');
  assert.strictEqual(concept.type, 'test');
  assert.ok(Array.isArray(concept.connections));
});

test('CognitiveEnhancer - Statistics', async () => {
  const cognitive = new CognitiveEnhancer();
  await cognitive.initialize();
  
  await cognitive.enhance({ content: 'test' });
  
  const stats = cognitive.getStats();
  
  assert.ok(stats.enhancementsApplied > 0);
  assert.ok(stats.patternsLearned > 0);
  assert.ok(stats.knowledgeGraphSize > 0);
});
