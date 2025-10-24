#!/usr/bin/env node

/**
 * Test Runner for FlowState AI Supreme
 */

import { run } from 'node:test';
import { spec as SpecReporter } from 'node:test/reporters';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 FlowState AI Supreme - Test Suite\n');

async function runTests() {
  try {
    // Get all test files
    const files = await readdir(__dirname);
    const testFiles = files
      .filter(file => file.endsWith('.test.js'))
      .map(file => join(__dirname, file));

    console.log(`Found ${testFiles.length} test files:\n`);
    testFiles.forEach((file, i) => {
      const name = file.split('/').pop();
      console.log(`  ${i + 1}. ${name}`);
    });
    console.log('\n' + '='.repeat(70) + '\n');

    // Run tests with spec reporter
    const stream = run({
      files: testFiles,
      concurrency: 1,
      timeout: 30000
    });

    stream.compose(new SpecReporter()).pipe(process.stdout);

    // Wait for completion
    await new Promise((resolve, reject) => {
      stream.on('test:fail', () => {
        process.exitCode = 1;
      });
      
      stream.on('end', () => {
        console.log('\n' + '='.repeat(70) + '\n');
        
        if (process.exitCode === 1) {
          console.log('❌ Some tests failed\n');
          reject(new Error('Tests failed'));
        } else {
          console.log('✅ All tests passed!\n');
          resolve();
        }
      });
      
      stream.on('error', reject);
    });

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runTests();
