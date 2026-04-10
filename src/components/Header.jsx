import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun } from 'lucide-react';

/**
 * Clean Header component with Logo, Theme Toggle, and Settings Icon
 */
const Header = ({ 
  darkMode, 
  onToggleTheme, 
  onSettingsClick,
  t
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10"
    >
      <div className="glass dark:glass-dark rounded-2xl shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between p-4 md:p-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
            >
              <span className="w-6 h-6 text-white font-bold text-lg">T</span>
            </motion.div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                {t ? t('title') : 'Translator Pro'}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {t ? t('subtitle') : 'Modern translation with glassmorphism'}
              </p>
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-white/20 transition-all duration-300"
              title={t ? t('toggleTheme') : 'Toggle theme'}
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
              title={t ? t('settings') : 'Settings'}
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
