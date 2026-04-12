'use client';

import React from 'react';
import { ArrowLeftRight, Languages } from 'lucide-react';

/**
 * Language selector component with swap functionality
 */
const LanguageSelector = ({
  sourceLang,
  targetLang,
  languages,
  onSourceChange,
  onTargetChange,
  onSwap,
  disabled = false,
  detectedLanguage = null,
  isDetecting = false
}) => {
  // Sort languages alphabetically (keeping 'auto' at top)
  const sortedLanguages = Object.entries(languages).sort(([a], [b]) => {
    if (a === 'auto') return -1;
    if (b === 'auto') return 1;
    return languages[a].localeCompare(languages[b]);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Source Language Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4" />
              <span>From</span>
              {isDetecting && (
                <div className="text-xs text-blue-500 animate-pulse">
                  Detecting...
                </div>
              )}
              {detectedLanguage && sourceLang === 'auto' && !isDetecting && (
                <span className="text-xs text-green-600">
                  ({languages[detectedLanguage] || detectedLanguage})
                </span>
              )}
            </div>
          </label>
          <select
            value={sourceLang}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 
                     text-gray-900 bg-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sortedLanguages
              .filter(([code]) => code !== 'auto') // Remove 'auto' from source languages
              .map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onSwap}
            disabled={disabled}
            className={`p-3 rounded-lg transition-all duration-200 ${
              disabled
                ? 'bg-gray-100 cursor-not-allowed opacity-50'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
            }`}
            title="Swap languages"
          >
            <ArrowLeftRight
              className={`w-5 h-5 ${
                disabled || sourceLang === 'auto'
                  ? 'text-gray-400'
                  : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Target Language Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4" />
              <span>To</span>
            </div>
          </label>
          <select
            value={targetLang}
            onChange={(e) => onTargetChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 
                     text-gray-900 bg-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sortedLanguages
              .filter(([code]) => code !== 'auto') // Remove 'auto' from target languages
              .map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
