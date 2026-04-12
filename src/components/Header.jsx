'use client';

import React from 'react';
import { Settings, Globe } from 'lucide-react';

/**
 * Clean Header component with Logo and Settings Icon
 */
const Header = ({ 
  darkMode, 
  onToggleTheme, 
  onSettingsClick,
  t
}) => {
  return (
    <header className="relative z-10">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {t ? t('title') : 'Translator Pro'}
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                {t ? t('subtitle') : 'Professional translation tool'}
              </p>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title={t ? t('settings') : 'Settings'}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
