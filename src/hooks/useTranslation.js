import { useState, useEffect, useCallback } from 'react';
import { translationService, speechService } from '../services/translationService';
import { storage } from '../utils/storage';

/**
 * Custom hook for managing translation functionality
 * @returns {Object} - Translation state and controls
 */
export const useTranslation = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [languages, setLanguages] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  // Load supported languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const langs = await translationService.getLanguages();
        setLanguages(langs);
      } catch (err) {
        setError('Failed to load languages');
        console.error(err);
      }
    };

    loadLanguages();
  }, []);

  // Load history and favorites from storage
  useEffect(() => {
    setHistory(storage.getHistory());
    setFavorites(storage.getFavorites());
  }, []);

  // Auto-detect language when source text changes
  const detectLanguage = useCallback(async (text) => {
    if (!text || (text || "").length < 3 || sourceLang !== 'auto') return;

    setIsDetecting(true);
    try {
      const result = await translationService.detectLanguage(text);
      setDetectedLanguage(result.language);
    } catch (err) {
      console.error('Language detection failed:', err);
    } finally {
      setIsDetecting(false);
    }
  }, [sourceLang]);

  // Translate text
  const translate = useCallback(async () => {
    if (!sourceText?.trim()) {
      setTargetText('');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await translationService.translate(
        sourceText,
        sourceLang,
        targetLang
      );

      setTargetText(result.translatedText);
      
      // Save to history
      const translation = {
        id: Date.now(),
        sourceText,
        targetText: result.translatedText,
        sourceLang: result.sourceLanguage || sourceLang,
        targetLang: result.targetLanguage,
        timestamp: new Date().toISOString()
      };
      
      storage.saveToHistory(translation);
      setHistory(storage.getHistory());

    } catch (err) {
      setError(err.message || 'Translation failed');
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  // Swap languages
  const swapLanguages = useCallback(() => {
    if (sourceLang === 'auto') return; // Can't swap with auto-detect

    const tempSourceText = sourceText || '';
    const tempTargetText = targetText || '';
    
    setSourceText(tempTargetText);
    setTargetText(tempSourceText);
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }, [sourceLang, targetLang, sourceText, targetText]);

  // Copy text to clipboard
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  }, []);

  // Speak text using text-to-speech
  const speakText = useCallback(async (text, lang) => {
    if (!speechService.isSupported()) {
      setError('Text-to-speech not supported in your browser');
      return false;
    }

    try {
      await speechService.speak(text, lang);
      return true;
    } catch (err) {
      setError('Failed to speak text');
      console.error(err);
      return false;
    }
  }, []);

  // Stop speech
  const stopSpeaking = useCallback(() => {
    speechService.stop();
  }, []);

  // Add to favorites
  const addToFavorites = useCallback((translation) => {
    storage.addToFavorites(translation);
    setFavorites(storage.getFavorites());
  }, []);

  // Remove from favorites
  const removeFromFavorites = useCallback((translation) => {
    storage.removeFromFavorites(translation);
    setFavorites(storage.getFavorites());
  }, []);

  // Check if translation is favorite
  const isFavorite = useCallback((translation) => {
    return storage.isFavorite(translation);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    storage.clearHistory();
    setHistory([]);
  }, []);

  // Handle source text change with auto-detection
  const handleSourceTextChange = useCallback((text) => {
    setSourceText(text);
    detectLanguage(text);
  }, [detectLanguage]);

  // Auto-translate when source text changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sourceText?.trim()) {
        translate();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [sourceText, translate]);

  return {
    // State
    sourceText,
    targetText,
    sourceLang,
    targetLang,
    languages,
    isTranslating,
    isDetecting,
    error,
    history,
    favorites,
    detectedLanguage,
    
    // Actions
    setSourceText: handleSourceTextChange,
    setTargetText,
    setSourceLang,
    setTargetLang,
    translate,
    swapLanguages,
    copyToClipboard,
    speakText,
    stopSpeaking,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearHistory,
    
    // Utilities
    clearError: () => setError(null)
  };
};
