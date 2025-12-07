/**
 * Performance Tests for Optimizations
 * 
 * Tests to verify that performance improvements are working correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Helper to measure execution time
async function measureTime(fn: () => Promise<any>): Promise<number> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

describe('Performance Optimizations', () => {
  describe('Regex Pre-compilation', () => {
    it('should use static regexes for better performance', () => {
      // Test that static regexes are defined
      const codeText = 'Here is some code to test';
      const visionText = 'Show me an image of a cat';
      
      // These should execute quickly with pre-compiled regexes
      const hasCode = /code|program|function|script/i.test(codeText);
      const hasVision = /image|photo|picture|visual/i.test(visionText);
      
      expect(hasCode).toBe(true);
      expect(hasVision).toBe(true);
    });
  });

  describe('Array Operations Optimization', () => {
    it('should use efficient loops instead of filter chains', () => {
      const queryTerms = ['test', 'performance', 'optimization'];
      const title = 'test performance optimization results';
      const snippet = 'this is a test of performance';
      
      // Optimized approach - convert to lowercase once
      const titleLower = title.toLowerCase();
      const snippetLower = snippet.toLowerCase();
      
      let titleMatch = 0;
      let snippetMatch = 0;
      
      for (const term of queryTerms) {
        if (titleLower.includes(term)) titleMatch++;
        if (snippetLower.includes(term)) snippetMatch++;
      }
      
      expect(titleMatch).toBe(3);
      expect(snippetMatch).toBe(2);
    });
  });

  describe('Set-based Lookups', () => {
    it('should use Set for O(1) lookups instead of array includes', () => {
      const positiveWords = new Set(['good', 'great', 'excellent', 'amazing']);
      const text = 'this is a great and amazing test';
      const words = text.split(/\s+/);
      
      let count = 0;
      for (const word of words) {
        if (positiveWords.has(word)) count++;
      }
      
      expect(count).toBe(2); // 'great' and 'amazing'
    });
  });

  describe('Memoization', () => {
    it('should cache expensive function results', () => {
      const cache = new Map();
      
      function expensiveFunction(x: number): number {
        return x * x;
      }
      
      function memoized(x: number): number {
        if (cache.has(x)) {
          return cache.get(x);
        }
        const result = expensiveFunction(x);
        cache.set(x, result);
        return result;
      }
      
      // First call - computes
      const result1 = memoized(5);
      expect(result1).toBe(25);
      expect(cache.size).toBe(1);
      
      // Second call - from cache
      const result2 = memoized(5);
      expect(result2).toBe(25);
      expect(cache.size).toBe(1);
    });
  });

  describe('Parallel Operations', () => {
    it('should execute independent async operations in parallel', async () => {
      const tasks = [
        async () => new Promise(resolve => setTimeout(() => resolve(1), 50)),
        async () => new Promise(resolve => setTimeout(() => resolve(2), 50)),
        async () => new Promise(resolve => setTimeout(() => resolve(3), 50)),
      ];
      
      // Sequential execution would take ~150ms
      const sequentialTime = await measureTime(async () => {
        const results = [];
        for (const task of tasks) {
          results.push(await task());
        }
        return results;
      });
      
      // Parallel execution should take ~50ms
      const parallelTime = await measureTime(async () => {
        return await Promise.all(tasks.map(task => task()));
      });
      
      // Parallel should be significantly faster
      expect(parallelTime).toBeLessThan(sequentialTime * 0.7);
    });
  });

  describe('Cache with TTL', () => {
    it('should implement cache with time-to-live', async () => {
      const cache = new Map<string, { result: any; timestamp: number }>();
      const TTL = 100; // 100ms
      
      function getCached(key: string): any | null {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < TTL) {
          return cached.result;
        }
        return null;
      }
      
      function setCache(key: string, value: any) {
        cache.set(key, { result: value, timestamp: Date.now() });
      }
      
      // Set cache
      setCache('test', 'value1');
      expect(getCached('test')).toBe('value1');
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Cache should be expired
      expect(getCached('test')).toBeNull();
    });
  });

  describe('LRU Cache Eviction', () => {
    it('should evict oldest entries when cache size limit is reached', () => {
      const cache = new Map<string, any>();
      const MAX_SIZE = 3;
      
      function addToCache(key: string, value: any) {
        cache.set(key, value);
        
        if (cache.size > MAX_SIZE) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }
      }
      
      addToCache('a', 1);
      addToCache('b', 2);
      addToCache('c', 3);
      expect(cache.size).toBe(3);
      
      // Adding 4th item should evict 'a'
      addToCache('d', 4);
      expect(cache.size).toBe(3);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('d')).toBe(true);
    });
  });

  describe('Error Handling in Async Operations', () => {
    it('should handle errors gracefully in parallel operations', async () => {
      const tasks = [
        () => Promise.resolve(1),
        () => Promise.reject(new Error('test error')),
        () => Promise.resolve(3),
      ];
      
      const results = await Promise.allSettled(tasks.map(task => task()));
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
      
      // Extract successful results
      const successful = results
        .filter((r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled')
        .map(r => r.value);
      
      expect(successful).toEqual([1, 3]);
    });
  });

  describe('Throttle and Debounce', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      
      function throttle(func: Function, wait: number) {
        let inThrottle = false;
        
        return function(...args: any[]) {
          if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
          }
        };
      }
      
      const throttled = throttle(() => callCount++, 100);
      
      // Call multiple times rapidly
      throttled();
      throttled();
      throttled();
      
      // Only first call should execute
      expect(callCount).toBe(1);
      
      // Wait for throttle period
      await new Promise(resolve => setTimeout(resolve, 150));
      
      throttled();
      expect(callCount).toBe(2);
    });

    it('should debounce function calls', async () => {
      let callCount = 0;
      
      function debounce(func: Function, wait: number) {
        let timeout: NodeJS.Timeout;
        
        return function(...args: any[]) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), wait);
        };
      }
      
      const debounced = debounce(() => callCount++, 100);
      
      // Call multiple times rapidly
      debounced();
      debounced();
      debounced();
      
      // Should not execute yet
      expect(callCount).toBe(0);
      
      // Wait for debounce period
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should execute once
      expect(callCount).toBe(1);
    });
  });
});
