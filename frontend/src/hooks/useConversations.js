import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

/**
 * Hook for managing conversations
 */
export function useConversations() {
  const conversations = useChatStore((state) => state.conversations);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const createConversation = useChatStore((state) => state.createConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const updateConversation = useChatStore((state) => state.updateConversation);

  // Initialize with a default conversation if none exist
  useEffect(() => {
    if (conversations.length === 0) {
      const newConv = createConversation('New Conversation');
      setCurrentConversation(newConv.id);
    } else if (!currentConversationId && conversations.length > 0) {
      // Set the most recent conversation as current
      const mostRecent = conversations.reduce((latest, conv) => {
        return new Date(conv.updatedAt) > new Date(latest.updatedAt) ? conv : latest;
      });
      setCurrentConversation(mostRecent.id);
    }
  }, []);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  const handleNewConversation = (title = 'New Conversation') => {
    const newConv = createConversation(title);
    setCurrentConversation(newConv.id);
    return newConv;
  };

  const handleSwitchConversation = (id) => {
    setCurrentConversation(id);
  };

  const handleDeleteConversation = (id) => {
    deleteConversation(id);
  };

  const handleUpdateConversation = (id, updates) => {
    updateConversation(id, updates);
  };

  return {
    conversations,
    currentConversation,
    currentConversationId,
    createConversation: handleNewConversation,
    switchConversation: handleSwitchConversation,
    deleteConversation: handleDeleteConversation,
    updateConversation: handleUpdateConversation,
  };
}
