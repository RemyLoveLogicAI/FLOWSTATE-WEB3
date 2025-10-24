# 🎤 FlowState AI Voice MCP

**Easy Voice Integration for IDEs and CLI**

Add powerful voice capabilities to your development workflow with Model Context Protocol (MCP). Transcribe audio, generate speech, detect languages, and clone voices - all from your favorite IDE or command line!

---

## 🌟 Features

### 🎙️ Voice Transcription
- **Whisper AI** - Industry-leading speech-to-text
- **Multi-language** - Supports 50+ languages
- **High accuracy** - Professional-grade transcription
- **Auto-detect** - Automatic language detection

### 🔊 Text-to-Speech
- **Natural voices** - 6 high-quality voices
- **Speed control** - Adjust 0.25x to 4.0x
- **Multiple providers** - OpenAI + ElevenLabs
- **Streaming** - Real-time audio generation

### 🌐 Language Detection
- **AI-powered** - Detect spoken language
- **50+ languages** - Wide language support
- **High accuracy** - Reliable detection

### 🎭 Voice Cloning
- **Custom voices** - Clone any voice
- **ElevenLabs** - Professional quality
- **Few samples** - Just 3-5 audio clips needed

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to MCP directory
cd mcp

# Run installation script
chmod +x install.sh
./install.sh

# Or on Windows
.\install.ps1
```

### Manual Installation

```bash
# Install dependencies
npm install

# Build the server
npm run build
```

### Set Up API Keys

Create a `.env` file in the MCP directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key  # Optional
```

---

## 💻 IDE Integration

### Claude Desktop

1. Open Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the FlowState Voice MCP server:

```json
{
  "mcpServers": {
    "flowstate-voice": {
      "command": "node",
      "args": [
        "/absolute/path/to/flowstate-ai-web3/mcp/server/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
        "ELEVENLABS_API_KEY": "your-elevenlabs-api-key"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. Voice tools will appear in the MCP tools panel!

### VSCode

1. Install the MCP extension (if available)

2. Add to your `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "flowstate-voice": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/server/index.js"],
      "env": {
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}",
        "ELEVENLABS_API_KEY": "${env:ELEVENLABS_API_KEY}"
      }
    }
  }
}
```

3. Reload VSCode

### Cursor

1. Open Cursor settings (Cmd/Ctrl + ,)

2. Search for "MCP" or add to `settings.json`:

```json
{
  "cursor.mcp.servers": {
    "flowstate-voice": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp/server/index.js"],
      "env": {
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}",
        "ELEVENLABS_API_KEY": "${env:ELEVENLABS_API_KEY}"
      }
    }
  }
}
```

3. Restart Cursor

---

## 🖥️ CLI Usage

### Interactive Mode

The easiest way to get started:

```bash
npm run cli interactive
```

This opens an interactive menu where you can:
- 🎤 Transcribe audio files
- 🔊 Generate speech from text
- 📋 List available voices
- 🌐 Detect audio language

### Command-Line Mode

#### Transcribe Audio

```bash
# Basic transcription
npm run cli transcribe audio.mp3

# Specify language
npm run cli transcribe audio.mp3 -l es

# Save to file
npm run cli transcribe audio.mp3 -o transcript.txt
```

#### Generate Speech

```bash
# Basic TTS
npm run cli speak "Hello, world!" -o hello.mp3

# Choose voice
npm run cli speak "Hello!" -v nova -o hello.mp3

# Adjust speed
npm run cli speak "Fast speech" -s 1.5 -o fast.mp3
```

#### List Voices

```bash
npm run cli voices
```

Output:
```
📋 Available Voices:

  alloy
    Gender: neutral
    Style: balanced
    Provider: openai

  echo
    Gender: male
    Style: professional
    Provider: openai

  ...
```

#### Detect Language

```bash
npm run cli detect audio.mp3
```

---

## 🛠️ MCP Tools Reference

### voice_transcribe

Transcribe audio to text using Whisper AI.

**Parameters:**
- `audioPath` (string, required) - Path to audio file
- `language` (string, optional) - Language code (e.g., "en", "es")

**Example:**
```json
{
  "audioPath": "/path/to/audio.mp3",
  "language": "en"
}
```

### voice_synthesize

Convert text to speech with natural voices.

**Parameters:**
- `text` (string, required) - Text to convert
- `outputPath` (string, required) - Where to save audio
- `voice` (string, optional) - Voice name (default: "alloy")
- `speed` (number, optional) - Speech speed 0.25-4.0 (default: 1.0)

**Example:**
```json
{
  "text": "Hello, world!",
  "outputPath": "/path/to/output.mp3",
  "voice": "nova",
  "speed": 1.2
}
```

### voice_list

List all available voices with their characteristics.

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "voices": [
    {
      "id": "alloy",
      "provider": "openai",
      "gender": "neutral",
      "style": "balanced"
    }
  ]
}
```

### voice_detect_language

Detect the language of spoken audio.

**Parameters:**
- `audioPath` (string, required) - Path to audio file

**Example:**
```json
{
  "audioPath": "/path/to/audio.mp3"
}
```

### voice_clone

Clone a voice from audio samples (requires ElevenLabs).

**Parameters:**
- `name` (string, required) - Name for cloned voice
- `samplePaths` (array, required) - Paths to 3+ audio samples
- `description` (string, optional) - Voice description

**Example:**
```json
{
  "name": "My Custom Voice",
  "samplePaths": [
    "/path/to/sample1.mp3",
    "/path/to/sample2.mp3",
    "/path/to/sample3.mp3"
  ],
  "description": "A professional female voice"
}
```

---

## 🎯 Use Cases

### For Developers

- **Code reviews** - Transcribe verbal code reviews
- **Documentation** - Generate audio documentation
- **Accessibility** - Add voice to your apps
- **Testing** - Test voice interfaces

### For Content Creators

- **Transcription** - Convert audio to text
- **Voiceovers** - Generate narration
- **Localization** - Multi-language support
- **Podcasts** - Audio processing

### For Productivity

- **Meeting notes** - Transcribe meetings
- **Voice memos** - Convert to text
- **Language learning** - Hear pronunciations
- **Dictation** - Voice-to-text workflow

---

## 🎨 Available Voices

| Voice | Gender | Style | Best For |
|-------|--------|-------|----------|
| **alloy** | Neutral | Balanced | General use |
| **echo** | Male | Professional | Business |
| **fable** | Neutral | Storytelling | Narration |
| **onyx** | Male | Deep | Audiobooks |
| **nova** | Female | Energetic | Content |
| **shimmer** | Female | Warm | Personal |

---

## 🔧 Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=sk-your-key-here

# Optional (for voice cloning)
ELEVENLABS_API_KEY=your-key-here
```

### Advanced Configuration

Create `mcp/config/settings.json`:

```json
{
  "defaultVoice": "alloy",
  "defaultSpeed": 1.0,
  "defaultLanguage": "en",
  "outputDirectory": "./audio-output",
  "maxFileSizeMB": 25
}
```

---

## 📊 API Costs

### OpenAI Pricing
- **Whisper** (transcription): $0.006 per minute
- **TTS** (text-to-speech): $0.015 per 1K characters

### ElevenLabs Pricing
- **TTS**: Free tier available
- **Voice cloning**: Professional plan required

---

## 🐛 Troubleshooting

### "API key not found"
- Check your `.env` file is in the `mcp` directory
- Ensure `OPENAI_API_KEY` is set correctly
- Restart your IDE after setting environment variables

### "File not found"
- Use absolute paths for audio files
- Check file exists and is readable
- Verify file format is supported (mp3, mp4, wav, webm)

### "MCP server not appearing"
- Verify the path in your IDE config is absolute
- Check the server builds successfully (`npm run build`)
- Restart your IDE completely
- Check IDE error logs for details

### "Voice cloning failed"
- Requires ElevenLabs API key
- Need 3+ high-quality audio samples
- Each sample should be 10-30 seconds
- Samples should have clear, consistent voice

---

## 🚀 Advanced Usage

### Batch Transcription

```bash
# Transcribe multiple files
for file in *.mp3; do
  npm run cli transcribe "$file" -o "${file%.mp3}.txt"
done
```

### Custom Voice Pipeline

```bash
# 1. Clone a voice
npm run cli interactive
# Choose "Clone voice" and provide samples

# 2. Use the cloned voice ID
npm run cli speak "Test message" -v "your-voice-id" -o test.mp3
```

### Integration with Scripts

```typescript
import { VoiceService } from './src/services/voiceService';

const voice = new VoiceService();

// Transcribe
const text = await voice.transcribe(audioBuffer);

// Synthesize
const audio = await voice.synthesize("Hello!", "nova");
```

---

## 🤝 Contributing

We welcome contributions! This project is part of FlowState AI Web3.

---

## 📄 License

MIT License - See main project LICENSE file

---

## 🔗 Links

- [FlowState AI Web3](../README.md)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [OpenAI API](https://platform.openai.com/)
- [ElevenLabs](https://elevenlabs.io/)

---

**Built with 🎤 by the FlowState AI Team**

*Making voice AI accessible to everyone*
