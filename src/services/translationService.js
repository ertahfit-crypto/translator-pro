// API service for translation functionality - using Railway backend
const RAILWAY_BACKEND_URL = 'https://innovative-gratitude-production-17e5.up.railway.app';

/**
 * Split text into chunks for large text processing
 * @param {string} text - Text to split
 * @param {number} maxLength - Maximum length per chunk (default 400)
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

export const translationService = {
  /**
   * Translate text with chunk processing for large texts
   * @param {string} text - Text to translate
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Translation result
   */
  async translate(text, source, target, onProgress) {
    try {
      if (!text || !text.trim()) {
        throw new Error('No text to translate');
      }

      // Split text into chunks if it's too long
      const chunks = splitTextForTranslation(text.trim(), 400);

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

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        translatedText: data.translatedText || data.result || '',
        source: data.sourceLanguage || source,
        target: data.targetLanguage || target,
        confidence: data.confidence || 1.0
      };
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
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Combined translation result
   */
  async translateMultipleChunks(chunks, source, target, onProgress) {
    try {
      let detectedLanguage = source;
      let combinedText = '';

      // Use for...of with await for strict sequential processing
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

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
  }
};
