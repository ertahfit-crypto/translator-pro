import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Monitor, Smartphone } from 'lucide-react';

/**
 * Clean Header component with Logo, Theme Toggle, and Settings Icon
 */
const Header = ({ 
  darkMode, 
  onToggleTheme, 
  onSettingsClick,
  t
}) => {
  // Device detection
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10"
    >
      <div className="glass dark:glass-dark rounded-2xl shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-6">
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
          <div className="flex items-center gap-2">
            {/* Desktop Indicator */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                opacity: isMobile ? 0.3 : 1,
                scale: isMobile ? 0.8 : 1,
                filter: isMobile ? 'none' : 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
              }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-lg cursor-pointer"
              title="Desktop Mode"
            >
              <Monitor className={`w-5 h-5 transition-colors duration-300 ${
                isMobile ? 'text-gray-400 dark:text-gray-600' : 'text-blue-500 dark:text-blue-400'
              }`} />
            </motion.button>
            
            {/* Mobile Indicator */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                opacity: isMobile ? 1 : 0.3,
                scale: isMobile ? 1 : 0.8,
                filter: isMobile ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
              }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-lg cursor-pointer"
              title="Mobile Mode"
            >
              <Smartphone className={`w-5 h-5 transition-colors duration-300 ${
                isMobile ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'
              }`} />
            </motion.button>
            {/* Theme toggle */}
            <motion.button
              whileHover={{ 
                scale: 1.15, 
                rotate: 180,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-white/30 hover:to-white/10 dark:hover:from-white/20 dark:hover:to-white/5 transition-all duration-300 shadow-md hover:shadow-lg"
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
              whileHover={{ 
                scale: 1.15, 
                rotate: 180,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.9 }}
              onClick={onSettingsClick}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-white/30 hover:to-white/10 dark:hover:from-white/20 dark:hover:to-white/5 transition-all duration-300 shadow-md hover:shadow-lg"
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
