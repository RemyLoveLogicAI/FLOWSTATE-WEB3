/**
 * Voice Service - Speech Recognition & Text-to-Speech
 * Provides voice-first interaction capabilities
 */

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isPushToTalk = false;
    this.voices = [];
    this.currentUtterance = null;
    
    this.initSpeechRecognition();
    this.loadVoices();
  }

  /**
   * Initialize Web Speech API
   */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  /**
   * Load available voices
   */
  loadVoices() {
    this.voices = this.synthesis.getVoices();
    
    if (this.voices.length === 0) {
      // Voices load asynchronously
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis.getVoices();
      });
    }
  }

  /**
   * Start listening for voice input
   * @param {Function} onTranscript - Callback for transcript
   * @param {Function} onFinal - Callback for final transcript
   * @param {Function} onError - Callback for errors
   */
  startListening(onTranscript, onFinal, onError) {
    if (!this.recognition) {
      onError?.(new Error('Speech recognition not available'));
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        onTranscript?.(interimTranscript, false);
      }

      if (finalTranscript) {
        onTranscript?.(finalTranscript, true);
        onFinal?.(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      // Auto-restart if continuous mode (not push-to-talk)
      if (!this.isPushToTalk && this.isListening) {
        this.recognition.start();
      }
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      this.isListening = false;
      onError?.(error);
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  /**
   * Speak text using text-to-speech
   * @param {string} text - Text to speak
   * @param {Object} options - Voice options
   */
  speak(text, options = {}) {
    // Cancel any ongoing speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice
    const {
      voice = 'default',
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      lang = 'en-US',
    } = options;

    if (voice !== 'default') {
      const selectedVoice = this.voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    this.currentUtterance = utterance;

    // Event handlers
    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (error) => {
      console.error('TTS error:', error);
      this.currentUtterance = null;
      options.onError?.(error);
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Pause speaking
   */
  pauseSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume speaking
   */
  resumeSpeaking() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.voices;
  }

  /**
   * Set push-to-talk mode
   */
  setPushToTalk(enabled) {
    this.isPushToTalk = enabled;
  }

  /**
   * Check if speech recognition is supported
   */
  isRecognitionSupported() {
    return !!this.recognition;
  }

  /**
   * Check if text-to-speech is supported
   */
  isSpeechSynthesisSupported() {
    return !!this.synthesis;
  }

  /**
   * Change recognition language
   */
  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
