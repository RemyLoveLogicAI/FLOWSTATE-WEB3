# FlowState AI Supreme - Examples

This directory contains practical examples demonstrating various features of the FlowState AI Supreme platform.

## Available Examples

### 1. Basic Query (`basic-query.js`)
Simple AI query submission demonstrating the fundamental API usage.

**What it shows:**
- Basic API interaction
- Query submission format
- Response parsing
- Confidence scoring

**Run it:**
```bash
node examples/basic-query.js
```

### 2. Cognitive Enhancement (`cognitive-enhancement.js`)
Demonstrates supreme-level cognitive enhancement capabilities.

**What it shows:**
- Advanced reasoning strategies
- Meta-learning application
- Creative synthesis
- Optimization pipeline

**Run it:**
```bash
node examples/cognitive-enhancement.js
```

### 3. Distributed Query (`distributed-query.js`)
Shows distributed processing across the P2P network.

**What it shows:**
- Network status checking
- Distributed query routing
- Peer discovery
- High-complexity processing

**Run it:**
```bash
node examples/distributed-query.js
```

### 4. Blockchain Recording (`blockchain-recording.js`)
Demonstrates recording AI operations on blockchain for immutability.

**What it shows:**
- Operation recording
- Blockchain transactions
- Verification process
- Audit trail benefits

**Run it:**
```bash
node examples/blockchain-recording.js
```

### 5. Multi-Model Ensemble (`multi-model-ensemble.js`)
Shows how multiple AI models work together.

**What it shows:**
- Model discovery
- Ensemble learning
- Performance statistics
- Model specialization

**Run it:**
```bash
node examples/multi-model-ensemble.js
```

## Running All Examples

To run all examples in sequence:

```bash
for example in examples/*.js; do
  if [ "$example" != "examples/README.md" ]; then
    echo "Running $example..."
    node "$example"
    echo "---"
  fi
done
```

## Configuration

Set the API base URL if running against a different server:

```bash
export API_BASE=https://your-server.com/api
node examples/basic-query.js
```

## Example Output

Each example provides detailed console output showing:
- ✅ Success indicators
- 📊 Statistics and metrics
- 💬 Response content
- ⚡ Performance data
- 💡 Educational insights

## Integration Patterns

These examples demonstrate common integration patterns:

1. **Simple Request/Response** - Direct API calls
2. **Complex Workflows** - Multi-step operations
3. **Real-time Monitoring** - Status checking
4. **Error Handling** - Graceful failure management
5. **Performance Optimization** - Efficient API usage

## Best Practices

From these examples, learn:
- Proper error handling
- Timeout management
- Response validation
- Performance monitoring
- Security considerations

## Next Steps

After running these examples:
1. Read the API documentation (`docs/API.md`)
2. Explore the architecture (`docs/ARCHITECTURE.md`)
3. Try modifying the examples for your use case
4. Build your own applications on top of the platform

## Need Help?

- Check the main README.md
- Review the QUICKSTART.md guide
- Explore the API documentation
- Look at the source code in `src/`

Happy coding! 🚀
