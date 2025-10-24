

# 🚀 FlowState AI - Enhanced Features

## ⚡ What's New

This enhanced version combines the **best of ChatGPT, Claude, Gemini, and GenSpark** with **100% FREE AI models** and local model support!

---

## 🆓 FREE AI Models

### Cloud Models (No Cost!)

#### 1. **Groq** (⚡ Lightning Fast - RECOMMENDED)
- **Models**: Llama 3 70B, Mixtral 8x7B, Gemma 7B
- **Speed**: 500+ tokens/second
- **Free Tier**: Generous limits
- **Setup**: Get key at https://console.groq.com
- **Best For**: Everything! Fast responses, coding, reasoning

#### 2. **Together AI**
- **Models**: Llama 3 70B, Mixtral 8x22B
- **Free Tier**: 5M tokens/month
- **Setup**: https://api.together.xyz
- **Best For**: Long context, complex tasks

#### 3. **Google Gemini**
- **Models**: Gemini Pro (free)
- **Free Tier**: 60 requests/minute
- **Setup**: https://makersuite.google.com/app/apikey
- **Best For**: Multimodal tasks, vision

#### 4. **Hugging Face**
- **Models**: Zephyr 7B, many others
- **Free**: Inference API
- **Setup**: https://huggingface.co/settings/tokens
- **Best For**: Experimentation

### Local Models (100% Offline!)

#### **Ollama** (Recommended)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama3:8b        # General purpose
ollama pull mistral:7b       # Fast & efficient
ollama pull codellama:13b    # Code generation

# Models run on YOUR computer - no API, no cost, no internet needed!
```

#### **LM Studio** (GUI Option)
- Download: https://lmstudio.ai
- User-friendly interface
- Drag & drop model downloads
- Compatible with OpenAI API

---

## 🤖 GenSpark-Level Super Agent

### Complete Agent Suite Features

#### 1. **Multi-Step Reasoning (ReAct)**
```typescript
// Agent automatically breaks down complex queries
const result = await agent.executeAgent(
  "Research the latest in quantum computing and write a summary"
);

// Agent will:
// 1. Think about what information is needed
// 2. Use web search tool to gather data
// 3. Analyze and synthesize results
// 4. Provide comprehensive answer with sources
```

#### 2. **Built-in Tools**

##### **Web Search**
- Multi-source aggregation
- Real-time information
- Citation tracking

##### **Deep Research**
- Academic paper search
- News aggregation
- AI synthesis of findings

##### **Web Scraping**
- Extract content from any URL
- Smart content extraction
- CSS selector support

##### **Code Execution**
- Sandboxed JavaScript execution
- Safe environment (VM2)
- Console output capture

##### **Calculator**
- Mathematical expressions
- Complex calculations

##### **Text Analysis**
- Sentiment analysis
- Keyword extraction
- Automatic summarization

#### 3. **Agent Modes**

```typescript
// Full Agent (with tools)
const result = await agent.executeAgent(
  "Find the top 3 AI papers from 2024 and summarize them"
);

// Simple Agent (direct response)
const answer = await agent.simpleAgent(
  "Explain quantum entanglement"
);

// Chat Mode (conversational)
for await (const chunk of agent.chat("Hello!")) {
  console.log(chunk);
}
```

---

## 🎯 Smart Model Selection

### Automatic Fallback Cascade

The system automatically selects the best available model:

1. **First Choice**: Groq (if API key available) - Lightning fast
2. **Fallback**: Together AI / Gemini
3. **Local Backup**: Ollama / LM Studio
4. **Always Works**: At least one model will respond!

```typescript
// You don't have to choose - system picks the best!
const response = await orchestrator.streamResponse(messages);

// Or specify requirements
const model = await orchestrator.selectBestAvailableModel(query, {
  needsSpeed: true,
  needsCode: false,
  preferLocal: false,
});
```

---

## 🔍 Research Capabilities

### Multi-Source Research

```typescript
const research = await searchService.deepResearch(
  "Impact of AI on climate change research"
);

// Returns:
// - Web results
// - News articles  
// - Academic papers
// - AI-synthesized summary
// - Confidence score
// - All sources cited
```

### Features:
- ✅ Web search (Brave/Serper)
- ✅ News search
- ✅ Academic search (Semantic Scholar - free!)
- ✅ AI synthesis with citations
- ✅ Relevance ranking
- ✅ Confidence scoring

---

## 🎤 Voice Integration

### MCP Server

Voice capabilities via Model Context Protocol:

```bash
cd mcp
npm install
npm run build

# Use in Claude Desktop, VSCode, or Cursor!
```

### CLI Tool

```bash
# Interactive mode
npm run cli interactive

# Direct commands
npm run cli transcribe audio.mp3
npm run cli speak "Hello world" -o output.mp3
npm run cli voices
```

---

## 🌐 API Endpoints

### Chat & Streaming

```javascript
// WebSocket for real-time streaming
const socket = io('http://localhost:4000');

socket.emit('message', {
  conversationId: 'conv-123',
  message: 'Explain quantum computing',
  model: 'auto', // or specific model
  useSearch: true,
});

socket.on('assistant-token', ({ content }) => {
  console.log(content); // Real-time streaming!
});
```

### REST API

```bash
# List available models
GET /api/models

# Research endpoint
POST /api/research
{
  "query": "latest AI developments"
}

# Voice transcription
POST /api/voice/transcribe
Content-Type: multipart/form-data
audio: <file>

# Voice synthesis
POST /api/voice/synthesize
{
  "text": "Hello world",
  "voice": "alloy",
  "speed": 1.0
}
```

---

## 📦 Installation

### Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <repo>
cd flowstate-ai-web3
npm install

# 2. Set up free API keys
cp .env.enhanced.example .env

# Get FREE Groq key (30 seconds):
# Visit https://console.groq.com
# Sign up with Google
# Copy API key to .env

# 3. (Optional) Install Ollama for local models
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3:8b

# 4. Start!
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173

---

## 🎨 ChatGPT-Style UI

### Features:
- ✨ Beautiful, modern interface
- 💬 Real-time streaming responses
- 🎨 Syntax highlighting for code
- 📎 File upload support
- 🎤 Voice input/output
- 🔍 Research mode toggle
- 📊 Model selection
- 💾 Conversation history
- 🌓 Dark/light mode

---

## 🔧 Configuration

### Minimal Setup (Just Groq)

```env
GROQ_API_KEY=your_key_here
PORT=4000
```

That's it! Works with just one free API key!

### Full Setup (All Features)

```env
# Free Cloud Models (pick any/all)
GROQ_API_KEY=your_groq_key
TOGETHER_API_KEY=your_together_key
GOOGLE_AI_API_KEY=your_gemini_key

# Free Research APIs
BRAVE_SEARCH_API_KEY=your_brave_key
SERPER_API_KEY=your_serper_key

# Local Models (optional)
OLLAMA_ENDPOINT=http://localhost:11434

# Enable features
ENABLE_RESEARCH=true
ENABLE_CODE_EXECUTION=true
ENABLE_WEB_SCRAPING=true
```

---

## 🎯 Use Cases

### 1. **Research Assistant**
```
Query: "Research the latest developments in quantum computing 
        and provide a detailed summary with sources"

Agent will:
- Search multiple sources
- Find academic papers
- Aggregate news
- Synthesize findings
- Cite all sources
```

### 2. **Code Helper**
```
Query: "Write a Python function to find prime numbers, 
        explain it, and test with examples"

Agent will:
- Write the code
- Execute and test it
- Explain the logic
- Show output
```

### 3. **Content Analysis**
```
Query: "Scrape https://example.com and analyze the 
        sentiment of all article titles"

Agent will:
- Scrape the website
- Extract titles
- Analyze sentiment
- Provide insights
```

### 4. **Multi-Source Verification**
```
Query: "Fact-check: 'AI will replace all jobs by 2030'"

Agent will:
- Search multiple sources
- Find expert opinions
- Compare perspectives
- Give evidence-based verdict
```

---

## 📊 Performance

### Model Speeds (tokens/second)

| Model | Speed | Cost | Quality |
|-------|-------|------|---------|
| Groq Llama 3 70B | 500+ | FREE | ⭐⭐⭐⭐⭐ |
| Groq Mixtral 8x7B | 450+ | FREE | ⭐⭐⭐⭐ |
| Together Llama 3 | 100+ | FREE | ⭐⭐⭐⭐⭐ |
| Gemini Pro | 50+ | FREE | ⭐⭐⭐⭐ |
| Ollama (local) | 20-50 | FREE | ⭐⭐⭐⭐ |

All FREE! No credit card needed for any of them!

---

## 🛠️ Advanced Usage

### Custom Tools

```typescript
// Register your own tools
agent.registerTool({
  name: 'my_custom_tool',
  description: 'Does something amazing',
  parameters: {
    input: 'string - what to process',
  },
  execute: async ({ input }) => {
    // Your logic here
    return { result: 'processed!' };
  },
});
```

### Agent Configuration

```typescript
const agent = new SuperAgentSuite();

// Execute with options
const result = await agent.executeAgent(query, {
  maxSteps: 15,          // Max reasoning steps
  timeout: 120000,       // 2 minute timeout
  preferLocal: true,     // Prefer local models
  enabledTools: ['web_search', 'calculator'],
});
```

---

## 🎓 Examples

See `/examples` folder for:
- Research scripts
- Code execution demos
- Web scraping examples
- Multi-modal processing
- Custom tool creation

---

## 🤝 Contributing

We welcome contributions! Areas to help:
- [ ] Add more tools to agent
- [ ] Improve web scraping
- [ ] Add Python code execution
- [ ] Enhance UI components
- [ ] Write more examples
- [ ] Improve documentation

---

## 📄 License

MIT License - Build freely!

---

## 🔗 Resources

### Free API Keys
- **Groq**: https://console.groq.com (RECOMMENDED)
- **Together AI**: https://api.together.xyz
- **Google Gemini**: https://makersuite.google.com/app/apikey
- **Hugging Face**: https://huggingface.co/settings/tokens
- **Brave Search**: https://brave.com/search/api/
- **Serper**: https://serper.dev

### Local Models
- **Ollama**: https://ollama.ai
- **LM Studio**: https://lmstudio.ai

### Documentation
- **MCP Protocol**: https://modelcontextprotocol.io
- **Agent Patterns**: /docs/agent-patterns.md
- **API Reference**: /docs/api.md

---

**Built with 🧠 and ⚡ by the FlowState AI Team**

*Free AI for Everyone!*
