package com.translator.service;

import org.springframework.stereotype.Service;

@Service
public class TranslationService {
    
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }
        
        // Mock translation for demonstration
        // In a real application, you would integrate with a translation API
        return String.format("[Translated from %s to %s]: %s", 
                           sourceLanguage, targetLanguage, text);
    }
}
