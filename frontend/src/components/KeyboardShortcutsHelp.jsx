/**
 * Keyboard Shortcuts Help Component
 */
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ['Ctrl', 'M'], description: 'Toggle voice listening' },
    { keys: ['Ctrl', 'Shift', 'M'], description: 'Toggle auto-speak' },
    { keys: ['Ctrl', 'N'], description: 'New conversation' },
    { keys: ['Ctrl', 'K'], description: 'Focus search' },
    { keys: ['Escape'], description: 'Stop voice/speaking' },
    { keys: ['Space'], description: 'Push-to-talk (hold)' },
    { keys: ['Enter'], description: 'Send message' },
    { keys: ['Shift', 'Enter'], description: 'New line in message' },
  ];

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Keyboard Shortcuts
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {shortcut.description}
            </span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <kbd
                  key={keyIndex}
                  className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
