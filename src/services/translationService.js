// API service for translation functionality - using Railway backend
const RAILWAY_BACKEND_URL = 'https://innovative-gratitude-production-17e5.up.railway.app';

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
 * Split text into chunks for large text processing
 * @param {string} text - Text to split
 * @param {number} maxLength - Maximum length per chunk (default 5000)
 * @returns {Array} - Array of text chunks
 */
function splitTextForTranslation(text, maxLength = 400) {
  if (!text || text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  let currentChunk = '';
  
  // Split by words to maintain small chunks for better reliability
  const words = text.split(' ');
  
  for (const word of words) {
    if (currentChunk.length + word.length + 1 <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + word;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

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
   * Translate text with chunk processing for large texts
   * @param {string} text - Text to translate
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   * @returns {Promise<Object>} - Translation result
   */
  async translate(text, source, target, onProgress) {
    try {
      if (!text || !text.trim()) {
        throw new Error('No text to translate');
      }

      // Split text into chunks if it's too long
      const chunks = splitTextForTranslation(text.trim(), 400);
      console.log(`Split text into ${chunks.length} chunks for translation`);

      if (chunks.length === 1) {
        // Single chunk - translate directly
        const result = await this.translateSingleChunk(chunks[0], source, target);
        if (onProgress) {
          onProgress(result.translatedText, 1, 1);
        }
        return result;
      } else {
        // Multiple chunks - translate sequentially and combine
        return await this.translateMultipleChunks(chunks, source, target, onProgress);
      }
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },

  /**
   * Translate a single chunk
   * @param {string} text - Text to translate
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   * @returns {Promise<Object>} - Translation result
   */
  async translateSingleChunk(text, source, target) {
    try {
      console.log('Sending chunk:', text.length, 'chars:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      const response = await fetch(`${RAILWAY_BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TranslatorPro/1.0'
        },
        body: JSON.stringify({
          text: text,
          source: source,
          target: target
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.translatedText) {
        return {
          translatedText: result.translatedText,
          source: result.sourceLanguage || source,
          target: result.targetLanguage || target
        };
      } else {
        throw new Error('Translation failed - invalid response format');
      }
    } catch (error) {
      console.error('Single chunk translation error:', error);
      throw error;
    }
  },

  /**
   * Translate multiple chunks sequentially
   * @param {Array} chunks - Array of text chunks
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   * @returns {Promise<Object>} - Combined translation result
   */
  async translateMultipleChunks(chunks, source, target, onProgress) {
    try {
      let detectedLanguage = source;
      let combinedText = '';

      console.log(`Translating ${chunks.length} chunks sequentially`);

      // Use for...of with await for strict sequential processing
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Translating chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

        try {
          const result = await this.translateSingleChunk(chunk, source, target);
          
          // Use detected language from first chunk for subsequent chunks
          if (i === 0 && result.source !== 'auto') {
            detectedLanguage = result.source;
          }

          // Add space between chunks if needed
          if (combinedText && result.translatedText) {
            combinedText += ' ';
          }
          combinedText += result.translatedText;

          // Call progress callback to update UI with partial result
          if (onProgress) {
            onProgress(combinedText, i + 1, chunks.length);
          }

        } catch (error) {
          console.error(`Error translating chunk ${i + 1}:`, error);
          // Add original chunk if translation fails
          if (combinedText && chunk) {
            combinedText += ' ';
          }
          combinedText += chunk;

          // Still call progress callback even on error
          if (onProgress) {
            onProgress(combinedText, i + 1, chunks.length);
          }
        }
      }

      console.log(`Final translation: ${combinedText.length} characters total`);

      return {
        translatedText: combinedText,
        source: detectedLanguage,
        target: target,
        chunksProcessed: chunks.length
      };
    } catch (error) {
      console.error('Multiple chunks translation error:', error);
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
      if (!text || !text.trim()) {
        throw new Error('No text to detect language for');
      }

      const response = await fetch(`${RAILWAY_BACKEND_URL}/api/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TranslatorPro/1.0'
        },
        body: JSON.stringify({
          text: text.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        detectedLanguage: result.language || 'auto',
        confidence: result.confidence || 0.8
      };
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
      const response = await fetch(`${RAILWAY_BACKEND_URL}/api/health`);
      
      if (response.ok) {
        const result = await response.json();
        return {
          status: 'healthy',
          api: 'Railway Backend',
          backend: result
        };
      } else {
        return {
          status: 'unhealthy',
          api: 'Railway Backend',
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy',
        api: 'Railway Backend',
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
