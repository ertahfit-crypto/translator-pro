'use client';

import React, { useState } from 'react';
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
      <div
        key={item.id || index}
        onClick={() => onSelectHistory(item)}
        className="p-3 rounded-lg bg-white border border-gray-200 
                 cursor-pointer hover:bg-gray-50 hover:border-gray-300
                 transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {formatTime(item.timestamp)}
              </span>
              {isFav && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-900 truncate">
                {item.sourceText}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <ArrowRight className="w-3 h-3" />
                <p className="truncate">{item.targetText}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            {/* Favorite Toggle */}
            <button
              onClick={(e) => handleFavoriteToggle(item, e)}
              className={`p-1.5 rounded transition-colors ${
                isFav
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Copy Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(item.targetText, item.id);
              }}
              className="p-1.5 rounded bg-gray-100 
                       text-gray-600 
                       hover:bg-gray-200 
                       transition-colors"
              title="Copy translation"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const itemsToShow = showFavorites ? favorites : history.slice(0, maxItems);
  const hasItems = itemsToShow.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {showFavorites ? 'Favorites' : 'Recent History'}
            </h3>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
              {itemsToShow.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle between History and Favorites */}
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showFavorites
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Star className="w-4 h-4" />
            </button>

            {/* Clear History */}
            {!showFavorites && history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded bg-red-100 
                         text-red-600 
                         hover:bg-red-200 
                         transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded bg-gray-100 
                       text-gray-600 
                       hover:bg-gray-200 
                       transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {(hasItems || isExpanded) && (
        <div className="overflow-hidden">
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {hasItems ? (
              itemsToShow.map((item, index) => renderHistoryItem(item, index))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryBar;
