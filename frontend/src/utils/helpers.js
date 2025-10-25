/**
 * Format a date to a relative time string (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const timestamp = new Date(date);
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return timestamp.toLocaleDateString();
}

/**
 * Format a date to time string (e.g., "2:30 PM")
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get the first line of text (for conversation titles)
 */
export function getFirstLine(text, maxLength = 60) {
  const firstLine = text.split('\n')[0];
  return truncate(firstLine, maxLength);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported() {
  return 'speechSynthesis' in window;
}

/**
 * Get available voices for TTS
 */
export function getAvailableVoices() {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
}

/**
 * Scroll to bottom of container smoothly
 */
export function scrollToBottom(element, behavior = 'smooth') {
  if (!element) return;
  element.scrollTo({
    top: element.scrollHeight,
    behavior,
  });
}
