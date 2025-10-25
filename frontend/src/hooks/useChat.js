import { useState, useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { sendChatMessage } from '../services/api';
import { voiceService } from '../services/voiceService';
import { generateId } from '../utils/helpers';
import { generateTitle } from '../utils/markdown';

/**
 * Hook for managing chat messages and interactions
 */
export function useChat(conversationId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messages = useChatStore((state) => state.messages[conversationId] || []);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateLastMessage = useChatStore((state) => state.updateLastMessage);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const voiceSettings = useChatStore((state) => state.voiceSettings);
  const isSpeaking = useChatStore((state) => state.isSpeaking);
  const setSpeaking = useChatStore((state) => state.setSpeaking);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const setIsTyping = useChatStore((state) => state.setIsTyping);

  // Auto-update conversation title based on first message
  useEffect(() => {
    if (messages.length === 1 && conversationId) {
      const firstMessage = messages[0];
      if (firstMessage.role === 'user') {
        const title = generateTitle(firstMessage.content, 60);
        updateConversation(conversationId, { title });
      }
    }
  }, [messages, conversationId, updateConversation]);

  const handleSendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isLoading || !conversationId) return;

      setError(null);
      setIsLoading(true);
      setIsTyping(true);

      // Add user message
      const userMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
        conversationId,
      };

      addMessage(userMessage);

      // Create assistant message placeholder
      const assistantMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        conversationId,
        isStreaming: true,
      };

      addMessage(assistantMessage);

      try {
        let fullResponse = '';

        // Stream the response
        await sendChatMessage(
          content.trim(),
          (chunk) => {
            fullResponse += chunk;
            updateLastMessage(conversationId, fullResponse, true);
          },
          {
            model: selectedModel,
            conversationId,
          }
        );

        // Mark streaming as complete
        updateLastMessage(conversationId, fullResponse, false);

        // Auto-speak the response if enabled
        if (voiceSettings.enabled && voiceSettings.autoSpeak && fullResponse) {
          setSpeaking(true);
          voiceService.speak(fullResponse, {
            rate: voiceSettings.rate,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            language: voiceSettings.language,
            onEnd: () => setSpeaking(false),
            onError: () => setSpeaking(false),
          });
        }
      } catch (err) {
        console.error('Chat error:', err);
        setError(err.message || 'Failed to send message');
        
        // Update the message with error state
        updateLastMessage(
          conversationId,
          'Sorry, I encountered an error. Please try again.',
          false
        );
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [
      conversationId,
      isLoading,
      selectedModel,
      voiceSettings,
      addMessage,
      updateLastMessage,
      setSpeaking,
      setIsTyping,
    ]
  );

  const handleStopGeneration = useCallback(() => {
    setIsLoading(false);
    setIsTyping(false);
    
    // Stop speaking if active
    if (isSpeaking) {
      voiceService.stop();
      setSpeaking(false);
    }
  }, [isSpeaking, setSpeaking]);

  const handleRetry = useCallback(() => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user');
    
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  }, [messages, handleSendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage: handleSendMessage,
    stopGeneration: handleStopGeneration,
    retry: handleRetry,
  };
}
