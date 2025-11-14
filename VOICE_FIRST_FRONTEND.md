# 🎤 FlowState AI - Voice-First Frontend

## Overview

A production-ready, voice-first AI chat interface with ChatGPT-level UI/UX quality. Built with React, Vite, and Web Speech API for seamless voice interaction.

## ✨ Key Features

### 🗣️ Voice Interaction
- **Speech Recognition**: Real-time voice-to-text using Web Speech API
- **Text-to-Speech**: AI responses spoken aloud automatically
- **Voice Visualizer**: Animated waveform showing audio activity
- **Continuous Listening**: Always-on voice detection mode
- **Push-to-Talk**: Manual voice activation option
- **Multi-language**: Support for multiple languages and accents
- **Voice Settings**: Customizable rate, pitch, volume, and voice

### 🎨 Modern UI/UX
- **ChatGPT-Style Interface**: Clean, professional design
- **Dark/Light Themes**: Full theme support with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion for polished interactions
- **Markdown Rendering**: Full GFM support with code highlighting
- **Copy to Clipboard**: One-click code copying

### 💬 Chat Features
- **Real-time Streaming**: SSE for streaming AI responses
- **Conversation History**: Persistent chat storage
- **Multiple Conversations**: Create, switch, and delete chats
- **Search**: Quick conversation search
- **Message Timestamps**: Relative time display
- **Model Selection**: Choose from multiple AI models

## 🛠️ Tech Stack

- **React 18**: Latest React with hooks
- **Vite**: Lightning-fast build tool
- **Zustand**: Simple state management with persistence
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **React Markdown**: Markdown rendering
- **React Syntax Highlighter**: Code syntax highlighting
- **Lucide React**: Beautiful icon library
- **Web Speech API**: Browser-native voice capabilities

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.jsx      # Main chat orchestrator
│   │   ├── VoiceVisualizer.jsx    # Audio waveform animation
│   │   ├── MessageList.jsx        # Message container
│   │   ├── Message.jsx            # Individual message
│   │   ├── InputArea.jsx          # Voice + text input
│   │   ├── Sidebar.jsx            # Conversation history
│   │   ├── Header.jsx             # Top navigation
│   │   ├── ModelSelector.jsx      # AI model picker
│   │   └── ThemeProvider.jsx      # Theme management
│   ├── hooks/
│   │   ├── useChat.js             # Chat logic
│   │   └── useConversations.js    # Conversation management
│   ├── services/
│   │   ├── api.js                 # Backend API
│   │   └── voiceService.js        # Voice capabilities
│   ├── store/
│   │   └── chatStore.js           # Zustand state
│   ├── utils/
│   │   ├── helpers.js             # Utility functions
│   │   └── markdown.js            # Markdown utilities
│   ├── styles/
│   │   ├── globals.css            # Global styles
│   │   └── index.css              # Tailwind config
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # Entry point
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
└── package.json                   # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser with Web Speech API support

### Installation

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
```bash
# Create .env file
echo "VITE_API_URL=https://flowstate-ai-backend.jmjones925.workers.dev" > .env
```

3. **Start development server**:
```bash
npm run dev
```

4. **Build for production**:
```bash
npm run build
```

5. **Preview production build**:
```bash
npm run preview
```

## 🎮 Usage

### Voice Interaction

1. **Enable Voice**: Click the microphone button or enable voice in settings
2. **Start Speaking**: Click the mic button or use continuous listening mode
3. **Stop Speaking**: Click the stop button
4. **Auto-Speak**: Toggle to have AI responses spoken aloud
5. **Voice Settings**: Adjust rate, pitch, volume, and language

### Text Interaction

1. **Type Message**: Use the input area at the bottom
2. **Send**: Press Enter or click Send button
3. **Multi-line**: Press Shift+Enter for new line

### Conversation Management

1. **New Chat**: Click "New Chat" in sidebar
2. **Switch Chat**: Click on conversation in sidebar
3. **Search**: Use search box to find conversations
4. **Delete**: Hover and click delete icon

### Theme & Settings

1. **Theme Toggle**: Click sun/moon icon in header
2. **Model Selection**: Choose AI model from dropdown
3. **Settings**: Click settings icon for more options

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=https://your-backend-url.workers.dev
```

### Voice Settings

Configure in `src/store/chatStore.js`:
```javascript
voiceSettings: {
  enabled: true,
  autoSpeak: true,
  voice: 'default',
  rate: 1.0,      // 0.1 to 10
  pitch: 1.0,     // 0 to 2
  volume: 1.0,    // 0 to 1
  language: 'en-US',
  pushToTalk: false,
}
```

### Theme Customization

Modify `tailwind.config.js` for custom colors and theme settings.

## 📊 Components

### ChatInterface
Main orchestrator that combines all components and manages the chat flow.

**Props**: None (uses hooks for state)

**Features**:
- Handles voice and text input
- Manages streaming responses
- Coordinates all child components

### VoiceVisualizer
Animated waveform display showing audio activity.

**Props**:
- `isListening` (boolean): Whether recording audio
- `isSpeaking` (boolean): Whether speaking audio
- `isPushToTalk` (boolean): Push-to-talk mode
- `onToggleListening` (function): Toggle listening
- `onToggleSpeaking` (function): Toggle speaking
- `onTranscript` (function): Transcript callback
- `onFinalTranscript` (function): Final transcript callback

### MessageList
Scrollable container displaying conversation messages.

**Props**:
- `messages` (array): Array of message objects
- `isLoading` (boolean): Loading state

### Message
Individual message with markdown rendering and code highlighting.

**Props**:
- `message` (object): Message data
  - `id`: Unique identifier
  - `role`: 'user' or 'assistant'
  - `content`: Message text
  - `timestamp`: ISO timestamp
  - `isStreaming`: Boolean for streaming state

### InputArea
Voice-first input with text fallback.

**Props**:
- `onSendMessage` (function): Send message callback
- `disabled` (boolean): Disable input

### Sidebar
Conversation history with search and management.

**Props**:
- `isOpen` (boolean): Sidebar visibility
- `onClose` (function): Close callback

## 🔌 Services

### voiceService
Singleton service for voice capabilities.

**Methods**:
- `startListening(onTranscript, onFinal, onError)`: Start speech recognition
- `stopListening()`: Stop speech recognition
- `speak(text, options)`: Text-to-speech
- `stopSpeaking()`: Cancel TTS
- `setPushToTalk(enabled)`: Toggle push-to-talk
- `setLanguage(lang)`: Change recognition language
- `getVoices()`: Get available TTS voices

### api
Backend communication service.

**Methods**:
- `fetchModels()`: Get available AI models
- `sendChatMessage(message, onChunk, options)`: Send chat message with streaming

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm run test:frontend
```

### Test Coverage
- 60+ E2E tests with Playwright
- Build validation
- Performance benchmarking
- Accessibility testing (WCAG 2.1 AA)
- 7 browser support

## 🎨 Styling

### Tailwind Classes
The project uses Tailwind CSS for styling. Key utility classes:

- **Colors**: `bg-gray-50`, `dark:bg-gray-900`
- **Spacing**: `p-4`, `m-2`, `gap-2`
- **Layout**: `flex`, `grid`, `relative`
- **Typography**: `text-sm`, `font-bold`
- **Effects**: `hover:`, `focus:`, `transition-colors`

### Custom CSS
Custom styles in `src/styles/globals.css`:
- Message animations
- Typing indicators
- Code block styling
- Markdown content
- Gradient effects
- Glass morphism

## 🚀 Deployment

### Build
```bash
npm run build
```

Output: `dist/` directory

### Deploy to Cloudflare Pages
```bash
wrangler pages deploy dist
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

## 📱 Browser Support

- ✅ Chrome 25+
- ✅ Firefox 75+
- ✅ Safari 14.1+
- ✅ Edge 79+
- ✅ Opera 27+
- ✅ Chrome Android 112+
- ✅ Safari iOS 14.5+

## 🔒 Security

- Input sanitization
- XSS prevention in markdown
- Secure API communication
- Environment variable protection
- No sensitive data in localStorage

## 🎯 Performance

- **Bundle Size**: ~988KB (gzipped: ~338KB)
- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: Ready for long conversations

## 🐛 Known Issues

1. **Web Speech API**: Not supported in Firefox on macOS
2. **Voice Synthesis**: Voices load asynchronously
3. **Mobile**: Some browsers require user gesture for audio

## 🔮 Future Enhancements

- [ ] Voice Activity Detection (VAD)
- [ ] Voice commands (e.g., "New chat", "Clear messages")
- [ ] Keyboard shortcuts
- [ ] Export conversations (PDF, JSON, Markdown)
- [ ] Voice settings panel
- [ ] Analytics integration
- [ ] Offline support with service workers
- [ ] Multi-user support
- [ ] Conversation sharing

## 📝 License

MIT License - See LICENSE file

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🙏 Acknowledgments

- Web Speech API
- ChatGPT for UI/UX inspiration
- React team
- Vite team
- Tailwind CSS team
- All open-source contributors

## 📞 Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/RemyLoveLogicAI/FLOWSTATE-WEB3/issues
- Pull Requests: https://github.com/RemyLoveLogicAI/FLOWSTATE-WEB3/pulls

---

**Built with ❤️ by the FlowState AI Team**
