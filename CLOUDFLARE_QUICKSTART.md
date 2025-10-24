# ☁️ Cloudflare Deployment - Quick Start

Deploy FlowState AI to Cloudflare's global edge network in **5 minutes**!

---

## 🚀 One-Command Deploy

```bash
# Install Wrangler (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy everything!
./cloudflare-deploy.sh
```

Choose option **3** (Full Stack) and you're done! 🎉

---

## ⚙️ What Gets Deployed

### ✅ Frontend (Cloudflare Pages)
- React app on global CDN
- URL: `https://flowstate-ai.pages.dev`
- FREE forever

### ✅ Backend (Cloudflare Workers)
- AI API on edge network
- URL: `https://flowstate-ai-backend.workers.dev`
- FREE tier: 100k requests/day

### ✅ Services
- **R2**: File storage
- **D1**: Database
- **KV**: Cache
- **Durable Objects**: WebSocket

---

## 🔑 Required: API Keys

Set these in Cloudflare dashboard after deployment:

### Minimum (Pick ONE)
```bash
# Option 1: Groq (RECOMMENDED - fastest)
GROQ_API_KEY=your_key_from_console.groq.com

# Option 2: Google Gemini (free tier)
GOOGLE_AI_API_KEY=your_key_from_makersuite.google.com

# Option 3: Together AI (free tier)
TOGETHER_API_KEY=your_key_from_api.together.xyz
```

### Set via Dashboard
1. Go to: https://dash.cloudflare.com
2. **Workers & Pages** → Your Worker
3. **Settings** → **Environment Variables**
4. Add your API key(s)

### Set via CLI
```bash
wrangler secret put GROQ_API_KEY
# Paste your key when prompted
```

---

## 📍 Your URLs

After deployment:

```
Frontend: https://flowstate-ai.pages.dev
Backend:  https://flowstate-ai-backend.workers.dev

Health Check: https://flowstate-ai-backend.workers.dev/health
```

---

## 🎯 Test It

```bash
# Test backend
curl https://flowstate-ai-backend.workers.dev/health

# Should return:
# {"status":"ok","worker":"flowstate-ai-backend"...}
```

Open frontend URL in browser and start chatting!

---

## 💰 Cost

**$0/month** for most usage!

Free tier includes:
- 100k Worker requests/day
- Unlimited Pages deployments
- 10GB R2 storage
- 5GB D1 database
- 100k KV reads/day

---

## 📚 Full Documentation

See `CLOUDFLARE_DEPLOYMENT.md` for:
- Custom domains
- Environment configuration
- Advanced features
- Monitoring & debugging
- Security best practices

---

## 🆘 Common Issues

### "No API keys configured"
→ Add at least one AI API key (see above)

### "Worker not found"
→ Run: `wrangler deploy`

### "CORS error"
→ Update allowed origins in `src/workers/index.ts`

---

## ✅ Success!

Your FlowState AI is now:
- ⚡ Running on global edge network
- 🌍 Available worldwide with low latency
- 💰 Costing $0/month
- 🚀 Auto-scaling to billions of requests
- 🔒 Secure with SSL

**Start using your AI assistant now!** 🎉

---

Need help? See full docs in `CLOUDFLARE_DEPLOYMENT.md`
