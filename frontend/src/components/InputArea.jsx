import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square, Volume2, VolumeX } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { VoiceVisualizer } from './VoiceVisualizer';

export function InputArea({ onSendMessage, disabled }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  
  const isListening = useChatStore((state) => state.isListening);
  const isSpeaking = useChatStore((state) => state.isSpeaking);
  const voiceSettings = useChatStore((state) => state.voiceSettings);
  const setListening = useChatStore((state) => state.setListening);
  const setSpeaking = useChatStore((state) => state.setSpeaking);
  const updateVoiceSettings = useChatStore((state) => state.updateVoiceSettings);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim());
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleListening = () => {
    setListening(!isListening);
  };

  const toggleSpeaking = () => {
    const newSpeaking = !isSpeaking;
    setSpeaking(newSpeaking);
    updateVoiceSettings({ autoSpeak: newSpeaking });
  };

  const handleVoiceInput = (text) => {
    setInput(text);
  };

  const handleVoiceFinal = (text) => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setInput('');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        {/* Voice Visualizer - shown when voice is enabled */}
        {voiceSettings.enabled && (
          <div className="mb-4">
            <VoiceVisualizer
              isListening={isListening}
              isSpeaking={isSpeaking}
              isPushToTalk={voiceSettings.pushToTalk}
              onToggleListening={toggleListening}
              onToggleSpeaking={toggleSpeaking}
              onTranscript={handleVoiceInput}
              onFinalTranscript={handleVoiceFinal}
            />
          </div>
        )}

        {/* Text Input Area */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening... Speak now'
                  : 'Type your message or use voice...'
              }
              disabled={disabled || isListening}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '52px', maxHeight: '200px' }}
            />
            
            {/* Voice toggle button inside textarea */}
            {voiceSettings.enabled && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={disabled}
                className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        {/* Voice controls footer */}
        {voiceSettings.enabled && (
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleSpeaking}
                className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {isSpeaking ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Auto-speak on</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Auto-speak off</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {isListening && (
                <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording
                </span>
              )}
              <span className="text-xs">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Shift+Enter</kbd> for new line
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
