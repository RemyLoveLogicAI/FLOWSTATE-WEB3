# 🚀 Get Your Free Groq API Key (2 Minutes)

## Why Groq?

- ⚡ **500+ tokens/second** (fastest free AI)
- 🆓 **Completely free** (no credit card)
- 🎯 **Best models**: Llama 3 70B, Mixtral 8x7B
- 🚀 **Instant responses** (no cold start)
- 💪 **Unlimited requests** (within rate limits)

---

## Step-by-Step Guide

### 1. Visit Groq Console
🔗 **https://console.groq.com**

### 2. Sign Up (Free)
- Click "Sign Up" or "Get Started"
- Use GitHub, Google, or Email
- No credit card required!

### 3. Create API Key
1. Go to "API Keys" section
2. Click "Create API Key"
3. Give it a name: "FlowState AI"
4. Copy the key (starts with `gsk_`)

### 4. Add to Your Worker
```bash
cd /home/user/webapp
echo "YOUR_GROQ_KEY_HERE" | npx wrangler secret put GROQ_API_KEY
```

**That's it!** Your worker will automatically use Groq.

---

## What You'll Get

### Before (HuggingFace only)
- Speed: Medium (30-60 tokens/sec)
- Cold start: 10-30 seconds
- Models: 1 (Zephyr 7B)

### After (With Groq)
- Speed: ⚡ **BLAZING** (500+ tokens/sec)
- Cold start: **Instant**
- Models: 4 (Llama 3 70B, Mixtral 8x7B, Gemma 7B, Zephyr 7B)

---

## Example Performance

**HuggingFace Response Time**: 5-10 seconds  
**Groq Response Time**: **0.5-1 second** 🚀

**10x FASTER!**

---

## Alternative: Together AI

If you prefer Together AI:

🔗 **https://api.together.xyz**

- 🆓 **5M tokens/month free**
- ⚡ Fast (100-200 tokens/sec)
- 🤖 Many models available

---

## Once You Have Your Key

I'll add it to your worker and you'll see:

```json
{
  "models": [
    "Llama 3 70B (Groq)",      ← NEW
    "Mixtral 8x7B (Groq)",     ← NEW
    "Gemma 7B (Groq)",         ← NEW
    "Zephyr 7B (HuggingFace)"
  ]
}
```

**Ready to add your Groq key?** Just paste it and I'll configure everything!
