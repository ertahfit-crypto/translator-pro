import { useState, useEffect } from 'react';
import { translations, uiLanguages } from '../locales/translations';

export const useLocalization = () => {
  const [uiLanguage, setUiLanguage] = useState('ru');

  // Load UI language from localStorage on mount
  useEffect(() => {
    try {
      const savedUiLanguage = localStorage.getItem('translator_pro_ui_language');
      if (savedUiLanguage && translations[savedUiLanguage]) {
        setUiLanguage(savedUiLanguage);
      }
    } catch (err) {
      console.error('Failed to load UI language from localStorage:', err);
    }
  }, []);

  // Save UI language to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('translator_pro_ui_language', uiLanguage);
    } catch (err) {
      console.error('Failed to save UI language to localStorage:', err);
    }
  }, [uiLanguage]);

  // Get translation for a key
  const t = (key) => {
    return translations[uiLanguage]?.[key] || translations.en[key] || key;
  };

  // Change UI language
  const changeUiLanguage = (language) => {
    if (translations[language]) {
      setUiLanguage(language);
    }
  };

  // Get available UI languages
  const getAvailableUiLanguages = () => {
    return Object.keys(uiLanguages).map(code => ({
      code,
      name: uiLanguages[code]
    }));
  };

  return {
    uiLanguage,
    t,
    changeUiLanguage,
    getAvailableUiLanguages,
    translations: translations[uiLanguage] || translations.en
  };
};
