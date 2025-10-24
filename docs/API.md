# FlowState AI Supreme - API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently using open API. Future versions will require JWT authentication.

## Endpoints

### Health Check

Check if the API server is running.

```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123456,
  "timestamp": 1234567890
}
```

---

### System Status

Get the overall system status.

```
GET /api/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nodeId": "abc123",
    "state": {
      "status": "ready",
      "nodeType": "full",
      "capabilities": ["compute", "storage", "ai-orchestration"],
      "isLeader": false,
      "epoch": 42
    },
    "peers": 5,
    "metrics": {
      "queriesProcessed": 100,
      "consensusRounds": 10,
      "uptime": 3600000
    }
  }
}
```

---

### AI Query

Submit an AI query for processing.

```
POST /api/ai/query
```

**Request Body:**
```json
{
  "query": {
    "id": "query_123",
    "content": "Explain quantum computing",
    "complexity": "high",
    "type": "explanation"
  },
  "options": {
    "strategy": "distributed",
    "timeout": 30000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modelId": "genius-gpt",
    "modelType": "language",
    "response": "Advanced cognitive analysis: Quantum computing...",
    "confidence": 95.5,
    "processingTime": 150,
    "metadata": {
      "capabilities": ["reasoning", "generation"],
      "specialization": "general"
    }
  }
}
```

---

### Cognitive Enhancement

Apply cognitive enhancement to input.

```
POST /api/cognitive/enhance
```

**Request Body:**
```json
{
  "input": {
    "content": "Solve complex problem X",
    "context": "optimization"
  },
  "options": {
    "level": "supreme",
    "strategies": ["reasoning", "creativity"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "enh_456",
    "original": { "content": "..." },
    "enhanced": {
      "improvements": [...],
      "score": 0.92
    },
    "analysis": {
      "complexity": 0.85,
      "domains": ["optimization", "problem-solving"]
    },
    "reasoning": {
      "methods": ["deductive", "analogical"],
      "chains": [...]
    },
    "processingTime": 250,
    "confidenceScore": 93.2
  }
}
```

---

### Network Peers

List connected P2P peers.

```
GET /api/network/peers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "peers": [
      {
        "id": "peer_1",
        "address": "/ip4/1.2.3.4/tcp/9000",
        "capabilities": ["compute", "storage"],
        "reputation": 100
      }
    ]
  }
}
```

---

### State Sync

Get state snapshot for synchronization.

```
POST /api/state/sync
```

**Response:**
```json
{
  "success": true,
  "data": {
    "state": {
      "key1": { "value": "...", "timestamp": 123, "nodeId": "..." },
      "key2": { "value": "...", "timestamp": 456, "nodeId": "..." }
    },
    "vectorClock": {
      "node1": 10,
      "node2": 5
    },
    "nodeId": "abc123",
    "timestamp": 1234567890
  }
}
```

---

### Blockchain Record

Record an operation on the blockchain.

```
POST /api/blockchain/record
```

**Request Body:**
```json
{
  "operation": {
    "id": "op_789",
    "type": "ai_query",
    "data": { "query": "...", "result": "..." }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "block": 1234567,
    "operation": {
      "id": "op_789",
      "type": "ai_query",
      "timestamp": 1234567890,
      "hash": "abc123"
    }
  }
}
```

---

### AI Models

Get information about registered AI models.

```
GET /api/ai/models
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQueries": 100,
    "successfulQueries": 95,
    "failedQueries": 5,
    "averageResponseTime": 150,
    "registeredModels": 5,
    "models": [
      {
        "id": "genius-gpt",
        "type": "language",
        "status": "ready",
        "queriesProcessed": 50,
        "averageLatency": 120
      }
    ]
  }
}
```

---

### Statistics

Get comprehensive system statistics.

```
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "api": {
      "requests": 500,
      "errors": 5,
      "startTime": 1234567890
    },
    "core": { /* core stats */ },
    "ai": { /* AI orchestrator stats */ },
    "network": { /* P2P network stats */ },
    "state": { /* distributed state stats */ },
    "cognitive": { /* cognitive enhancer stats */ }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

Currently no rate limiting. Will be added in future versions.

## WebSocket Support

Coming soon for real-time updates.

## Examples

### cURL Example

```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "content": "Explain AI",
      "complexity": "medium"
    }
  }'
```

### JavaScript Example

```javascript
const response = await fetch('http://localhost:3000/api/ai/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: {
      content: 'Explain AI',
      complexity: 'medium'
    }
  })
});

const data = await response.json();
console.log(data);
```

### Python Example

```python
import requests

response = requests.post('http://localhost:3000/api/ai/query', json={
    'query': {
        'content': 'Explain AI',
        'complexity': 'medium'
    }
})

data = response.json()
print(data)
```
