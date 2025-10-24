#!/usr/bin/env node

/**
 * Basic Query Example
 * Demonstrates simple AI query submission
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function basicQuery() {
  console.log('🚀 FlowState AI Supreme - Basic Query Example\n');

  const query = {
    query: {
      id: `query_${Date.now()}`,
      content: 'Explain the concept of decentralized artificial intelligence and its benefits',
      complexity: 'medium',
      type: 'explanation'
    }
  };

  console.log('📤 Sending query:', query.query.content);
  console.log('');

  try {
    const response = await fetch(`${API_BASE}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Query Successful!\n');
      console.log('📊 Results:');
      console.log('   Model:', result.data.modelId);
      console.log('   Type:', result.data.modelType);
      console.log('   Confidence:', result.data.confidence.toFixed(2) + '%');
      console.log('   Processing Time:', result.data.processingTime.toFixed(2) + 'ms');
      console.log('');
      console.log('💬 Response:');
      console.log('   ', result.data.response);
      console.log('');
    } else {
      console.error('❌ Query failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicQuery();
}

export default basicQuery;
