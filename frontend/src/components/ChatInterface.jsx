import { useState } from 'react';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { Sidebar } from './Sidebar';
import { useChat } from '../hooks/useChat';
import { useConversations } from '../hooks/useConversations';

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { currentConversationId } = useConversations();
  const { messages, isLoading, sendMessage } = useChat(currentConversationId);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = (message) => {
    sendMessage(message);
  };

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
