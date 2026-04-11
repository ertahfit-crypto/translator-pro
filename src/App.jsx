import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import TranslationBox from './components/TranslationBox';
import HistoryBar from './components/HistoryBar';
import SettingsModal from './components/SettingsModal';
import { useLocalization } from './hooks/useLocalization';
import { translationService, speechService } from './services/translationService';
import './App.css';

/**
 * Main App component - Translator Pro Application
 */
function App() {
  // Global UI language state
  const [uiLanguage, setUiLanguage] = useState('ru');
  
  // Localization hook
  const { t, changeUiLanguage, getAvailableUiLanguages } = useLocalization();
  
  // Theme state - initialize from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('translator_pro_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Translation state
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('ru');
  const [targetLang, setTargetLang] = useState('en');
  const [languages, setLanguages] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiProvider, setApiProvider] = useState('google');
  const [historyLimit, setHistoryLimit] = useState(5);
  const [autoCopy, setAutoCopy] = useState(false);
  const [historyEnabled, setHistoryEnabled] = useState(true);

  // Force theme application to entire document
  useEffect(() => {
    console.log('THEME DEBUG: darkMode =', darkMode);
    
    // Apply dark class to html element for Tailwind darkMode: 'class'
    const htmlElement = document.documentElement;
    
    if (darkMode) {
      htmlElement.classList.add('dark');
      console.log('THEME DEBUG: Added dark class to html element');
      console.log('THEME DEBUG: html classes =', htmlElement.className);
    } else {
      htmlElement.classList.remove('dark');
      console.log('THEME DEBUG: Removed dark class from html element');
      console.log('THEME DEBUG: html classes =', htmlElement.className);
    }
  }, [darkMode]);

  // Load data on mount with debug logs
  useEffect(() => {
    const loadData = async () => {
      console.log('INIT DEBUG: Loading application data...');
      
      try {
        // Load settings from localStorage first
        try {
          const savedSettings = localStorage.getItem('translator_pro_settings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setApiProvider(settings.apiProvider || 'google');
            setHistoryLimit(settings.historyLimit || 5);
            setAutoCopy(settings.autoCopy || false);
            setHistoryEnabled(settings.historyEnabled !== undefined ? settings.historyEnabled : true);
            console.log('INIT DEBUG: Settings loaded:', settings);
          }
        } catch (err) {
          console.error('INIT ERROR: Failed to load settings:', err);
        }

        // Check API health using translationService
        try {
          const health = await translationService.checkHealth();
          console.log('INIT DEBUG: API health status:', health);
        } catch (healthErr) {
          console.warn('INIT DEBUG: Could not check API health:', healthErr);
        }

        // Load languages using translationService
        try {
          const languagesData = await translationService.getLanguages();
          setLanguages(languagesData);
          console.log('INIT DEBUG: Languages loaded:', languagesData);
        } catch (langErr) {
          console.error('INIT ERROR: Failed to load languages:', langErr);
          setError('Failed to load supported languages');
        }

      } catch (err) {
        console.error('INIT ERROR: Failed to load data:', err);
        setError('Failed to connect to translation service. Please check your internet connection.');
      }

      // Load favorites from localStorage
      try {
        const savedFavorites = localStorage.getItem('translator_pro_favorites');
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          setFavorites(favorites);
          console.log('INIT DEBUG: Favorites loaded:', favorites);
        }
      } catch (err) {
        console.error('INIT ERROR: Failed to load favorites:', err);
      }

      // Load history from localStorage
      try {
        const savedHistory = localStorage.getItem('translator_pro_history');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          setHistory(history);
          console.log('INIT DEBUG: History loaded:', history);
        }
      } catch (err) {
        console.error('INIT ERROR: Failed to load history:', err);
      }
      
      console.log('INIT DEBUG: Application data loading completed');
    };

    loadData();
  }, []);

  // Handle translate function using translationService
  const handleTranslate = async () => {
    if (!sourceText?.trim()) {
      setTargetText('');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await translationService.translate(sourceText, sourceLang, targetLang);
      
      setTargetText(result.translatedText);
      
      // Save to history only if enabled and translation is successful
      if (historyEnabled) {
        const translation = {
          id: Date.now(),
          sourceText: sourceText,
          targetText: result.translatedText,
          sourceLang: result.source,
          targetLang: result.target,
          timestamp: new Date().toISOString()
        };

        const newHistory = [translation, ...history.slice(0, historyLimit - 1)];
        setHistory(newHistory);
        localStorage.setItem('translator_pro_history', JSON.stringify(newHistory));
      }

      // Auto-copy if enabled
      if (autoCopy && result.translatedText) {
        try {
          await navigator.clipboard.writeText(result.translatedText);
        } catch (err) {
          console.error('Auto-copy failed:', err);
        }
      }

    } catch (err) {
      console.error('Translation error:', err);
      setTargetText('Translation failed');
      setError(err.message || 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle swap languages with proper state updates and visual feedback
  const handleSwap = () => {
    console.log('SWAP DEBUG: Function called', { 
      sourceLang, 
      targetLang,
      sourceText,
      targetText
    });
    
    if (sourceLang === 'auto') {
      console.log('SWAP DEBUG: Cannot swap with auto-detect language');
      return;
    }
    
    // Store current values before swapping (capture the exact current state)
    const currentSourceText = sourceText;
    const currentTargetText = targetText;
    const currentSourceLang = sourceLang;
    const currentTargetLang = targetLang;
    
    console.log('SWAP DEBUG: Current values before swap:', {
      sourceText: currentSourceText,
      targetText: currentTargetText,
      sourceLang: currentSourceLang,
      targetLang: currentTargetLang
    });
    
    // Perform the atomic swap - update all states at once
    // This ensures dropdown values and text fields swap together
    setSourceText(currentTargetText || '');
    setTargetText(currentSourceText || '');
    setSourceLang(currentTargetLang);
    setTargetLang(currentSourceLang);
    
    // Log the swap operation
    console.log('SWAP DEBUG: Languages swapped successfully', {
      previousSourceLang: currentSourceLang,
      previousTargetLang: currentTargetLang,
      newSourceLang: currentTargetLang,
      newTargetLang: currentSourceLang,
      previousSourceText: currentSourceText,
      previousTargetText: currentTargetText,
      newSourceText: currentTargetText,
      newTargetText: currentSourceText
    });
    
    // Verify the swap worked (logging for debugging)
    setTimeout(() => {
      console.log('SWAP DEBUG: Verification - current state after swap:', {
        sourceText,
        targetText,
        sourceLang,
        targetLang
      });
    }, 100);
  };

  // Handle copy to clipboard with debug logs
  const handleCopy = async (text) => {
    console.log('COPY DEBUG: Attempting to copy text:', text);
    try {
      await navigator.clipboard.writeText(text);
      console.log('COPY DEBUG: Text copied successfully');
      return true;
    } catch (err) {
      console.error('COPY ERROR: Failed to copy text:', err);
      return false;
    }
  };

  // Handle text-to-speech using speechService
  const handleSpeak = async (text, lang) => {
    if (!text?.trim()) {
      return;
    }

    try {
      await speechService.speak(text, lang);
    } catch (err) {
      setError(err.message || 'Text-to-speech failed');
    }
  };

  // Handle favorites with debug logs
  const handleAddToFavorites = (item) => {
    console.log('FAVORITES DEBUG: Adding item:', item);
    const newFavorites = [...favorites, item];
    setFavorites(newFavorites);
    localStorage.setItem('translator_pro_favorites', JSON.stringify(newFavorites));
    console.log('FAVORITES DEBUG: Item added to favorites');
  };

  const handleRemoveFromFavorites = (item) => {
    console.log('FAVORITES DEBUG: Removing item:', item);
    const newFavorites = favorites.filter(fav => fav.id !== item.id);
    setFavorites(newFavorites);
    localStorage.setItem('translator_pro_favorites', JSON.stringify(newFavorites));
    console.log('FAVORITES DEBUG: Item removed from favorites');
  };

  const handleIsFavorite = (item) => {
    const isFav = favorites.some(fav => fav.id === item.id);
    console.log('FAVORITES DEBUG: Item is favorite:', isFav);
    return isFav;
  };

  const handleClearHistory = () => {
    console.log('HISTORY DEBUG: Clearing history');
    setHistory([]);
    localStorage.setItem('translator_pro_history', JSON.stringify([]));
    console.log('HISTORY DEBUG: History cleared');
  };

  // Handle history item selection with debug logs
  const handleSelectHistory = (item) => {
    console.log('HISTORY DEBUG: Selecting item:', item);
    setSourceText(item.sourceText);
    setTargetText(item.targetText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    console.log('HISTORY DEBUG: History item applied to inputs');
  };

  // Toggle theme with proper html class manipulation
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply dark class to html element for Tailwind darkMode: 'class'
    const htmlElement = document.documentElement;
    if (newDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('translator_pro_theme', newDarkMode ? 'dark' : 'light');
  };

  // Settings handlers
  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleApiProviderChange = (newProvider) => {
    setApiProvider(newProvider);
  };

  const handleHistoryLimitChange = (newLimit) => {
    setHistoryLimit(newLimit);
  };

  const handleAutoCopyChange = (newAutoCopy) => {
    setAutoCopy(newAutoCopy);
  };

  const handleHistoryEnabledChange = (newHistoryEnabled) => {
    setHistoryEnabled(newHistoryEnabled);
  };

  const handleClearAllData = () => {
    setHistory([]);
    setFavorites([]);
    setApiProvider('google');
    setHistoryLimit(5);
    setAutoCopy(false);
    setHistoryEnabled(true);
  };

  // Handle UI language change
  const handleUiLanguageChange = (language) => {
    setUiLanguage(language);
    changeUiLanguage(language);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
          {/* Header */}
          <Header 
            darkMode={darkMode} 
            onToggleTheme={toggleTheme} 
            onSettingsClick={handleSettingsClick}
            t={t}
          />

          {/* Main Content */}
          <div className="mt-4 md:mt-8 space-y-6 md:space-y-8">
            {/* Language Selector */}
            <LanguageSelector
              sourceLang={sourceLang}
              targetLang={targetLang}
              languages={languages}
              onSourceChange={setSourceLang}
              onTargetChange={setTargetLang}
              onSwap={handleSwap}
              disabled={isTranslating}
            />

            {/* Translation Boxes */}
            <TranslationBox
              sourceText={sourceText}
              targetText={targetText}
              sourceLang={sourceLang}
              targetLang={targetLang}
              languages={languages}
              isTranslating={isTranslating}
              onSourceTextChange={setSourceText}
              onTranslate={handleTranslate}
              onCopy={handleCopy}
              onSpeak={handleSpeak}
              error={error}
              clearError={() => setError(null)}
              t={t}
            />

            {/* History Bar */}
            <HistoryBar
              history={history}
              favorites={favorites}
              onSelectHistory={handleSelectHistory}
              onCopy={handleCopy}
              onAddToFavorites={handleAddToFavorites}
              onRemoveFromFavorites={handleRemoveFromFavorites}
              onClearHistory={handleClearHistory}
              isFavorite={handleIsFavorite}
              maxItems={5}
            />
          </div>

          {/* Footer */}
          <footer className="mt-8 sm:mt-12 py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <p>
              Translator Pro - Modern translation with glassmorphism design
            </p>
            <p className="mt-2">
              Powered by Google Translate | Built with React & Tailwind CSS
            </p>
          </footer>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={handleSettingsClose}
        apiProvider={apiProvider}
        onApiProviderChange={handleApiProviderChange}
        historyLimit={historyLimit}
        onHistoryLimitChange={handleHistoryLimitChange}
        autoCopy={autoCopy}
        onAutoCopyChange={handleAutoCopyChange}
        historyEnabled={historyEnabled}
        onHistoryEnabledChange={handleHistoryEnabledChange}
        onSiteLanguageChange={handleUiLanguageChange}
        uiLanguage={uiLanguage}
        t={t}
      />
    </div>
  );
}

export default App;
