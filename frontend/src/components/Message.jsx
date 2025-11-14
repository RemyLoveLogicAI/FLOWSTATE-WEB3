import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';
import { formatTime } from '../utils/helpers';

export function Message({ message }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const isUser = message.role === 'user';

  const handleCopyCode = async (code, index) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div
      className={`flex gap-4 px-4 py-6 ${
        isUser
          ? 'bg-white dark:bg-gray-900'
          : 'bg-gray-50 dark:bg-gray-800/50'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isUser
              ? 'bg-blue-500'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const code = String(children).replace(/\n$/, '');

                if (!inline && language) {
                  return (
                    <div className="relative group my-4">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
                        <span className="text-xs font-medium text-gray-300">
                          {language}
                        </span>
                        <button
                          onClick={() => handleCopyCode(code, code)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedCode === code ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language={language}
                        style={oneDark}
                        customStyle={{
                          margin: 0,
                          borderTopLeftRadius: 0,
                          borderTopRightRadius: 0,
                          borderBottomLeftRadius: '0.5rem',
                          borderBottomRightRadius: '0.5rem',
                        }}
                        {...props}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code
                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a({ node, children, href, ...props }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Streaming indicator */}
        {message.isStreaming && (
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
