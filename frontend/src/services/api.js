/**
 * API Service for FlowState AI Backend
 * Handles all communication with the Cloudflare Workers backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://flowstate-ai-backend.jmjones925.workers.dev';

/**
 * Fetch available AI models
 */
export async function fetchModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`);
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
}

/**
 * Send chat message with streaming support
 * @param {string} message - User message
 * @param {Function} onChunk - Callback for each chunk
 * @param {Object} options - Additional options (model, conversationId)
 */
export async function sendChatMessage(message, onChunk, options = {}) {
  const { model, conversationId } = options;

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        model,
        conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

/**
 * Check API health
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
}
