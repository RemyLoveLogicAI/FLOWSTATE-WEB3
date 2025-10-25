import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Chat Store - Manages conversations, messages, and voice state
 */
export const useChatStore = create(
  persist(
    (set, get) => ({
      // Conversations
      conversations: [],
      currentConversationId: null,
      
      // Messages
      messages: {},
      
      // Voice settings
      voiceSettings: {
        enabled: true,
        autoSpeak: true,
        voice: 'default',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        language: 'en-US',
        pushToTalk: false,
      },
      
      // UI State
      isListening: false,
      isSpeaking: false,
      isTyping: false,
      
      // Model settings
      selectedModel: 'llama-3.3-70b-versatile',
      availableModels: [],
      
      // Theme
      theme: 'dark',

      // Actions
      
      /**
       * Create new conversation
       */
      createConversation: (title = 'New Chat') => {
        const id = Date.now().toString();
        const conversation = {
          id,
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
          messages: { ...state.messages, [id]: [] },
        }));
        
        return id;
      },

      /**
       * Select conversation
       */
      selectConversation: (id) => {
        set({ currentConversationId: id });
      },

      /**
       * Delete conversation
       */
      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter(c => c.id !== id);
          const newMessages = { ...state.messages };
          delete newMessages[id];
          
          return {
            conversations: newConversations,
            messages: newMessages,
            currentConversationId: state.currentConversationId === id 
              ? (newConversations[0]?.id || null) 
              : state.currentConversationId,
          };
        });
      },

      /**
       * Update conversation title
       */
      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      /**
       * Add message to current conversation
       */
      addMessage: (message) => {
        const conversationId = get().currentConversationId;
        
        if (!conversationId) {
          // Create new conversation if none exists
          const newId = get().createConversation();
          get().addMessage({ ...message, conversationId: newId });
          return;
        }

        const newMessage = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...message,
        };

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), newMessage],
          },
          conversations: state.conversations.map(c =>
            c.id === conversationId ? { ...c, updatedAt: new Date().toISOString() } : c
          ),
        }));

        // Auto-generate title from first user message
        const conversation = get().conversations.find(c => c.id === conversationId);
        if (conversation && conversation.title === 'New Chat' && message.role === 'user') {
          const title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
          get().updateConversationTitle(conversationId, title);
        }
      },

      /**
       * Update last message (for streaming)
       */
      updateLastMessage: (content) => {
        const conversationId = get().currentConversationId;
        if (!conversationId) return;

        set((state) => {
          const messages = state.messages[conversationId] || [];
          if (messages.length === 0) return state;

          const updatedMessages = [...messages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          
          if (lastMessage.role === 'assistant') {
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + content,
            };
          }

          return {
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages,
            },
          };
        });
      },

      /**
       * Get current conversation messages
       */
      getCurrentMessages: () => {
        const conversationId = get().currentConversationId;
        return conversationId ? get().messages[conversationId] || [] : [];
      },

      /**
       * Update voice settings
       */
      updateVoiceSettings: (settings) => {
        set((state) => ({
          voiceSettings: { ...state.voiceSettings, ...settings },
        }));
      },

      /**
       * Set listening state
       */
      setListening: (isListening) => {
        set({ isListening });
      },

      /**
       * Set speaking state
       */
      setSpeaking: (isSpeaking) => {
        set({ isSpeaking });
      },

      /**
       * Set typing state
       */
      setTyping: (isTyping) => {
        set({ isTyping });
      },

      /**
       * Set selected model
       */
      setSelectedModel: (model) => {
        set({ selectedModel: model });
      },

      /**
       * Set available models
       */
      setAvailableModels: (models) => {
        set({ availableModels: models });
      },

      /**
       * Toggle theme
       */
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
      },

      /**
       * Clear all conversations
       */
      clearAll: () => {
        set({
          conversations: [],
          messages: {},
          currentConversationId: null,
        });
      },
    }),
    {
      name: 'flowstate-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        voiceSettings: state.voiceSettings,
        selectedModel: state.selectedModel,
        theme: state.theme,
      }),
    }
  )
);
