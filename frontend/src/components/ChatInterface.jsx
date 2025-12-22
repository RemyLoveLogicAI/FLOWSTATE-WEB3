import { useState } from 'react';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { Sidebar } from './Sidebar';
import { useChat } from '../hooks/useChat';
import { useConversations } from '../hooks/useConversations';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useChatStore } from '../store/chatStore';

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { currentConversationId, createConversation } = useConversations();
  const { messages, isLoading, sendMessage } = useChat(currentConversationId);
  
  const setListening = useChatStore((state) => state.setListening);
  const isListening = useChatStore((state) => state.isListening);
  const setSpeaking = useChatStore((state) => state.setSpeaking);
  const isSpeaking = useChatStore((state) => state.isSpeaking);
  const updateVoiceSettings = useChatStore((state) => state.updateVoiceSettings);
  const voiceSettings = useChatStore((state) => state.voiceSettings);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = (message) => {
    sendMessage(message);
  };

  const handleToggleVoice = () => {
    setListening(!isListening);
  };

  const handleToggleSpeaking = () => {
    const newValue = !isSpeaking;
    setSpeaking(newValue);
    updateVoiceSettings({ autoSpeak: newValue });
  };

  const handleNewConversation = () => {
    createConversation('New Conversation');
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onToggleVoice: handleToggleVoice,
    onToggleSpeaking: handleToggleSpeaking,
    onNewConversation: handleNewConversation,
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Input Area */}
        <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
