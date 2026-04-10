import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

/**
 * Custom hook for managing theme (light/dark/system)
 * @returns {Object} - Theme state and controls
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState('system');
  const [isDark, setIsDark] = useState(false);

  // Apply theme to document
  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    const body = document.body;
    
    if (themeValue === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
      setIsDark(systemPrefersDark);
    } else {
      const isDarkTheme = themeValue === 'dark';
      if (isDarkTheme) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
      setIsDark(isDarkTheme);
    }
  };

  // Initialize theme from storage
  useEffect(() => {
    const savedTheme = storage.getTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Change theme
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    storage.setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  };
};
