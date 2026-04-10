import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Globe, Settings, ChevronDown } from 'lucide-react';

/**
 * Header component with theme switcher and app title
 */
const Header = ({ 
  darkMode, 
  onToggleTheme, 
  onSettingsClick,
  t,
  changeUiLanguage,
  getAvailableUiLanguages,
  uiLanguage
}) => {
  console.log('Header render, darkMode:', darkMode);
  
  const [uiLangMenuOpen, setUiLangMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10"
    >
      <div className="glass dark:glass-dark rounded-2xl shadow-lg border border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between p-4 md:p-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
            >
              <Globe className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Theme Switcher */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-white/20 transition-all duration-300"
              title={t('toggleTheme')}
            >
              <motion.div
                animate={{ rotate: darkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </motion.div>
            </motion.button>

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettingsClick}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-white/20 transition-all duration-300"
              title={t('settings')}
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
