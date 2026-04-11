// API service for translation functionality - using Google Translate API mirror
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';

// Supported languages constants
const SUPPORTED_LANGUAGES = {
  'auto': 'Auto-detect',
  'en': 'English',
  'ru': 'Russian',
  'uk': 'Ukrainian',
  'zh': 'Chinese',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'pt': 'Portuguese',
  'it': 'Italian',
  'nl': 'Dutch',
  'pl': 'Polish',
  'tr': 'Turkish',
  'hi': 'Hindi',
  'th': 'Thai',
  'vi': 'Vietnamese'
};

/**
 * Service for handling translation API calls
 */
export const translationService = {
  /**
   * Get supported languages
   * @returns {Promise<Object>} - Supported languages object
   */
  async getLanguages() {
    // Return supported languages directly instead of fetching from backend
    try {
      return SUPPORTED_LANGUAGES;
    } catch (error) {
      console.error('Error getting languages:', error);
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
      // Use Google Translate API mirror
      const encodedText = encodeURIComponent(text.trim());
      const apiUrl = `${GOOGLE_TRANSLATE_URL}?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodedText}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'TranslatorPro/1.0',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Google Translate response format: [[["translated_text", "original_text", ...], ...], ...]
      if (result && result[0] && result[0][0] && result[0][0][0]) {
        return {
          translatedText: result[0][0][0].trim(),
          source: source,
          target: target
        };
      } else {
        throw new Error('Translation failed - invalid response format');
      }
    } catch (error) {
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
    // Use Google Translate API for language detection
    try {
      const encodedText = encodeURIComponent(text.trim());
      const apiUrl = `${GOOGLE_TRANSLATE_URL}?client=gtx&sl=auto&tl=en&dt=t&q=${encodedText}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Google Translate returns detected language in response data
      if (result && result.length > 2 && result[2]) {
        return {
          detectedLanguage: result[2],
          confidence: 0.8
        };
      } else {
        return {
          detectedLanguage: 'auto',
          confidence: 0.5
        };
      }
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
    // Check Google Translate API health by making a simple translation request
    try {
      const response = await fetch(`${GOOGLE_TRANSLATE_URL}?client=gtx&sl=en&tl=es&dt=t&q=hello`);
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        api: 'Google Translate'
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy',
        api: 'Google Translate',
        error: error.message
      };
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
