'use client';

import React, { useState, useEffect } from 'react';
import Header from '../src/components/Header';
import LanguageSelector from '../src/components/LanguageSelector';
import TranslationBox from '../src/components/TranslationBox';
import HistoryBar from '../src/components/HistoryBar';
import SettingsModal from '../src/components/SettingsModal';
import { useLocalization } from '../src/hooks/useLocalization';
import { translationService } from '../src/services/translationService';

/**
 * Main App component - Translator Pro Application
 */
function App() {
  // Global UI language state
  const [uiLanguage, setUiLanguage] = useState('ru');
  
  // Localization hook
  const { t, changeUiLanguage, getAvailableUiLanguages } = useLocalization();
  
  // Theme state - always light mode
  const [darkMode, setDarkMode] = useState(false);

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

  // Force light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('translator_pro_theme', 'light');
  }, []);

  // Load saved data on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('translator_pro_theme');
      const savedHistory = localStorage.getItem('translator_history');
      const savedFavorites = localStorage.getItem('translator_favorites');
      const savedSettings = localStorage.getItem('translator_settings');

      // Always use light theme
      setDarkMode(false);

      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to load history:', e);
        }
      }

      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error('Failed to load favorites:', e);
        }
      }

      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setApiProvider(settings.apiProvider || 'google');
          setHistoryLimit(settings.historyLimit || 5);
          setAutoCopy(settings.autoCopy || false);
          setHistoryEnabled(settings.historyEnabled !== false);
        } catch (e) {
          console.error('Failed to load settings:', e);
        }
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settings = {
        apiProvider,
        historyLimit,
        autoCopy,
        historyEnabled
      };
      localStorage.setItem('translator_settings', JSON.stringify(settings));
    }
  }, [apiProvider, historyLimit, autoCopy, historyEnabled]);

  // Load languages on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const langs = await translationService.getLanguages();
        setLanguages(langs);
      } catch (error) {
        console.error('Failed to load languages:', error);
        setError(error.message);
      }
    };

    loadLanguages();
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && historyEnabled) {
      localStorage.setItem('translator_history', JSON.stringify(history.slice(0, historyLimit)));
    }
  }, [history, historyLimit, historyEnabled]);

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('translator_favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Handle translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setTargetText(''); // Clear previous translation

    try {
      let finalResult = null;

      // Progress callback for gradual text appearance like ChatGPT
      const onProgress = (partialText, currentChunk, totalChunks) => {
        setTargetText(partialText);
        console.log(`Progress: ${currentChunk}/${totalChunks} chunks, ${partialText.length} chars`);
      };

      const result = await translationService.translate(
        sourceText, 
        sourceLang, 
        targetLang, 
        onProgress
      );
      
      finalResult = result;
      setTargetText(result.translatedText); // Ensure final text is set

      // Add to history
      if (historyEnabled) {
        const newEntry = {
          id: Date.now(),
          sourceText,
          targetText: result.translatedText,
          sourceLang,
          targetLang,
          timestamp: new Date().toISOString()
        };
        setHistory(prev => [newEntry, ...prev].slice(0, historyLimit));
      }

      // Auto copy if enabled
      if (autoCopy) {
        try {
          await navigator.clipboard.writeText(result.translatedText);
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(error.message);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle text change
  const handleSourceTextChange = (text) => {
    setSourceText(text);
    setError(null);
  };

  // Handle swap languages
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;

    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  // Handle history item click
  const handleHistoryItemClick = (item) => {
    setSourceText(item.sourceText);
    setTargetText(item.targetText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
  };

  // Handle favorite toggle
  const handleToggleFavorite = (item) => {
    const exists = favorites.some(fav => fav.id === item.id);
    if (exists) {
      setFavorites(prev => prev.filter(fav => fav.id !== item.id));
    } else {
      setFavorites(prev => [...prev, item]);
    }
  };

  // Handle settings
  const handleToggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        darkMode={false}
        onToggleTheme={() => {}}
        onSettingsClick={handleSettingsClick}
        t={t}
      />

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Language Selector */}
          <div className="lg:col-span-1">
            <LanguageSelector
              sourceLang={sourceLang}
              targetLang={targetLang}
              onSourceLangChange={setSourceLang}
              onTargetLangChange={setTargetLang}
              onSwapLanguages={handleSwapLanguages}
              languages={languages}
              t={t}
            />
          </div>

          {/* Center Column - Translation Box */}
          <div className="lg:col-span-2">
            <TranslationBox
              sourceText={sourceText}
              targetText={targetText}
              sourceLang={sourceLang}
              targetLang={targetLang}
              isTranslating={isTranslating}
              onSourceTextChange={handleSourceTextChange}
              onTranslate={handleTranslate}
              onCopy={async (text) => {
                try {
                  await navigator.clipboard.writeText(text);
                  return true;
                } catch (err) {
                  console.error('Copy failed:', err);
                  return false;
                }
              }}
              error={error}
              clearError={() => setError(null)}
              t={t}
            />
          </div>
        </div>

        {/* History and Favorites */}
        <div className="mt-8">
          <HistoryBar
            history={history.slice(0, historyLimit)}
            favorites={favorites}
            onHistoryItemClick={handleHistoryItemClick}
            onToggleFavorite={handleToggleFavorite}
            t={t}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={handleCloseSettings}
        apiProvider={apiProvider}
        onApiProviderChange={setApiProvider}
        historyLimit={historyLimit}
        onHistoryLimitChange={setHistoryLimit}
        autoCopy={autoCopy}
        onAutoCopyChange={setAutoCopy}
        historyEnabled={historyEnabled}
        onHistoryEnabledChange={setHistoryEnabled}
        uiLanguage={uiLanguage}
        onUiLanguageChange={changeUiLanguage}
        availableUiLanguages={getAvailableUiLanguages()}
        t={t}
      />
    </div>
  );
}

export default App;
