#!/usr/bin/env node

/**
 * Cognitive Enhancement Example
 * Demonstrates supreme-level cognitive enhancement
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function cognitiveEnhancement() {
  console.log('🧠 FlowState AI Supreme - Cognitive Enhancement Example\n');

  const input = {
    input: {
      content: 'Design an efficient algorithm for distributed consensus in a decentralized network with Byzantine fault tolerance',
      context: 'distributed systems, blockchain, consensus algorithms',
      requirements: ['high performance', 'fault tolerance', 'scalability']
    },
    options: {
      level: 'supreme',
      strategies: ['reasoning', 'creativity', 'optimization']
    }
  };

  console.log('📤 Input:', input.input.content);
  console.log('🎯 Enhancement Level:', input.options.level);
  console.log('');

  try {
    const response = await fetch(`${API_BASE}/cognitive/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Enhancement Successful!\n');
      
      const data = result.data;
      
      console.log('📊 Analysis:');
      console.log('   Complexity:', (data.analysis.complexity * 100).toFixed(1) + '%');
      console.log('   Domains:', data.analysis.domains.join(', '));
      console.log('');
      
      console.log('🧠 Reasoning:');
      console.log('   Methods:', data.reasoning.methods.join(', '));
      console.log('   Chains:', data.reasoning.chains.length, 'reasoning chains');
      console.log('');
      
      console.log('🚀 Learning:');
      console.log('   Patterns Found:', data.learning.similar_patterns.length);
      console.log('   New Pattern Created:', data.learning.new_pattern.name);
      console.log('');
      
      console.log('💡 Creative Approaches:');
      data.creative.approaches.forEach((approach, i) => {
        console.log(`   ${i + 1}. ${approach.type}: ${approach.result}`);
      });
      console.log('');
      
      console.log('⚡ Optimization:');
      console.log('   Score:', (data.enhanced.score * 100).toFixed(1) + '%');
      console.log('   Improvements:', data.enhanced.improvements.length);
      console.log('');
      
      console.log('📈 Overall Confidence:', data.confidenceScore.toFixed(2) + '%');
      console.log('⏱️  Processing Time:', data.processingTime + 'ms');
      console.log('');
    } else {
      console.error('❌ Enhancement failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cognitiveEnhancement();
}

export default cognitiveEnhancement;
