import { Download, Upload, FileJson, FileText, AlertCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { generateTitle } from '../utils/markdown';

/**
 * Export/Import Conversations Component
 */
export function ConversationExport() {
  const conversations = useChatStore((state) => state.conversations);
  const messages = useChatStore((state) => state.messages);
  const createConversation = useChatStore((state) => state.createConversation);
  const addMessage = useChatStore((state) => state.addMessage);

  /**
   * Export conversations as JSON
   */
  const exportAsJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      conversations: conversations.map((conv) => ({
        ...conv,
        messages: messages[conv.id] || [],
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowstate-conversations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Export conversations as Markdown
   */
  const exportAsMarkdown = () => {
    let markdown = '# FlowState AI Conversations\n\n';
    markdown += `Exported: ${new Date().toLocaleString()}\n\n`;
    markdown += '---\n\n';

    conversations.forEach((conv) => {
      const convMessages = messages[conv.id] || [];
      markdown += `## ${conv.title}\n\n`;
      markdown += `Created: ${new Date(conv.createdAt).toLocaleString()}\n`;
      markdown += `Updated: ${new Date(conv.updatedAt).toLocaleString()}\n\n`;

      convMessages.forEach((msg) => {
        const role = msg.role === 'user' ? '**You**' : '**Assistant**';
        markdown += `### ${role}\n\n`;
        markdown += `${msg.content}\n\n`;
        markdown += `*${new Date(msg.timestamp).toLocaleString()}*\n\n`;
        markdown += '---\n\n';
      });

      markdown += '\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowstate-conversations-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Import conversations from JSON
   */
  const importFromJSON = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate data structure
        if (!data.conversations || !Array.isArray(data.conversations)) {
          throw new Error('Invalid conversation data format');
        }

        // Import conversations
        data.conversations.forEach((conv) => {
          const newConv = createConversation(conv.title);
          
          // Import messages
          if (conv.messages && Array.isArray(conv.messages)) {
            conv.messages.forEach((msg) => {
              addMessage({
                ...msg,
                conversationId: newConv.id,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              });
            });
          }
        });

        alert(`Successfully imported ${data.conversations.length} conversation(s)`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import conversations. Please check the file format.');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  /**
   * Export single conversation
   */
  const exportConversation = (conversationId) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      conversation: {
        ...conv,
        messages: messages[conv.id] || [],
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    exportAsJSON,
    exportAsMarkdown,
    importFromJSON,
    exportConversation,
  };
}

/**
 * Export/Import UI Component
 */
export function ExportImportMenu({ onClose }) {
  const { exportAsJSON, exportAsMarkdown, importFromJSON } = ConversationExport();

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 min-w-[300px]">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Export/Import Conversations
      </h3>

      {/* Export Options */}
      <div className="space-y-2 mb-4">
        <button
          onClick={() => {
            exportAsJSON();
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
        >
          <FileJson className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Export as JSON
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Machine-readable format
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            exportAsMarkdown();
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
        >
          <FileText className="w-5 h-5 text-green-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Export as Markdown
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Human-readable format
            </div>
          </div>
        </button>
      </div>

      {/* Import Option */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
        <label className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
          <Upload className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Import from JSON
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Restore conversations
            </div>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              importFromJSON(e);
              onClose?.();
            }}
            className="hidden"
          />
        </label>
      </div>

      {/* Info */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Exports include all conversations and messages. Imports will create new conversations.
        </p>
      </div>
    </div>
  );
}
