import { useEffect, useRef } from 'react';
import { Message } from './Message';
import { scrollToBottom } from '../utils/helpers';
import { Sparkles } from 'lucide-react';

export function MessageList({ messages, isLoading }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      scrollToBottom(containerRef.current);
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to FlowState AI
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start a conversation by typing a message or using voice input.
            I'm here to help with coding, writing, analysis, and more!
          </p>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
              <span className="font-medium text-gray-900 dark:text-white">
                🎤 Voice-First Interface
              </span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Click the microphone to speak naturally
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
              <span className="font-medium text-gray-900 dark:text-white">
                ⚡ Real-time Streaming
              </span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Get instant responses as they're generated
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
              <span className="font-medium text-gray-900 dark:text-white">
                🤖 Multiple AI Models
              </span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Choose from Llama, Groq, and HuggingFace models
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scroll-smooth"
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex gap-4 px-4 py-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Assistant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
