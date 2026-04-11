import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Volume2, 
  Star, 
  RotateCcw, 
  Loader2
} from 'lucide-react';

/**
 * Translation box component with text areas and controls
 */
const TranslationBox = ({
  sourceText,
  targetText,
  sourceLang,
  targetLang,
  languages,
  isTranslating,
  onSourceTextChange,
  onTranslate,
  onCopy,
  onSpeak,
  error,
  clearError,
  t
}) => {
  const [isCopying, setIsCopying] = useState(false);

  // Handle copy with feedback
  const handleCopy = async (text, type) => {
    if (!text?.trim()) return;
    
    setIsCopying(type);
    try {
      const success = await onCopy(text);
      if (success) {
        setTimeout(() => setIsCopying(null), 1000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setIsCopying(null);
    }
  };

  // Handle form submit to prevent page reload
  const handleSubmit = (e) => {
    e.preventDefault();
    onTranslate();
  };

  // Handle key press in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onTranslate();
    }
  };

  // Handle speak directly with window.speechSynthesis
  const handleSpeak = (text, lang) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech not supported');
      return;
    }

    if (!text?.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl glass border border-red-500/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <button
                onClick={clearError}
                className="text-red-300 hover:text-red-200 transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="contents">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Source Text Box */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          >
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-white">
                  {t('sourceText')}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Copy Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(sourceText, 'source')}
                    disabled={!(sourceText?.trim())}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isCopying === 'source'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Copy text"
                  >
                    {isCopying === 'source' ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </motion.button>

                  {/* Speak Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSpeak(sourceText, sourceLang === 'auto' ? 'en' : sourceLang)}
                    disabled={!(sourceText?.trim()) || !sourceLang || sourceLang === 'auto'}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Speak text"
                  >
                    <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>

              <textarea
                value={sourceText}
                onChange={(e) => onSourceTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('enterTextPlaceholder')}
                className="w-full h-32 sm:h-40 lg:h-48 p-3 sm:p-4 rounded-lg bg-transparent 
                         border border-white/20 dark:border-white/10 
                         text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                         resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200"
                disabled={isTranslating}
              />

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(sourceText || "").length} characters
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!(sourceText?.trim()) || isTranslating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed 
                           text-white rounded-lg transition-all duration-200 font-medium text-sm glow-blue shadow-2xl"
                >
                  {isTranslating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('translating')}</span>
                    </div>
                  ) : (
                    t('translate')
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Target Text Box */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          >
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-white">
                  {t('translation')}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Copy Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(targetText, 'target')}
                    disabled={!(targetText?.trim())}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isCopying === 'target'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Copy translation"
                  >
                    {isCopying === 'target' ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </motion.button>

                  {/* Speak Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSpeak(targetText, targetLang)}
                    disabled={!(targetText?.trim()) || !targetLang}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Speak translation"
                  >
                    <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={targetText}
                  readOnly
                  placeholder={t('translationPlaceholder')}
                  className="w-full h-32 sm:h-40 lg:h-48 p-3 sm:p-4 rounded-lg bg-transparent 
                           border border-white/20 dark:border-white/10 
                           text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                           resize-none cursor-default
                           transition-all duration-200"
                />

                {/* Loading Indicator */}
                {isTranslating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </motion.div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {(targetText || "").length} characters
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};

export default TranslationBox;
