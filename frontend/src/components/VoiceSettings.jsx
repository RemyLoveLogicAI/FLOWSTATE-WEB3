import { useState, useEffect } from 'react';
import { X, Mic, Volume2, Languages, Sliders, MessageSquare } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { voiceService } from '../services/voiceService';
import { motion, AnimatePresence } from 'framer-motion';

export function VoiceSettings({ isOpen, onClose }) {
  const voiceSettings = useChatStore((state) => state.voiceSettings);
  const updateVoiceSettings = useChatStore((state) => state.updateVoiceSettings);
  
  const [availableVoices, setAvailableVoices] = useState([]);
  const [localSettings, setLocalSettings] = useState(voiceSettings);

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    setLocalSettings(voiceSettings);
  }, [voiceSettings]);

  const loadVoices = async () => {
    try {
      const voices = await new Promise((resolve) => {
        let voiceList = window.speechSynthesis.getVoices();
        if (voiceList.length > 0) {
          resolve(voiceList);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            voiceList = window.speechSynthesis.getVoices();
            resolve(voiceList);
          };
        }
      });
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    updateVoiceSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      enabled: true,
      autoSpeak: true,
      voice: 'default',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      language: 'en-US',
      pushToTalk: false,
    };
    setLocalSettings(defaultSettings);
    updateVoiceSettings(defaultSettings);
  };

  const testVoice = () => {
    voiceService.speak('This is a test of the voice settings.', {
      rate: localSettings.rate,
      pitch: localSettings.pitch,
      volume: localSettings.volume,
      voice: localSettings.voice,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Voice Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customize your voice interaction experience
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Enable Voice */}
                <div className="mb-6">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Mic className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Enable Voice Features
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Turn on speech recognition and text-to-speech
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.enabled}
                      onChange={(e) => handleChange('enabled', e.target.checked)}
                      className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer transition-colors checked:bg-blue-500"
                    />
                  </label>
                </div>

                {/* Auto-Speak */}
                <div className="mb-6">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Auto-Speak Responses
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Automatically read AI responses aloud
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.autoSpeak}
                      onChange={(e) => handleChange('autoSpeak', e.target.checked)}
                      disabled={!localSettings.enabled}
                      className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer transition-colors checked:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                {/* Push to Talk */}
                <div className="mb-6">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Push-to-Talk Mode
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Hold button to speak instead of continuous listening
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.pushToTalk}
                      onChange={(e) => handleChange('pushToTalk', e.target.checked)}
                      disabled={!localSettings.enabled}
                      className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer transition-colors checked:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 my-6" />

                {/* Language */}
                <div className="mb-6">
                  <label className="block mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Recognition Language
                      </span>
                    </div>
                    <select
                      value={localSettings.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      disabled={!localSettings.enabled}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish (Spain)</option>
                      <option value="es-MX">Spanish (Mexico)</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                      <option value="it-IT">Italian</option>
                      <option value="pt-BR">Portuguese (Brazil)</option>
                      <option value="ja-JP">Japanese</option>
                      <option value="ko-KR">Korean</option>
                      <option value="zh-CN">Chinese (Simplified)</option>
                      <option value="zh-TW">Chinese (Traditional)</option>
                      <option value="ru-RU">Russian</option>
                      <option value="ar-SA">Arabic</option>
                      <option value="hi-IN">Hindi</option>
                    </select>
                  </label>
                </div>

                {/* Voice Selection */}
                <div className="mb-6">
                  <label className="block mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        TTS Voice
                      </span>
                    </div>
                    <select
                      value={localSettings.voice}
                      onChange={(e) => handleChange('voice', e.target.value)}
                      disabled={!localSettings.enabled}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="default">Default Voice</option>
                      {availableVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Speech Rate */}
                <div className="mb-6">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Speech Rate
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {localSettings.rate.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={localSettings.rate}
                      onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
                      disabled={!localSettings.enabled}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </label>
                </div>

                {/* Pitch */}
                <div className="mb-6">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Pitch
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {localSettings.pitch.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={localSettings.pitch}
                      onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
                      disabled={!localSettings.enabled}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Lower</span>
                      <span>Higher</span>
                    </div>
                  </label>
                </div>

                {/* Volume */}
                <div className="mb-6">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Volume
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(localSettings.volume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localSettings.volume}
                      onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
                      disabled={!localSettings.enabled}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Quiet</span>
                      <span>Loud</span>
                    </div>
                  </label>
                </div>

                {/* Test Button */}
                <button
                  onClick={testVoice}
                  disabled={!localSettings.enabled}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Voice Settings
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Reset to Default
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
