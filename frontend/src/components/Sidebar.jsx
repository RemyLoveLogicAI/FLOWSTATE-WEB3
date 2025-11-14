import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search,
  X,
  ChevronLeft
} from 'lucide-react';
import { formatRelativeTime, getFirstLine } from '../utils/helpers';

export function Sidebar({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const conversations = useChatStore((state) => state.conversations);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const messages = useChatStore((state) => state.messages);
  const createConversation = useChatStore((state) => state.createConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);

  const handleNewChat = () => {
    const newConv = createConversation('New Conversation');
    setCurrentConversation(newConv.id);
  };

  const handleSelectConversation = (id) => {
    setCurrentConversation(id);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleDeleteConversation = (e, id) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const getConversationPreview = (convId) => {
    const convMessages = messages[convId] || [];
    if (convMessages.length === 0) {
      return 'No messages yet';
    }
    const lastMessage = convMessages[convMessages.length - 1];
    return getFirstLine(lastMessage.content, 50);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const preview = getConversationPreview(conv.id);
    return (
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversations
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {filteredConversations.map((conv) => {
                const isActive = conv.id === currentConversationId;
                const preview = getConversationPreview(conv.id);
                const messageCount = (messages[conv.id] || []).length;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors group relative ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <h3
                            className={`text-sm font-medium truncate ${
                              isActive
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {conv.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate pl-6">
                          {preview}
                        </p>
                        <div className="flex items-center gap-2 mt-1 pl-6">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatRelativeTime(conv.updatedAt)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            • {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
