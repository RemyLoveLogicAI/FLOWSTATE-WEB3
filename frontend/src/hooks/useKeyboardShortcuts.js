import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

/**
 * Keyboard Shortcuts Hook
 * Provides keyboard shortcuts for voice and chat features
 */
export function useKeyboardShortcuts({ onToggleVoice, onToggleSpeaking, onNewConversation }) {
  const isListening = useChatStore((state) => state.isListening);
  const isSpeaking = useChatStore((state) => state.isSpeaking);
  const voiceSettings = useChatStore((state) => state.voiceSettings);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts when typing in input fields
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + M: Toggle voice listening
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        if (voiceSettings.enabled) {
          onToggleVoice?.();
        }
      }

      // Ctrl/Cmd + Shift + M: Toggle auto-speak
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        if (voiceSettings.enabled) {
          onToggleSpeaking?.();
        }
      }

      // Ctrl/Cmd + N: New conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNewConversation?.();
      }

      // Ctrl/Cmd + K: Focus search (sidebar)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]');
        searchInput?.focus();
      }

      // Escape: Stop voice/speaking
      if (e.key === 'Escape') {
        if (isListening || isSpeaking) {
          e.preventDefault();
          onToggleVoice?.();
        }
      }

      // Space: Toggle voice (when not in input)
      if (e.key === ' ' && voiceSettings.pushToTalk) {
        e.preventDefault();
        onToggleVoice?.();
      }
    };

    const handleKeyUp = (e) => {
      // Release space in push-to-talk mode
      if (e.key === ' ' && voiceSettings.pushToTalk && isListening) {
        e.preventDefault();
        onToggleVoice?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    isListening,
    isSpeaking,
    voiceSettings,
    onToggleVoice,
    onToggleSpeaking,
    onNewConversation,
  ]);
}
