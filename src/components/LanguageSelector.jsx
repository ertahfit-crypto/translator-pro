'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass dark:glass-dark rounded-2xl shadow-lg border border-white/10 dark:border-white/5 p-3 sm:p-4"
    >
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Source Language Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4" />
              <span>From</span>
              {isDetecting && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xs text-blue-500"
                >
                  Detecting...
                </motion.div>
              )}
              {detectedLanguage && sourceLang === 'auto' && !isDetecting && (
                <span className="text-xs text-green-500">
                  ({languages[detectedLanguage] || detectedLanguage})
                </span>
              )}
            </div>
          </label>
          <select
            value={sourceLang}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 
                     border border-gray-200 dark:border-gray-700 
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
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
        <motion.div className="flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSwap}
            disabled={disabled}
            className={`p-3 rounded-xl transition-all duration-200 glow-blue ${
              disabled
                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl'
            }`}
            title="Swap languages"
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileTap={{ rotate: 180 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ArrowLeftRight
                className={`w-5 h-5 ${
                  disabled || sourceLang === 'auto'
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-white'
                }`}
              />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Target Language Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4" />
              <span>To</span>
            </div>
          </label>
          <select
            value={targetLang}
            onChange={(e) => onTargetChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 
                     border border-gray-200 dark:border-gray-700 
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
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
    </motion.div>
  );
};

export default LanguageSelector;
