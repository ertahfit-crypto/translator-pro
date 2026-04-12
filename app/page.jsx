'use client';

import React, { useState, useEffect } from 'react';

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

  async translate(text, from, to, onProgress) {
    // Simulate translation with progress
    const chunks = [];
    const chunkSize = 50;
    
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    let translatedText = '';
    
    for (let i = 0; i < chunks.length; i++) {
      // Simulate translation delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simple mock translation (in real app, use actual API)
      const chunkTranslation = `[${to.toUpperCase()}] ${chunks[i]}`;
      translatedText += chunkTranslation;
      
      if (onProgress) {
        onProgress(translatedText, i + 1, chunks.length);
      }
    }

    return { translatedText };
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
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [historyLimit] = useState(5);

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

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('translator_history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to load history');
        }
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && historyEnabled) {
      localStorage.setItem('translator_history', JSON.stringify(history.slice(0, historyLimit)));
    }
  }, [history, historyLimit, historyEnabled]);

  // Handle translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setTargetText('');

    try {
      const result = await translationService.translate(
        sourceText, 
        sourceLang, 
        targetLang, 
        (partialText) => setTargetText(partialText)
      );

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

  const sortedLanguages = Object.entries(languages).sort((a, b) => {
    return a[1].localeCompare(b[1]);
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Translator Pro</h1>
          <p className="text-gray-600">Professional translation tool</p>
        </div>

        {/* Language Selector */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Source Language */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                title="Swap languages"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* Target Language */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortedLanguages.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Translation Boxes */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Source Text */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Source Text</h3>
                <button
                  onClick={() => handleCopy(sourceText)}
                  disabled={!sourceText.trim()}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Copy text"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
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
                className="w-full h-32 p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={isTranslating}
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">{sourceText.length} characters</div>
                <button
                  onClick={handleTranslate}
                  disabled={!sourceText.trim() || isTranslating}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  {isTranslating ? (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Translating...</span>
                    </div>
                  ) : (
                    'Translate'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Target Text */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Translation</h3>
                <button
                  onClick={() => handleCopy(targetText)}
                  disabled={!targetText.trim()}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Copy translation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={targetText}
                  readOnly
                  placeholder="Translation will appear here..."
                  className="w-full h-32 p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 resize-none cursor-default transition-all duration-200"
                />
                {isTranslating && (
                  <div className="absolute top-4 right-4">
                    <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">{targetText.length} characters</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-600 text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors p-2"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent History</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                {history.length}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryItemClick(item)}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900 truncate">{item.sourceText}</p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <p className="truncate">{item.targetText}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.targetText);
                      }}
                      className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Copy translation"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
