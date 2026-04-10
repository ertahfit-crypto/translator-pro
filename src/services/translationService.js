// API service for translation functionality
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Service for handling translation API calls
 */
export const translationService = {
  /**
   * Get supported languages
   * @returns {Promise<Object>} - Supported languages object
   */
  async getLanguages() {
    try {
      const response = await fetch(`${API_BASE_URL}/languages`);
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  },

  /**
   * Translate text
   * @param {string} text - Text to translate
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   * @returns {Promise<Object>} - Translation result
   */
  async translate(text, source, target) {
    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source,
          target
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Translation API error:', errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Translation successful:', result);
      return result;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error - backend not responding:', error);
        throw new Error('Translation service unavailable. Please check if the backend server is running on localhost:3001');
      }
      console.error('Translation error:', error);
      throw error;
    }
  },

  /**
   * Detect language of text
   * @param {string} text - Text to detect language for
   * @returns {Promise<Object>} - Detection result
   */
  async detectLanguage(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Language detection failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  },

  /**
   * Check API health
   * @returns {Promise<Object>} - Health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('API health check failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
};

/**
 * Text-to-Speech utility using Web Speech API
 */
export const speechService = {
  /**
   * Language code mapping for TTS
   */
  languageMap: {
    'en': 'en-US',
    'ru': 'ru-RU',
    'zh': 'zh-CN',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'ar': 'ar-SA',
    'pt': 'pt-BR',
    'it': 'it-IT',
    'nl': 'nl-NL',
    'pl': 'pl-PL',
    'tr': 'tr-TR',
    'hi': 'hi-IN',
    'th': 'th-TH',
    'vi': 'vi-VN'
  },

  /**
   * Speak text using browser's speech synthesis
   * @param {string} text - Text to speak
   * @param {string} lang - Language code (optional)
   * @returns {Promise<void>}
   */
  speak(text, lang = 'en') {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (!text?.trim()) {
        reject(new Error('No text to speak'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.languageMap[lang] || lang || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

      window.speechSynthesis.speak(utterance);
    });
  },

  /**
   * Stop speech synthesis
   */
  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Check if speech synthesis is supported
   * @returns {boolean}
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }
};
