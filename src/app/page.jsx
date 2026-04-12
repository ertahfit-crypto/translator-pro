'use client';

import './globals.css';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Copy, Globe, Loader2, RefreshCw, Settings, X, Clock, Star } from 'lucide-react';

// Translation service
const translationService = {
  async getLanguages() {
    return {
      'ru': 'Russian',
      'en': 'English',
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
  },

  async translate(text, from, to) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock translation - in real app use actual translation API
    return `[${to.toUpperCase()}] ${text}`;
  }
};

// Main App Component
function App() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('ru');
  const [targetLang, setTargetLang] = useState('en');
  const [languages, setLanguages] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [historyLimit, setHistoryLimit] = useState(5);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const langs = await translationService.getLanguages();
        setLanguages(langs);
      } catch (error) {
        setError('Failed to load languages');
      }
    };
    loadLanguages();
  }, []);

  // Load saved data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('translator_history');
      const savedFavorites = localStorage.getItem('translator_favorites');
      const savedSettings = localStorage.getItem('translator_settings');
      
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to load history');
        }
      }
      
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error('Failed to load favorites');
        }
      }
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setAutoCopy(settings.autoCopy || false);
          setHistoryEnabled(settings.historyEnabled !== false);
          setHistoryLimit(settings.historyLimit || 5);
        } catch (e) {
          console.error('Failed to load settings');
        }
      }
    }
  }, []);

  // Save history
  useEffect(() => {
    if (typeof window !== 'undefined' && historyEnabled) {
      localStorage.setItem('translator_history', JSON.stringify(history.slice(0, historyLimit)));
    }
  }, [history, historyLimit, historyEnabled]);

  // Save favorites
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('translator_favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Save settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settings = {
        autoCopy,
        historyEnabled,
        historyLimit
      };
      localStorage.setItem('translator_settings', JSON.stringify(settings));
    }
  }, [autoCopy, historyEnabled, historyLimit]);

  // Handle translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setTargetText('');

    try {
      const result = await translationService.translate(sourceText, sourceLang, targetLang);
      setTargetText(result);

      // Add to history
      if (historyEnabled) {
        const newEntry = {
          id: Date.now(),
          sourceText,
          targetText: result,
          sourceLang,
          targetLang,
          timestamp: new Date().toISOString()
        };
        setHistory(prev => [newEntry, ...prev].slice(0, historyLimit));
      }

      // Auto copy
      if (autoCopy) {
        await navigator.clipboard.writeText(result);
      }
    } catch (error) {
      setError('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle swap languages
  const handleSwapLanguages = () => {
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

  // Handle copy
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Copy failed');
      return false;
    }
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

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('translator_history');
  };

  const sortedLanguages = Object.entries(languages).sort((a, b) => {
    return a[1].localeCompare(b[1]);
  });

  const itemsToShow = showFavorites ? favorites : history.slice(0, historyLimit);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Translator Pro</h1>
                <p className="text-sm text-gray-600">Professional translation tool</p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-3 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors border border-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Language Selector */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Source Language */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-3">From</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {sortedLanguages.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleSwapLanguages}
                className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                title="Swap languages"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>

            {/* Target Language */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-3">To</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {sortedLanguages.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Translation Boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Source Text */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Source Text</h3>
              <button
                onClick={() => handleCopy(sourceText)}
                disabled={!sourceText.trim()}
                className="p-3 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
                title="Copy text"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              placeholder="Enter text to translate..."
              className="w-full h-48 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              disabled={isTranslating}
            />
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500 font-medium">{sourceText.length} characters</div>
              <button
                onClick={handleTranslate}
                disabled={!sourceText.trim() || isTranslating}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold flex items-center space-x-3"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  'Translate'
                )}
              </button>
            </div>
          </div>

          {/* Target Text */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Translation</h3>
              <button
                onClick={() => handleCopy(targetText)}
                disabled={!targetText.trim()}
                className="p-3 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
                title="Copy translation"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <textarea
                value={targetText}
                readOnly
                placeholder="Translation will appear here..."
                className="w-full h-48 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 resize-none cursor-default transition-all duration-200 text-base"
              />
              {isTranslating && (
                <div className="absolute top-6 right-6">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
            <div className="mt-6 text-sm text-gray-500 font-medium">{targetText.length} characters</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 rounded-xl bg-red-50 border border-red-200 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-red-700 font-semibold">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* History and Favorites */}
        {(history.length > 0 || favorites.length > 0) && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {showFavorites ? 'Favorites' : 'Recent History'}
                </h3>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium">
                  {itemsToShow.length}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {/* Toggle between History and Favorites */}
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                    showFavorites
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>

                {/* Clear History */}
                {!showFavorites && history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                    title="Clear history"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {itemsToShow.length > 0 ? (
                itemsToShow.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryItemClick(item)}
                    className="p-6 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500 font-medium">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                          {favorites.some(fav => fav.id === item.id) && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="space-y-3">
                          <p className="text-gray-900 font-medium">{item.sourceText}</p>
                          <div className="flex items-center space-x-3 text-gray-600">
                            <ArrowRight className="w-4 h-4" />
                            <p className="font-medium">{item.targetText}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Favorite Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            favorites.some(fav => fav.id === item.id)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={favorites.some(fav => fav.id === item.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-4 h-4 ${favorites.some(fav => fav.id === item.id) ? 'fill-current' : ''}`} />
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.targetText);
                          }}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Copy translation"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {showFavorites ? (
                      <>
                        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No favorites yet</p>
                        <p className="text-sm">Star translations to save them here</p>
                      </>
                    ) : (
                      <>
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No translation history</p>
                        <p className="text-sm">Start translating to see history</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-3 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors border border-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Auto Copy */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-gray-900">Auto Copy</div>
                  <div className="text-sm text-gray-600 mt-1">Copy translation result automatically</div>
                </div>
                <button
                  onClick={() => setAutoCopy(!autoCopy)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                    autoCopy ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      autoCopy ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* History Enabled */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-gray-900">Save History</div>
                  <div className="text-sm text-gray-600 mt-1">Keep translation history</div>
                </div>
                <button
                  onClick={() => setHistoryEnabled(!historyEnabled)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                    historyEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      historyEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* History Limit */}
              <div>
                <div className="text-base font-semibold text-gray-900 mb-4">History Limit</div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={historyLimit}
                    onChange={(e) => setHistoryLimit(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-base font-semibold text-gray-900 w-8 text-center">
                    {historyLimit}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
