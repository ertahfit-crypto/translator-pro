'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Star, 
  Trash2, 
  Copy, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';

/**
 * History bar component for displaying translation history and favorites
 */
const HistoryBar = ({
  history = [],
  favorites = [],
  onSelectHistory = () => {},
  onCopy = () => {},
  onAddToFavorites = () => {},
  onRemoveFromFavorites = () => {},
  onClearHistory = () => {},
  isFavorite = () => false,
  maxItems = 5
}) => {
  const [showFavorites, setShowFavorites] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Handle copy with feedback
  const handleCopy = async (text, id) => {
    try {
      await onCopy(text);
      // Visual feedback could be added here
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (item, e) => {
    e.stopPropagation();
    
    if (typeof isFavorite === 'function' ? isFavorite(item) : false) {
      onRemoveFromFavorites(item);
    } else {
      onAddToFavorites(item);
    }
  };

  // Render history item
  const renderHistoryItem = (item, index) => {
    const isFav = typeof isFavorite === 'function' ? isFavorite(item) : false;
    const isHistoryItem = history.some(h => h.id === item.id);
    
    return (
      <motion.div
        key={item.id || index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onSelectHistory(item)}
        className="p-2 sm:p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 
                 border border-gray-200 dark:border-gray-700 
                 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50
                 transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(item.timestamp)}
              </span>
              {isFav && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-900 dark:text-white truncate">
                {item.sourceText}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <ArrowRight className="w-3 h-3" />
                <p className="truncate">{item.targetText}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            {/* Favorite Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleFavoriteToggle(item, e)}
              className={`p-1.5 rounded transition-colors ${
                isFav
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Copy Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(item.targetText, item.id);
              }}
              className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 
                       text-gray-600 dark:text-gray-400 
                       hover:bg-gray-200 dark:hover:bg-gray-600 
                       transition-colors"
              title="Copy translation"
            >
              <Copy className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  const itemsToShow = showFavorites ? favorites : history.slice(0, maxItems);
  const hasItems = itemsToShow.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="glass dark:glass-dark rounded-2xl shadow-lg border border-white/10 dark:border-white/5"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {showFavorites ? 'Favorites' : 'Recent History'}
            </h3>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {itemsToShow.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle between History and Favorites */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showFavorites
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Star className="w-4 h-4" />
            </motion.button>

            {/* Clear History */}
            {!showFavorites && history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClearHistory}
                className="p-1.5 rounded bg-red-100 dark:bg-red-900/30 
                         text-red-600 dark:text-red-400 
                         hover:bg-red-200 dark:hover:bg-red-900/50 
                         transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}

            {/* Expand/Collapse */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 
                       text-gray-600 dark:text-gray-400 
                       hover:bg-gray-200 dark:hover:bg-gray-600 
                       transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {(hasItems || isExpanded) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4 space-y-2 max-h-64 overflow-y-auto">
              {hasItems ? (
                <AnimatePresence mode="popLayout">
                  {itemsToShow.map((item, index) => renderHistoryItem(item, index))}
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-gray-500 dark:text-gray-400">
                    {showFavorites ? (
                      <>
                        <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No favorites yet</p>
                        <p className="text-xs mt-1">Star translations to save them here</p>
                      </>
                    ) : (
                      <>
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No translation history</p>
                        <p className="text-xs mt-1">Start translating to see history</p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryBar;
