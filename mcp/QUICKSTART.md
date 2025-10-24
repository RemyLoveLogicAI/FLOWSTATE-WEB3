# 🚀 FlowState Voice MCP - Quick Start Guide

Get up and running with voice capabilities in 5 minutes!

---

## Step 1: Install (1 minute)

```bash
cd mcp
chmod +x install.sh
./install.sh
```

On Windows:
```powershell
cd mcp
.\install.ps1
```

---

## Step 2: Set Up API Keys (1 minute)

Create `mcp/.env`:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Get your key: https://platform.openai.com/api-keys

---

## Step 3: Test CLI (1 minute)

```bash
# Try interactive mode
npm run cli interactive

# Or test a quick command
echo "Hello from FlowState!" > test.txt
npm run cli speak "$(cat test.txt)" -o hello.mp3
```

---

## Step 4: Add to Claude Desktop (2 minutes)

### macOS
```bash
# Open config file
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Windows
```powershell
# Open config file
notepad $env:APPDATA\Claude\claude_desktop_config.json
```

### Add this configuration:

```json
{
  "mcpServers": {
    "flowstate-voice": {
      "command": "node",
      "args": [
        "/FULL/PATH/TO/flowstate-ai-web3/mcp/server/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-your-actual-key"
      }
    }
  }
}
```

**Important:** Replace `/FULL/PATH/TO/` with your actual absolute path!

---

## Step 5: Use It! ✨

### In Claude Desktop

After restarting Claude Desktop, you can:

```
"Transcribe the audio file at /path/to/recording.mp3"

"Generate speech saying 'Welcome to FlowState' and save it to welcome.mp3"

"List all available voices"

"Detect the language of audio.mp3"
```

### In CLI

```bash
# Transcribe
npm run cli transcribe recording.mp3

# Generate speech
npm run cli speak "Your text here" -o output.mp3

# Choose different voice
npm run cli speak "Hello" -v nova -o hello.mp3

# Faster speech
npm run cli speak "Fast!" -s 1.5 -o fast.mp3
```

---

## 🎯 Common Commands

### Transcription
```bash
# Basic
npm run cli transcribe audio.mp3

# Spanish audio
npm run cli transcribe audio.mp3 -l es

# Save transcript
npm run cli transcribe audio.mp3 -o transcript.txt
```

### Text-to-Speech
```bash
# Default voice (alloy)
npm run cli speak "Hello world" -o hello.mp3

# Female voice (nova)
npm run cli speak "Hello" -v nova -o hello.mp3

# Male voice (echo)
npm run cli speak "Hello" -v echo -o hello.mp3

# Slow down
npm run cli speak "Slow" -s 0.75 -o slow.mp3

# Speed up
npm run cli speak "Fast" -s 1.5 -o fast.mp3
```

### Utilities
```bash
# List voices
npm run cli voices

# Detect language
npm run cli detect audio.mp3

# Interactive mode (easiest!)
npm run cli interactive
```

---

## 🆘 Troubleshooting

### "Command not found: node"
Install Node.js 18+ from https://nodejs.org/

### "API key not found"
- Make sure `.env` file is in the `mcp` directory
- Check the key starts with `sk-`
- No quotes needed in `.env` file

### "MCP server not showing in Claude"
1. Check the path is **absolute** (not relative)
2. Path should end with `/mcp/server/index.js`
3. Restart Claude Desktop completely
4. Check Claude logs for errors

### "Permission denied"
```bash
chmod +x install.sh
chmod +x mcp/server/index.js
```

---

## 🎓 Next Steps

1. **Read the full docs**: [README.md](./README.md)
2. **Try all voices**: `npm run cli voices`
3. **Explore IDE integration**: VSCode, Cursor
4. **Join the community**: Discord (coming soon)

---

## 💡 Pro Tips

1. **Use interactive mode** when learning: `npm run cli interactive`
2. **Batch process files** with shell scripts
3. **Chain commands** for complex workflows
4. **Set aliases** in your shell:
   ```bash
   alias transcribe="npm run cli transcribe"
   alias speak="npm run cli speak"
   ```

---

**Need help?** Open an issue or check the full documentation!

🎤 Happy voice coding!
