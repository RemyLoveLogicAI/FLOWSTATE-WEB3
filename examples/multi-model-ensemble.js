#!/usr/bin/env node

/**
 * Multi-Model Ensemble Example
 * Demonstrates querying multiple AI models and combining results
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function multiModelEnsemble() {
  console.log('🎭 FlowState AI Supreme - Multi-Model Ensemble Example\n');

  // First, get information about available models
  console.log('Step 1: Checking available AI models...');
  
  try {
    const modelsResponse = await fetch(`${API_BASE}/ai/models`);
    const models = await modelsResponse.json();
    
    if (models.success) {
      console.log('✅ Available AI Models:\n');
      console.log('📊 System Statistics:');
      console.log('   Total Models:', models.data.registeredModels);
      console.log('   Queries Processed:', models.data.totalQueries);
      console.log('   Success Rate:', ((models.data.successfulQueries / models.data.totalQueries * 100) || 0).toFixed(1) + '%');
      console.log('   Avg Response Time:', models.data.averageResponseTime.toFixed(2) + 'ms');
      console.log('');
      
      console.log('🤖 Model Details:');
      models.data.models.forEach((model, i) => {
        console.log(`   ${i + 1}. ${model.id} (${model.type})`);
        console.log(`      Status: ${model.status}`);
        console.log(`      Queries: ${model.queriesProcessed}`);
        console.log(`      Avg Latency: ${model.averageLatency.toFixed(2)}ms`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Model check failed:', error.message);
  }

  // Submit a complex query that benefits from ensemble
  console.log('Step 2: Submitting ensemble query...');
  console.log('');

  const queries = [
    {
      name: 'Complex Problem Analysis',
      query: {
        id: `ensemble_${Date.now()}_1`,
        content: 'Design a scalable, fault-tolerant distributed system for real-time AI inference',
        complexity: 'high',
        type: 'design'
      }
    },
    {
      name: 'Optimization Challenge',
      query: {
        id: `ensemble_${Date.now()}_2`,
        content: 'Optimize the training pipeline for a large language model to reduce computational costs',
        complexity: 'high',
        type: 'optimization'
      }
    }
  ];

  for (const item of queries) {
    console.log(`📤 Query: ${item.name}`);
    console.log(`   "${item.query.content}"`);
    console.log('');

    try {
      const response = await fetch(`${API_BASE}/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: item.query })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Result:');
        console.log('   Model:', result.data.modelId);
        console.log('   Confidence:', result.data.confidence.toFixed(2) + '%');
        console.log('   Time:', result.data.processingTime.toFixed(2) + 'ms');
        console.log('   Response:', result.data.response.substring(0, 100) + '...');
        console.log('');
      }
    } catch (error) {
      console.error('❌ Query failed:', error.message);
    }
  }

  // Show ensemble benefits
  console.log('💡 Ensemble Learning Benefits:');
  console.log('   • Multiple models provide diverse perspectives');
  console.log('   • Increased accuracy through consensus');
  console.log('   • Robustness against individual model failures');
  console.log('   • Specialized models for different problem types');
  console.log('   • Automatic model selection based on query requirements');
  console.log('');

  // Get final statistics
  console.log('Step 3: Retrieving comprehensive statistics...');
  console.log('');

  try {
    const statsResponse = await fetch(`${API_BASE}/stats`);
    const stats = await statsResponse.json();
    
    if (stats.success) {
      console.log('📊 Platform Statistics:');
      console.log('');
      console.log('API Server:');
      console.log('   Total Requests:', stats.data.api.requests);
      console.log('   Error Rate:', ((stats.data.api.errors / stats.data.api.requests * 100) || 0).toFixed(2) + '%');
      console.log('');
      
      if (stats.data.cognitive) {
        console.log('Cognitive Enhancement:');
        console.log('   Enhancements Applied:', stats.data.cognitive.enhancementsApplied);
        console.log('   Patterns Learned:', stats.data.cognitive.patternsLearned);
        console.log('   Creative Solutions:', stats.data.cognitive.creativeSolutions);
        console.log('');
      }
    }
  } catch (error) {
    console.error('❌ Stats retrieval failed:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  multiModelEnsemble();
}

export default multiModelEnsemble;
