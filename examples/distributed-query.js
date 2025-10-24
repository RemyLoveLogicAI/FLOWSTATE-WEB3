#!/usr/bin/env node

/**
 * Distributed Query Example
 * Demonstrates distributed processing across the network
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function distributedQuery() {
  console.log('🌐 FlowState AI Supreme - Distributed Query Example\n');

  // First, check network status
  console.log('📡 Checking network status...');
  
  try {
    const statusResponse = await fetch(`${API_BASE}/status`);
    const status = await statusResponse.json();
    
    if (status.success) {
      console.log('✅ Network Status:');
      console.log('   Node ID:', status.data.nodeId);
      console.log('   Connected Peers:', status.data.peers);
      console.log('   Capabilities:', status.data.state.capabilities.join(', '));
      console.log('');
    }
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }

  // Submit a complex query for distributed processing
  const query = {
    query: {
      id: `dist_query_${Date.now()}`,
      content: 'Analyze the trade-offs between different consensus mechanisms (PoW, PoS, PBFT, Raft) in distributed systems, considering scalability, security, and energy efficiency',
      complexity: 'high',  // High complexity triggers distributed processing
      type: 'analysis'
    },
    options: {
      strategy: 'distributed',  // Force distributed strategy
      timeout: 30000
    }
  };

  console.log('📤 Sending complex distributed query...');
  console.log('📝 Query:', query.query.content);
  console.log('⚙️  Strategy:', query.options.strategy);
  console.log('');

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    const result = await response.json();
    const totalTime = Date.now() - startTime;

    if (result.success) {
      console.log('✅ Distributed Query Successful!\n');
      
      console.log('📊 Processing Details:');
      console.log('   Model Used:', result.data.modelId);
      console.log('   Model Type:', result.data.modelType);
      console.log('   Confidence:', result.data.confidence.toFixed(2) + '%');
      console.log('   Processing Time:', result.data.processingTime.toFixed(2) + 'ms');
      console.log('   Total Time:', totalTime + 'ms');
      console.log('');
      
      console.log('💬 Response:');
      console.log('   ', result.data.response);
      console.log('');
      
      console.log('🎯 Model Capabilities:');
      result.data.metadata.capabilities.forEach(cap => {
        console.log('   •', cap);
      });
      console.log('');
      
    } else {
      console.error('❌ Query failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Check network peers
  console.log('🔍 Checking connected peers...');
  
  try {
    const peersResponse = await fetch(`${API_BASE}/network/peers`);
    const peers = await peersResponse.json();
    
    if (peers.success) {
      console.log('📡 Network Peers:');
      console.log('   Total Peers:', peers.data.count);
      
      if (peers.data.peers.length > 0) {
        peers.data.peers.forEach(peer => {
          console.log(`   • ${peer.id}: ${peer.capabilities.join(', ')}`);
        });
      } else {
        console.log('   (No peers connected - running in single-node mode)');
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Peer check failed:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  distributedQuery();
}

export default distributedQuery;
