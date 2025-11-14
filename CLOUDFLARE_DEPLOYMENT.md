# ☁️ FlowState AI - Cloudflare Deployment Guide

Complete guide to deploy FlowState AI on Cloudflare's edge network!

---

## 🎯 What You'll Deploy

### Frontend (Cloudflare Pages)
- ⚡ React + Vite application
- 🌍 Global CDN distribution
- 🚀 Instant deployments
- 🆓 Free tier available

### Backend (Cloudflare Workers)
- 🤖 AI orchestration API
- 💬 WebSocket support (Durable Objects)
- 📦 R2 file storage
- 🗄️ D1 database
- 🔑 KV cache

---

## 📋 Prerequisites

### 1. Cloudflare Account
```bash
# Sign up at: https://dash.cloudflare.com/sign-up
# Free tier is sufficient to start!
```

### 2. Wrangler CLI
```bash
# Install globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 3. Free API Keys
Get at least ONE of these (all free!):
- **Groq**: https://console.groq.com (RECOMMENDED)
- **Together AI**: https://api.together.xyz
- **Google Gemini**: https://makersuite.google.com/app/apikey

---

## 🚀 Quick Deploy (5 Minutes)

### Option 1: Automated Script

```bash
# Run the deployment script
./cloudflare-deploy.sh

# Follow the prompts:
# 1 = Backend only
# 2 = Frontend only
# 3 = Full stack (recommended)
# 4 = Staging environment
```

### Option 2: Manual Deployment

#### Step 1: Deploy Backend Worker
```bash
# Build the worker
npm run build:worker

# Deploy to Cloudflare
wrangler deploy

# Your API will be live at:
# https://flowstate-ai-backend.YOUR_SUBDOMAIN.workers.dev
```

#### Step 2: Deploy Frontend
```bash
cd frontend

# Build for production
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=flowstate-ai

# Your app will be live at:
# https://flowstate-ai.pages.dev
```

---

## ⚙️ Configuration

### 1. Set Environment Variables

#### Via Dashboard
1. Go to **Workers & Pages** in Cloudflare dashboard
2. Select your worker
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
# AI Models (Add at least ONE)
GROQ_API_KEY=gsk_your_groq_key_here
TOGETHER_API_KEY=your_together_key_here
GOOGLE_AI_API_KEY=your_gemini_key_here
HUGGINGFACE_API_KEY=hf_your_hf_key_here

# Search (Optional but recommended)
BRAVE_SEARCH_API_KEY=BSA_your_brave_key
SERPER_API_KEY=your_serper_key
TAVILY_API_KEY=tvly_your_tavily_key

# Voice (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_key
```

#### Via CLI
```bash
# Set secrets via wrangler
wrangler secret put GROQ_API_KEY
# Paste your key when prompted

wrangler secret put GOOGLE_AI_API_KEY
# Paste your key
```

### 2. Configure R2 Buckets (File Storage)

```bash
# Create R2 bucket for uploads
wrangler r2 bucket create flowstate-uploads

# Update wrangler.toml with bucket name
# (already configured in wrangler.toml)
```

### 3. Configure D1 Database

```bash
# Create D1 database
wrangler d1 create flowstate-db

# Copy the database ID from output
# Update wrangler.toml with the ID

# Run migrations
wrangler d1 execute flowstate-db --file=./schema.sql
```

### 4. Configure KV Namespace (Caching)

```bash
# Create KV namespace
wrangler kv:namespace create "CACHE"

# Copy the ID from output
# Update wrangler.toml with the ID
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Cloudflare Global Network              │
│                                                │
│  ┌──────────────┐         ┌─────────────────┐ │
│  │              │         │                 │ │
│  │   Frontend   │────────▶│  Backend API    │ │
│  │ (Pages)      │         │  (Workers)      │ │
│  │              │         │                 │ │
│  └──────────────┘         └─────────────────┘ │
│         │                          │          │
│         │                          ▼          │
│         │                  ┌───────────────┐  │
│         │                  │  Free AI APIs │  │
│         │                  │  - Groq       │  │
│         │                  │  - Together   │  │
│         │                  │  - Gemini     │  │
│         │                  └───────────────┘  │
│         │                                     │
│         ▼                                     │
│  ┌──────────────────────────────────────┐    │
│  │  Cloudflare Services                 │    │
│  │  • R2 (File Storage)                 │    │
│  │  • D1 (Database)                     │    │
│  │  • KV (Cache)                        │    │
│  │  • Durable Objects (WebSocket)       │    │
│  │  • Analytics Engine                  │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Advanced Configuration

### Custom Domain

#### For Frontend (Pages)
1. Go to **Pages** → **Your Project** → **Custom Domains**
2. Click **Set up a custom domain**
3. Enter: `flowstate.ai` or `app.yoursite.com`
4. Follow DNS configuration steps

#### For Backend (Workers)
1. Go to **Workers** → **Your Worker** → **Triggers**
2. Click **Add Custom Domain**
3. Enter: `api.flowstate.ai` or `api.yoursite.com`
4. Cloudflare handles SSL automatically!

### Environment-Based Deployment

```bash
# Production
wrangler deploy --env production

# Staging
wrangler deploy --env staging

# Development
wrangler dev
```

### Secrets Management

```bash
# List secrets
wrangler secret list

# Delete secret
wrangler secret delete SECRET_NAME

# Bulk import secrets
wrangler secret bulk path/to/secrets.json
```

---

## 💰 Cost Estimation

### Free Tier Limits (More than enough for most apps!)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Workers** | 100k req/day | $5/10M requests |
| **Pages** | Unlimited | Free forever |
| **R2 Storage** | 10GB | $0.015/GB/month |
| **D1 Database** | 5GB | $0.75/GB/month |
| **KV** | 100k reads/day | $0.50/1M reads |
| **Durable Objects** | Limited | $0.15/1M requests |

**Most projects stay in free tier!** 🎉

### FlowState AI Typical Usage
- Workers: ~10k requests/day = **FREE**
- Pages: Unlimited = **FREE**
- R2: ~1GB storage = **FREE**
- D1: ~100MB = **FREE**
- KV: ~50k reads/day = **FREE**

**Total Monthly Cost: $0** ✨

---

## 🧪 Testing Your Deployment

### Test Backend API

```bash
# Health check
curl https://YOUR_WORKER.workers.dev/health

# List models
curl https://YOUR_WORKER.workers.dev/api/models

# Chat request
curl -X POST https://YOUR_WORKER.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, FlowState!"}'
```

### Test Frontend

```bash
# Visit your Pages URL
open https://flowstate-ai.pages.dev

# Or your custom domain
open https://flowstate.ai
```

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Tail worker logs
wrangler tail

# Tail with filter
wrangler tail --format=pretty

# View logs in dashboard
# Workers & Pages → Your Worker → Logs
```

### Analytics

```bash
# View analytics
wrangler pages deployment list

# Check worker metrics
# Dashboard → Workers → Your Worker → Analytics
```

### Debug Mode

```bash
# Run locally for debugging
wrangler dev

# Test with local environment
wrangler dev --local

# Test with remote resources
wrangler dev --remote
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. **"No API keys configured"**
```bash
# Solution: Add at least one AI API key
wrangler secret put GROQ_API_KEY
```

#### 2. **"R2 bucket not found"**
```bash
# Solution: Create the bucket
wrangler r2 bucket create flowstate-uploads
```

#### 3. **"Database not found"**
```bash
# Solution: Create D1 database
wrangler d1 create flowstate-db
# Update database_id in wrangler.toml
```

#### 4. **"Module not found"**
```bash
# Solution: Rebuild worker
npm run build:worker
wrangler deploy
```

#### 5. **CORS errors**
```bash
# Solution: Check CORS config in worker
# Update allowed origins in src/workers/index.ts
```

---

## 📊 Performance Optimization

### 1. Enable Caching

```typescript
// Cache API responses
const cacheKey = `cache:${request.url}`;
const cached = await env.CACHE.get(cacheKey);

if (cached) {
  return new Response(cached);
}

// ... process request ...

await env.CACHE.put(cacheKey, response, {
  expirationTtl: 3600, // 1 hour
});
```

### 2. Use Smart Placement

```toml
# wrangler.toml
[placement]
mode = "smart"  # Routes to nearest data center
```

### 3. Optimize Bundle Size

```bash
# Analyze bundle
npm run build:worker -- --analyze

# Remove unused dependencies
npm prune --production
```

---

## 🔐 Security Best Practices

### 1. Rotate Secrets Regularly

```bash
# Update secret
wrangler secret put GROQ_API_KEY
```

### 2. Use Rate Limiting

```typescript
// In worker
const rateLimiter = new RateLimiter({
  limit: 100,
  window: 60, // per minute
});
```

### 3. Validate Inputs

```typescript
// Validate all user inputs
const schema = z.object({
  message: z.string().max(10000),
});

schema.parse(input);
```

---

## 📚 Additional Resources

### Cloudflare Documentation
- **Workers**: https://developers.cloudflare.com/workers
- **Pages**: https://developers.cloudflare.com/pages
- **R2**: https://developers.cloudflare.com/r2
- **D1**: https://developers.cloudflare.com/d1
- **Durable Objects**: https://developers.cloudflare.com/durable-objects

### FlowState AI Docs
- **Main Features**: `ENHANCED_FEATURES.md`
- **API Reference**: `API_DOCUMENTATION.md`
- **Deployment**: This file

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Frontend loads at Pages URL
- [ ] Backend API health check responds
- [ ] At least one AI model works
- [ ] File uploads work (if using R2)
- [ ] Environment variables are set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Logs are accessible
- [ ] Analytics tracking works

---

## 🚀 Deploy Now!

```bash
# One command to deploy everything
./cloudflare-deploy.sh

# Select option 3 (Full Stack)
# Done! 🎉
```

---

## 💬 Support

Need help?
- 📖 Read the docs
- 🐛 Open an issue
- 💬 Join Discord (coming soon)
- 📧 Email: support@flowstate.ai

---

**Deployed on Cloudflare's global network** ⚡
**Cost: $0/month** 💰
**Performance: Lightning fast** 🚀

*Happy deploying!* 🎉
