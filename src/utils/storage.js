// LocalStorage utilities for Translator Pro

const STORAGE_KEYS = {
  TRANSLATION_HISTORY: 'translator_pro_history',
  FAVORITES: 'translator_pro_favorites',
  THEME: 'translator_pro_theme',
  SETTINGS: 'translator_pro_settings'
};

/**
 * Storage utility functions
 */
export const storage = {
  /**
   * Get translation history from localStorage
   * @returns {Array} - Array of translation history items
   */
  getHistory() {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.TRANSLATION_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading history from storage:', error);
      return [];
    }
  },

  /**
   * Save translation to history (max 5 items)
   * @param {Object} translation - Translation object
   */
  saveToHistory(translation) {
    try {
      const history = this.getHistory();
      
      // Add new translation to the beginning
      const newHistory = [translation, ...history];
      
      // Keep only last 5 items
      const limitedHistory = newHistory.slice(0, 5);
      
      localStorage.setItem(STORAGE_KEYS.TRANSLATION_HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving history to storage:', error);
    }
  },

  /**
   * Clear translation history
   */
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSLATION_HISTORY);
    } catch (error) {
      console.error('Error clearing history from storage:', error);
    }
  },

  /**
   * Get favorite translations
   * @returns {Array} - Array of favorite translation items
   */
  getFavorites() {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error reading favorites from storage:', error);
      return [];
    }
  },

  /**
   * Add translation to favorites
   * @param {Object} translation - Translation object
   */
  addToFavorites(translation) {
    try {
      const favorites = this.getFavorites();
      
      // Check if already exists
      const exists = favorites.some(fav => 
        fav.sourceText === translation.sourceText && 
        fav.targetText === translation.targetText
      );
      
      if (!exists) {
        favorites.push(translation);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  },

  /**
   * Remove translation from favorites
   * @param {Object} translation - Translation object to remove
   */
  removeFromFavorites(translation) {
    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter(fav => 
        !(fav.sourceText === translation.sourceText && 
          fav.targetText === translation.targetText)
      );
      
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filteredFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  },

  /**
   * Check if translation is in favorites
   * @param {Object} translation - Translation object to check
   * @returns {boolean}
   */
  isFavorite(translation) {
    try {
      const favorites = this.getFavorites();
      return favorites.some(fav => 
        fav.sourceText === translation.sourceText && 
        fav.targetText === translation.targetText
      );
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  /**
   * Get theme preference
   * @returns {string} - 'light', 'dark', or 'system'
   */
  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'system';
    } catch (error) {
      console.error('Error reading theme from storage:', error);
      return 'system';
    }
  },

  /**
   * Save theme preference
   * @param {string} theme - Theme preference
   */
  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  },

  /**
   * Get user settings
   * @returns {Object} - User settings object
   */
  getSettings() {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {
        autoDetect: true,
        autoSpeak: false,
        showHistory: true,
        maxHistoryItems: 5
      };
    } catch (error) {
      console.error('Error reading settings from storage:', error);
      return {
        autoDetect: true,
        autoSpeak: false,
        showHistory: true,
        maxHistoryItems: 5
      };
    }
  },

  /**
   * Save user settings
   * @param {Object} settings - Settings object
   */
  setSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to storage:', error);
    }
  }
};
