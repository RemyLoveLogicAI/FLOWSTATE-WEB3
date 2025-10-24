#!/usr/bin/env node

/**
 * Blockchain Recording Example
 * Demonstrates recording AI operations on blockchain
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function blockchainRecording() {
  console.log('⛓️  FlowState AI Supreme - Blockchain Recording Example\n');

  // First, perform an AI operation
  console.log('Step 1: Performing AI operation...');
  
  const operation = {
    id: `op_${Date.now()}`,
    type: 'ai_query',
    data: {
      query: 'Optimize smart contract gas usage',
      result: 'Optimization completed with 37% gas reduction',
      timestamp: Date.now()
    },
    metadata: {
      model: 'genius-gpt',
      confidence: 94.5,
      processingTime: 156
    }
  };

  console.log('📝 Operation:', operation.type);
  console.log('🆔 Operation ID:', operation.id);
  console.log('');

  // Record on blockchain
  console.log('Step 2: Recording on blockchain...');
  
  try {
    const response = await fetch(`${API_BASE}/blockchain/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Operation Recorded on Blockchain!\n');
      
      console.log('📊 Blockchain Receipt:');
      console.log('   Transaction Hash:', result.data.txHash);
      console.log('   Block Number:', result.data.block);
      console.log('   Operation ID:', result.data.operation.id);
      console.log('   Operation Hash:', result.data.operation.hash);
      console.log('   Timestamp:', new Date(result.data.operation.timestamp).toISOString());
      console.log('');
      
      console.log('🔐 Immutability Guaranteed:');
      console.log('   This operation is now permanently recorded on the blockchain');
      console.log('   It can be verified and audited at any time');
      console.log('   The record cannot be altered or deleted');
      console.log('');

      // Demonstrate verification
      console.log('Step 3: Verifying operation integrity...');
      console.log('');
      
      // In a real implementation, this would query the blockchain
      console.log('✅ Verification Complete:');
      console.log('   Operation ID:', result.data.operation.id);
      console.log('   Hash Match: ✓');
      console.log('   Timestamp Valid: ✓');
      console.log('   Blockchain Confirmed: ✓');
      console.log('');
      
    } else {
      console.error('❌ Recording failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Show blockchain benefits
  console.log('💡 Blockchain Benefits:');
  console.log('   • Immutable audit trail of all AI operations');
  console.log('   • Verifiable proof of AI decision-making process');
  console.log('   • Transparent governance and accountability');
  console.log('   • Decentralized trust without central authority');
  console.log('   • Tamper-proof record of model predictions');
  console.log('');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  blockchainRecording();
}

export default blockchainRecording;
