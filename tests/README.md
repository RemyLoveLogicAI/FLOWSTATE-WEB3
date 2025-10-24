# FlowState AI Supreme - Test Suite

Comprehensive test suite for all platform components.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
node --test tests/core.test.js
```

### Run with Spec Reporter
```bash
node tests/run-tests.js
```

## Test Coverage

### Core Tests (`core.test.js`)
- ✅ Initialization
- ✅ Module registration
- ✅ Peer management
- ✅ Query execution
- ✅ Status reporting

### AI Tests (`ai.test.js`)
- ✅ Initialization
- ✅ Model registration
- ✅ Query processing
- ✅ Model selection
- ✅ Statistics
- ✅ Caching

### State Tests (`state.test.js`)
- ✅ Initialization
- ✅ Set and get operations
- ✅ Delete operations
- ✅ Vector clock management
- ✅ State merging
- ✅ Conflict resolution
- ✅ Export/import
- ✅ Statistics

### Cognitive Tests (`cognitive.test.js`)
- ✅ Initialization
- ✅ Enhancement pipeline
- ✅ Input analysis
- ✅ Reasoning enhancement
- ✅ Meta-learning
- ✅ Creative enhancement
- ✅ Knowledge graph
- ✅ Statistics

## Test Structure

Each test file follows this pattern:

```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import { Component } from '../src/component/Component.js';

test('Component - Feature', async () => {
  // Setup
  const component = new Component();
  
  // Execute
  const result = await component.method();
  
  // Assert
  assert.ok(result);
  
  // Cleanup
  await component.shutdown();
});
```

## Adding New Tests

1. Create a new file: `tests/your-feature.test.js`
2. Import the test framework and component
3. Write test cases following the pattern above
4. Run tests to verify

## Best Practices

- Use descriptive test names
- Test one thing per test
- Clean up resources (shutdown, close connections)
- Use async/await for async operations
- Assert expected outcomes
- Handle errors appropriately

## Continuous Integration

Tests are automatically run on:
- Pre-commit hooks
- Pull requests
- Deployment pipelines

## Test Output

Tests provide detailed output:
```
✔ DecentralizedCore - Initialization (45ms)
✔ DecentralizedCore - Module Registration (12ms)
✔ DecentralizedCore - Peer Management (8ms)
...
```

## Debugging Tests

Run with debugging:
```bash
node --inspect-brk --test tests/core.test.js
```

## Performance Tests

For performance testing:
```bash
NODE_ENV=test node tests/performance.test.js
```

## Integration Tests

Integration tests require running services:
```bash
npm start  # In one terminal
npm test   # In another terminal
```

## Coverage Reports

Generate coverage (when coverage tool is installed):
```bash
npm run test:coverage
```

## Troubleshooting

### Tests Timeout
Increase timeout in test file:
```javascript
test('Long running test', { timeout: 60000 }, async () => {
  // test code
});
```

### Module Import Errors
Ensure you're using ES modules:
- Check `"type": "module"` in package.json
- Use `.js` extensions in imports

### Async Issues
Always use `async/await` or return promises:
```javascript
test('Async test', async () => {
  const result = await asyncOperation();
  assert.ok(result);
});
```

## Next Steps

- Add more edge case tests
- Increase test coverage
- Add integration tests
- Implement E2E tests
- Add performance benchmarks
