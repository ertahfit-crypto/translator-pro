'use client';

import React, { useState } from 'react';
import { 
  Copy, 
  Volume2, 
  RotateCcw, 
  Loader2,
  Mic
} from 'lucide-react';

/**
 * Translation box component with text areas and controls
 */
const TranslationBox = ({
  sourceText,
  targetText,
  sourceLang,
  targetLang,
  languages,
  isTranslating,
  onSourceTextChange,
  onTranslate,
  onCopy,
  onSpeak,
  error,
  clearError,
  t
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Handle copy with feedback
  const handleCopy = async (text, type) => {
    if (!text?.trim()) return;
    
    setIsCopying(type);
    try {
      const success = await onCopy(text);
      if (success) {
        setTimeout(() => setIsCopying(null), 1000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setIsCopying(null);
    }
  };

  // Handle form submit to prevent page reload
  const handleSubmit = (e) => {
    e.preventDefault();
    onTranslate();
  };

  // Handle key press in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onTranslate();
    }
  };

  // Handle voice input using bulletproof Speech Recognition API
  const handleVoiceInput = () => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    // Create recognition instance immediately in onClick handler (iOS fix)
    const recognition = new SpeechRecognition();
    
    // Set language based on selected source language
    const langMap = { 
      'auto': 'en-US', 
      'ru': 'ru-RU', 
      'en': 'en-US', 
      'uk': 'uk-UA',
      'zh': 'zh-CN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'pt': 'pt-BR',
      'it': 'it-IT',
      'nl': 'nl-NL',
      'pl': 'pl-PL',
      'tr': 'tr-TR',
      'hi': 'hi-IN',
      'th': 'th-TH',
      'vi': 'vi-VN'
    };
    recognition.lang = langMap[sourceLang] || 'en-US';
    
    // Mobile-optimized settings
    recognition.continuous = false; // More stable on mobile
    recognition.interimResults = true; // Real-time text display
    recognition.maxAlternatives = 1; // Better accuracy
    
    let finalTranscript = '';
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsRecording(true);
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update source text with recognized speech in real-time
      const currentText = finalTranscript + interimTranscript;
      onSourceTextChange(currentText.trim());
      console.log('Recognized:', currentText);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please check your browser settings and allow microphone access.');
      } else if (event.error === 'no-speech') {
        console.log('No speech detected');
      } else if (event.error === 'audio-capture') {
        alert('Microphone not found or is being used by another application.');
      } else if (event.error === 'network') {
        alert('Network error occurred during speech recognition.');
      } else {
        alert('Speech recognition error: ' + event.error);
      }
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
      
      // Auto-translate when recording stops and we have text
      if (finalTranscript.trim()) {
        onSourceTextChange(finalTranscript.trim());
        setTimeout(() => onTranslate(), 500);
      }
    };
    
    // Start recognition immediately (iOS compatibility fix)
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      alert('Failed to start voice recognition. Please try again.');
      setIsRecording(false);
    }
  };

  // Handle speak directly with window.speechSynthesis
  const handleSpeak = (text, lang) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech not supported');
      return;
    }

    if (!text?.trim()) return;

    // Function to speak when voices are ready
    const speakWhenReady = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    };

    // Check if voices are already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      speakWhenReady();
    } else {
      // Wait for voices to load
      const voicesLoaded = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesLoaded);
        speakWhenReady();
      };
      window.speechSynthesis.addEventListener('voiceschanged', voicesLoaded);
      
      // Fallback timeout in case voiceschanged doesn't fire
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          speakWhenReady();
        }
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 transition-colors p-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="contents">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Source Text Box */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {t('sourceText')}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(sourceText, 'source')}
                    disabled={!(sourceText?.trim())}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isCopying === 'source'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Copy text"
                  >
                    {isCopying === 'source' ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Speak Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSpeak(sourceText, sourceLang === 'auto' ? 'en' : sourceLang); }}
                    disabled={!(sourceText?.trim()) || !sourceLang || sourceLang === 'auto'}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Speak text"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={isRecording}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? "Recording..." : "Voice input"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <textarea
                value={sourceText}
                onChange={(e) => onSourceTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('enterTextPlaceholder')}
                inputMode="text"
                enterKeyHint="done"
                className="w-full h-32 sm:h-40 lg:h-48 p-3 rounded-lg bg-gray-50 
                         border border-gray-200 
                         text-gray-900 placeholder-gray-500
                         resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-all duration-200"
                disabled={isTranslating}
              />

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {(sourceText || "").length} characters
                </div>
                <button
                  type="submit"
                  disabled={!(sourceText?.trim()) || isTranslating}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed 
                           text-white rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  {isTranslating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('translating')}</span>
                    </div>
                  ) : (
                    t('translate')
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Target Text Box */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {t('translation')}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(targetText, 'target')}
                    disabled={!(targetText?.trim())}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isCopying === 'target'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Copy translation"
                  >
                    {isCopying === 'target' ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Speak Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSpeak(targetText, targetLang); }}
                    disabled={!(targetText?.trim()) || !targetLang}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Speak translation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={targetText}
                  readOnly
                  placeholder={t('translationPlaceholder')}
                  inputMode="text"
                  enterKeyHint="done"
                  className="w-full h-32 sm:h-40 lg:h-48 p-3 rounded-lg bg-gray-50 
                           border border-gray-200 
                           text-gray-900 placeholder-gray-500
                           resize-none cursor-default
                           transition-all duration-200"
                />

                {/* Loading Indicator */}
                {isTranslating && (
                  <div className="absolute top-4 right-4">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                {(targetText || "").length} characters
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TranslationBox;
