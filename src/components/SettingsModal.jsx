import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Globe, History, Copy, Trash2 } from 'lucide-react';

/**
 * Professional Settings Modal component
 */
const SettingsModal = ({ 
  isOpen, 
  onClose, 
  apiProvider, 
  onApiProviderChange,
  historyLimit,
  onHistoryLimitChange,
  autoCopy,
  onAutoCopyChange,
  historyEnabled,
  onHistoryEnabledChange,
  onSiteLanguageChange,
  uiLanguage,
  t
}) => {
  const [localHistoryLimit, setLocalHistoryLimit] = useState(historyLimit);
  const [localAutoCopy, setLocalAutoCopy] = useState(autoCopy);
  const [localHistoryEnabled, setLocalHistoryEnabled] = useState(historyEnabled);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      apiProvider,
      historyLimit,
      autoCopy,
      historyEnabled
    };
    localStorage.setItem('translator_pro_settings', JSON.stringify(settings));
  }, [apiProvider, historyLimit, autoCopy, historyEnabled]);

  const handleSave = () => {
    onHistoryLimitChange(localHistoryLimit);
    onAutoCopyChange(localAutoCopy);
    onHistoryEnabledChange(localHistoryEnabled);
    onClose();
  };

  const handleClearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-700 dark:text-white" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t ? t('settings') : 'Settings'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Settings Content */}
          <div className="space-y-6">
            {/* Site Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{t ? t('siteLanguage') : 'Site Language'}</span>
                </div>
              </label>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSiteLanguageChange('en')}
                  className={`w-full sm:flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    uiLanguage === 'en'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  English
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSiteLanguageChange('ru')}
                  className={`w-full sm:flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    uiLanguage === 'ru'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Русский
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSiteLanguageChange('uk')}
                  className={`w-full sm:flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    uiLanguage === 'uk'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Українська
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Change the interface language (buttons, labels, etc.)
              </p>
            </div>

            {/* API Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>{t ? t('apiSource') : 'API Source'}</span>
                </div>
              </label>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onApiProviderChange('google')}
                  className={`w-full sm:flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    apiProvider === 'google'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Google Translate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onApiProviderChange('libretranslate')}
                  className={`w-full sm:flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    apiProvider === 'libretranslate'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  LibreTranslate
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Choose your preferred translation API provider
              </p>
            </div>

            {/* History Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>{t ? t('historyLimit') : 'History Limit'}</span>
                </div>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={localHistoryLimit}
                  onChange={(e) => setLocalHistoryLimit(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-white w-12 text-center">
                  {localHistoryLimit}
                </span>
              </div>
            </div>

            {/* History Storage Toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <History className="w-4 h-4 text-gray-700 dark:text-white" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-white">
                      {t ? t('saveToRecentHistory') : 'Save to Recent History'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Keep recent translations in history for easy access
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localHistoryEnabled}
                  onChange={(e) => setLocalHistoryEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                           focus:ring-blue-500 focus:ring-2 dark:focus:ring-blue-600 
                           dark:bg-gray-700 dark:border-gray-600"
                />
              </label>
            </div>

            {/* Auto-Copy Switch */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Copy className="w-4 h-4 text-gray-700 dark:text-white" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-white">
                      {t ? t('autoCopy') : 'Auto-Copy'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Copy translation result to clipboard automatically
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLocalAutoCopy(!localAutoCopy)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    localAutoCopy ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: localAutoCopy ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </label>
            </div>

            {/* History Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>{t ? t('historyManager') : 'History Manager'}</span>
                </div>
              </label>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearAllData}
                className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500 text-white border border-red-500/20 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                {t ? t('clearTranslationHistory') : 'Clear Translation History'}
              </motion.button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Remove all saved translation history from this device
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                {t ? t('saveSettings') : 'Save Settings'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
