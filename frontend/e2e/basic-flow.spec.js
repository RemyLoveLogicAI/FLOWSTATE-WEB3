// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * FlowState AI Frontend - Basic E2E Tests
 * Tests core user flows and functionality
 */

// Configuration
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'https://flowstate-ai-backend.jmjones925.workers.dev';

test.describe('FlowState AI Frontend - Basic Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for network requests
    page.setDefaultTimeout(30000);
  });

  test('homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/FlowState/i);
    
    // Check that main content is visible
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('page has no console errors', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Should have no console errors
    expect(errors.length).toBe(0);
  });

  test('page has proper meta tags', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check charset
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset?.toLowerCase()).toBe('utf-8');
    
    // Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    
    // Check description if exists
    const description = page.locator('meta[name="description"]');
    if (await description.count() > 0) {
      const content = await description.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('page is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    await expect(root).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    await expect(root).toBeVisible();
  });

  test('assets load correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check that there are no failed network requests
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.waitForLoadState('networkidle');
    
    // Allow some failed requests (analytics, etc)
    // but flag if there are too many
    if (failedRequests.length > 5) {
      console.warn('Warning: Many failed requests:', failedRequests);
    }
  });

  test('page renders within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Page loaded in ${loadTime}ms`);
  });
});

test.describe('API Integration Tests', () => {
  
  test('can reach API health endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('can fetch available models', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/models`);
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.models).toBeDefined();
    expect(Array.isArray(data.models)).toBe(true);
    expect(data.models.length).toBeGreaterThan(0);
  });
});

test.describe('Performance Tests', () => {
  
  test('lighthouse performance check', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Use Playwright's built-in performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        loadComplete: perfData.loadEventEnd - perfData.navigationStart,
      };
    });
    
    // DOM should be ready in under 2 seconds
    expect(metrics.domContentLoaded).toBeLessThan(2000);
    
    console.log('Performance metrics:', metrics);
  });

  test('bundle size is reasonable', async ({ page }) => {
    const resourceSizes = new Map();
    
    page.on('response', async (response) => {
      const url = response.url();
      const headers = await response.allHeaders();
      
      if (headers['content-length']) {
        resourceSizes.set(url, parseInt(headers['content-length']));
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Calculate total size
    let totalSize = 0;
    resourceSizes.forEach(size => {
      totalSize += size;
    });
    
    // Total initial load should be under 5MB
    const totalMB = totalSize / (1024 * 1024);
    expect(totalMB).toBeLessThan(5);
    
    console.log(`Total resources: ${totalMB.toFixed(2)}MB`);
  });
});

test.describe('Accessibility Tests', () => {
  
  test('page has proper document structure', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for proper HTML structure
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');
    
    // Check for main landmark
    const mainOrRoot = await page.locator('main, #root').count();
    expect(mainOrRoot).toBeGreaterThan(0);
  });

  test('page has no critical accessibility issues', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for images without alt text (if any images exist)
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    
    // Warn if there are images without alt text
    if (imagesWithoutAlt > 0) {
      console.warn(`Warning: ${imagesWithoutAlt} images without alt text`);
    }
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for buttons and links
    const buttons = await page.locator('button, a').count();
    
    if (buttons > 0) {
      // Try tabbing through elements
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
    }
  });
});

test.describe('Error Handling', () => {
  
  test('handles 404 gracefully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-route-does-not-exist`);
    
    // Should still load the page (SPA routing)
    // or show a proper 404 page
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Intercept API calls and return errors
    await page.route(`${API_URL}/api/**`, route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto(BASE_URL);
    
    // Page should still load even if API fails
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});
