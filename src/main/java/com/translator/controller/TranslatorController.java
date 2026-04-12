package com.translator.controller;

import com.translator.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class TranslatorController {
    
    @Autowired
    private TranslationService translationService;
    
    @GetMapping("/")
    public String index() {
        return "index";
    }
    
    @PostMapping("/translate")
    public String translate(
            @RequestParam("text") String text,
            @RequestParam(value = "sourceLanguage", defaultValue = "English") String sourceLanguage,
            @RequestParam(value = "targetLanguage", defaultValue = "Spanish") String targetLanguage,
            Model model) {
        
        String translatedText = translationService.translate(text, sourceLanguage, targetLanguage);
        
        model.addAttribute("originalText", text);
        model.addAttribute("translatedText", translatedText);
        model.addAttribute("sourceLanguage", sourceLanguage);
        model.addAttribute("targetLanguage", targetLanguage);
        
        return "index";
    }
}
