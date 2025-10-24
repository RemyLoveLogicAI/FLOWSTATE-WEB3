# 🚀 FlowState AI Supreme - Quick Start Guide

Get your decentralized genius-level AI platform running in minutes!

## ⚡ Instant Start (Development)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 3-Step Launch

```bash
# 1. Install dependencies
npm install

# 2. Start the platform
npm start

# 3. In another terminal, start the frontend
cd frontend && npm install && npm run dev
```

**That's it!** Your platform is now running:
- 🌐 **Backend API**: http://localhost:3000
- 🎨 **Frontend Dashboard**: http://localhost:8080
- 🔗 **P2P Network**: Port 9000

## 🎯 First Query

### Using the Frontend
1. Open http://localhost:8080 in your browser
2. Enter a query like: "Explain quantum computing with supreme cognitive analysis"
3. Click "Process with Supreme AI"
4. Watch the genius-level response!

### Using cURL
```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "content": "Optimize this algorithm for performance",
      "complexity": "high"
    }
  }'
```

### Using JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/ai/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: {
      content: 'Analyze this data pattern',
      complexity: 'high'
    }
  })
});

const result = await response.json();
console.log(result);
```

## 🐳 Docker Quick Start

```bash
# Build and start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access the same URLs as above!

## 🧪 Test the Features

### 1. Check System Status
```bash
curl http://localhost:3000/api/status
```

### 2. Test Cognitive Enhancement
```bash
curl -X POST http://localhost:3000/api/cognitive/enhance \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "content": "Solve complex problem X"
    }
  }'
```

### 3. View AI Models
```bash
curl http://localhost:3000/api/ai/models
```

### 4. Get Statistics
```bash
curl http://localhost:3000/api/stats
```

## 🌐 Setting Up a Multi-Node Network

### Node 1 (Bootstrap)
```bash
PORT=3000 P2P_PORT=9000 npm start
```

### Node 2 (Worker)
```bash
PORT=3001 P2P_PORT=9001 BOOTSTRAP_PEERS=/ip4/127.0.0.1/tcp/9000 npm start
```

### Node 3 (Worker)
```bash
PORT=3002 P2P_PORT=9002 BOOTSTRAP_PEERS=/ip4/127.0.0.1/tcp/9000 npm start
```

## 📊 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/status` | GET | System status |
| `/api/ai/query` | POST | Submit AI query |
| `/api/cognitive/enhance` | POST | Cognitive enhancement |
| `/api/network/peers` | GET | List peers |
| `/api/state/sync` | POST | State sync |
| `/api/blockchain/record` | POST | Record on blockchain |
| `/api/ai/models` | GET | AI models info |
| `/api/stats` | GET | All statistics |

## 🧠 AI Models Available

1. **Genius GPT** - General reasoning and text generation
2. **Cognitive Enhancer** - Meta-learning and optimization
3. **Vision Supreme** - Image analysis and pattern recognition
4. **Quantum Reasoner** - Quantum-inspired algorithms
5. **Neural Architect** - Architecture search and AutoML

## 🎨 Features You Can Try

### Distributed Queries
The system automatically distributes complex queries across available peer nodes.

### Cognitive Enhancement
Apply supreme-level cognitive capabilities to any input:
- Multiple reasoning strategies
- Meta-learning
- Creative synthesis
- Automatic optimization

### Blockchain Recording
All operations can be recorded on blockchain for immutability.

### Real-time State Sync
State is automatically synchronized across all nodes using CRDTs.

## ⚙️ Configuration

Create a `.env` file for custom configuration:

```env
# Server
PORT=3000
HOST=0.0.0.0

# P2P Network
P2P_PORT=9000
BOOTSTRAP_PEERS=/ip4/node1.example.com/tcp/9000

# AI Settings
MAX_CONCURRENT_MODELS=10
COGNITIVE_ENHANCEMENT_LEVEL=supreme
MODEL_CACHE_SIZE=1000

# State Management
STATE_SYNC_INTERVAL=5000

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
CONTRACT_ADDRESS=0x...
```

## 🔍 Monitoring

### Check Backend Logs
```bash
# If running normally
tail -f logs/app.log

# If using Docker
docker-compose logs -f flowstate-ai-supreme
```

### Monitor Performance
Open the frontend dashboard at http://localhost:8080 to see:
- Real-time system status
- Active peers count
- Queries processed
- Performance metrics

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Change the port in .env
PORT=3001

# Or kill the process
lsof -i :3000
kill -9 <PID>
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### P2P Connection Issues
- Check firewall settings
- Verify bootstrap peer addresses
- Ensure ports are not blocked

## 📚 Next Steps

1. **Read the Architecture**: `docs/ARCHITECTURE.md`
2. **Explore the API**: `docs/API.md`
3. **Deploy to Production**: `docs/DEPLOYMENT.md`

## 💡 Pro Tips

- Use Ctrl+Enter in the frontend to submit queries quickly
- Set `complexity: "high"` for distributed processing
- Monitor `/api/stats` for performance insights
- Join multiple nodes for true decentralization

## 🎉 You're Ready!

You now have a fully functional decentralized genius-level AI platform running!

Try asking it to:
- Solve complex problems
- Optimize algorithms
- Analyze patterns
- Generate creative solutions
- Make strategic decisions

**The sky is the limit with FlowState AI Supreme! 🚀**
