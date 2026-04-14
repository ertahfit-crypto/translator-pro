// Language data with flags/emojis
const languages = [
    { code: 'en', name: 'English', flag: 'en' },
    { code: 'es', name: 'Spanish', flag: 'es' },
    { code: 'fr', name: 'French', flag: 'fr' },
    { code: 'de', name: 'German', flag: 'de' },
    { code: 'it', name: 'Italian', flag: 'it' },
    { code: 'pt', name: 'Portuguese', flag: 'pt' },
    { code: 'ru', name: 'Russian', flag: 'ru' },
    { code: 'zh', name: 'Chinese', flag: 'zh' },
    { code: 'ja', name: 'Japanese', flag: 'ja' },
    { code: 'ko', name: 'Korean', flag: 'ko' },
    { code: 'ar', name: 'Arabic', flag: 'ar' },
    { code: 'hi', name: 'Hindi', flag: 'hi' },
    { code: 'th', name: 'Thai', flag: 'th' },
    { code: 'vi', name: 'Vietnamese', flag: 'vi' },
    { code: 'tr', name: 'Turkish', flag: 'tr' },
    { code: 'pl', name: 'Polish', flag: 'pl' },
    { code: 'nl', name: 'Dutch', flag: 'nl' },
    { code: 'sv', name: 'Swedish', flag: 'sv' },
    { code: 'da', name: 'Danish', flag: 'da' },
    { code: 'no', name: 'Norwegian', flag: 'no' },
    { code: 'fi', name: 'Finnish', flag: 'fi' },
    { code: 'el', name: 'Greek', flag: 'el' },
    { code: 'he', name: 'Hebrew', flag: 'he' },
    { code: 'cs', name: 'Czech', flag: 'cs' },
    { code: 'hu', name: 'Hungarian', flag: 'hu' },
    { code: 'ro', name: 'Romanian', flag: 'ro' },
    { code: 'uk', name: 'Ukrainian', flag: 'uk' },
    { code: 'bg', name: 'Bulgarian', flag: 'bg' },
    { code: 'hr', name: 'Croatian', flag: 'hr' },
    { code: 'sr', name: 'Serbian', flag: 'sr' },
    { code: 'sk', name: 'Slovak', flag: 'sk' },
    { code: 'sl', name: 'Slovenian', flag: 'sl' },
    { code: 'et', name: 'Estonian', flag: 'et' },
    { code: 'lv', name: 'Latvian', flag: 'lv' },
    { code: 'lt', name: 'Lithuanian', flag: 'lt' }
];

// Application state
let history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
let currentTranslation = null;
let showFavoritesOnly = false;
let tesseractWorker = null;
let cropper = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if all required elements exist
    if (!document.getElementById('translateBtn') || !document.getElementById('inputText')) {
        console.error('Required elements not found');
        return;
    }

    // Force voice loading
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    lucide.createIcons();
    loadHistory();
    setupEventListeners();
    updateCharacterCounter();
    setupAutoTranslate();
    loadSettings();

    // Hotkeys
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            translate();
        }
    });

    console.log("Script loaded successfully");
});

function setupEventListeners() {
    // Translation
    document.getElementById('translateBtn').addEventListener('click', translate);
    document.getElementById('swapBtn').addEventListener('click', swapLanguages);

    // Input controls
    document.getElementById('copyInputBtn').addEventListener('click', () => copyText('input'));
    document.getElementById('speakInputBtn').addEventListener('click', () => speakText('input'));
    document.getElementById('micBtn').addEventListener('click', startVoiceInput);
    document.getElementById('cameraBtn').addEventListener('click', startImageOCR);

    // Output controls
    document.getElementById('copyOutputBtn').addEventListener('click', () => copyText('output'));
    document.getElementById('speakOutputBtn').addEventListener('click', () => speakText('output'));

    // Character counter
    document.getElementById('inputText').addEventListener('input', function(e) {
        // Prevent typing beyond limit
        const maxLength = 800;
        if (e.target.value.length > maxLength) {
            e.target.value = e.target.value.substring(0, maxLength);
        }
        updateCharacterCounter();
    });

    // Image input handler
    document.getElementById('imageInput').addEventListener('change', handleImageSelection);
    
    // Enter key handler
    document.getElementById('inputText').addEventListener('keydown', handleEnterKey);

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);

    // Settings controls
    document.getElementById('autoTranslate').addEventListener('change', saveAutoTranslate);
    document.getElementById('clearHistoryBtn').addEventListener('click', showClearHistoryModal);
    document.getElementById('translateOnEnter').addEventListener('change', saveTranslateOnEnter);
    document.getElementById('showHistory').addEventListener('change', saveShowHistory);
    
    // Voice settings
    document.getElementById('voiceSpeed').addEventListener('input', function(e) {
        document.getElementById('voiceSpeedValue').textContent = e.target.value;
    });
    
    document.getElementById('voicePitch').addEventListener('input', function(e) {
        document.getElementById('voicePitchValue').textContent = e.target.value;
    });

    // Clear history modal controls
    document.getElementById('cancelClearBtn').addEventListener('click', hideClearHistoryModal);
    document.getElementById('confirmClearBtn').addEventListener('click', confirmClearHistory);
    document.getElementById('clearHistoryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideClearHistoryModal();
        }
    });

    // History controls
    document.getElementById('historyHeader').addEventListener('click', function(e) {
        // Prevent toggle when clicking on buttons
        if (e.target.closest('button')) return;
        toggleHistory();
    });
    document.getElementById('toggleHistoryBtn').addEventListener('click', toggleHistory);
    document.getElementById('favoriteFilterBtn').addEventListener('click', toggleFavoriteFilter);

    // Modal close on outside click
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettings();
        }
    });

    // Crop modal controls
    document.getElementById('closeCropModalBtn').addEventListener('click', closeCropModal);
    document.getElementById('cancelCropBtn').addEventListener('click', closeCropModal);
    document.getElementById('scanSelectionBtn').addEventListener('click', scanCroppedSelection);

    // Crop modal close on outside click
    document.getElementById('imageCropModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCropModal();
        }
    });
}

// Settings Functions
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveTranslateOnEnter() {
    const enabled = document.getElementById('translateOnEnter').checked;
    localStorage.setItem('translateOnEnter', enabled);
}

function saveShowHistory() {
    const showHistory = document.getElementById('showHistory').checked;
    localStorage.setItem('showHistory', showHistory);
    
    // Show/hide history section
    const historySection = document.getElementById('historySection');
    if (showHistory) {
        historySection.style.display = 'block';
    } else {
        historySection.style.display = 'none';
    }
}

function handleEnterKey(event) {
    // Check if Translate on Enter is enabled
    const translateOnEnter = document.getElementById('translateOnEnter').checked;
    
    // If Enter is pressed without Shift and Translate on Enter is enabled
    if (event.key === 'Enter' && !event.shiftKey && translateOnEnter) {
        event.preventDefault(); // Prevent default Enter behavior (new line)
        translate();
    }
}

function saveAutoTranslate() {
    const enabled = document.getElementById('autoTranslate').checked;
    localStorage.setItem('autoTranslate', enabled);
    if (enabled) {
        setupAutoTranslate();
    } else {
        removeAutoTranslate();
    }
}

let autoTranslateTimeout;
function setupAutoTranslate() {
    const inputText = document.getElementById('inputText');
    inputText.addEventListener('input', handleAutoTranslate);
}

function removeAutoTranslate() {
    const inputText = document.getElementById('inputText');
    inputText.removeEventListener('input', handleAutoTranslate);
}

function handleAutoTranslate() {
    clearTimeout(autoTranslateTimeout);
    const enabled = document.getElementById('autoTranslate').checked;
    if (enabled) {
        autoTranslateTimeout = setTimeout(() => {
            const text = document.getElementById('inputText').value.trim();
            if (text) {
                translate();
            }
        }, 500);
    }
}

function loadSettings() {
    // Load Auto-Translate
    const savedAutoTranslate = localStorage.getItem('autoTranslate');
    if (savedAutoTranslate) {
        document.getElementById('autoTranslate').checked = savedAutoTranslate === 'true';
    }

    // Load Translate on Enter
    const savedTranslateOnEnter = localStorage.getItem('translateOnEnter');
    if (savedTranslateOnEnter) {
        document.getElementById('translateOnEnter').checked = savedTranslateOnEnter === 'true';
    }

    // Load Show History
    const savedShowHistory = localStorage.getItem('showHistory');
    if (savedShowHistory !== null) {
        document.getElementById('showHistory').checked = savedShowHistory === 'true';
        
        // Apply history visibility
        const historySection = document.getElementById('historySection');
        if (savedShowHistory === 'true') {
            historySection.style.display = 'block';
        } else {
            historySection.style.display = 'none';
        }
    } else {
        // Default to true if not set
        document.getElementById('showHistory').checked = true;
        localStorage.setItem('showHistory', 'true');
    }

    // Load history state
    const savedHistoryOpen = localStorage.getItem('historyOpen');
    if (savedHistoryOpen === 'true') {
        const content = document.getElementById('historyContent');
        const chevron = document.getElementById('historyChevron');
        content.classList.remove('max-h-0');
        content.classList.add('max-h-96');
        chevron.style.transform = 'rotate(180deg)';
    }
}

function updateCharacterCounter() {
    const text = document.getElementById('inputText').value;
    const counter = document.getElementById('charCounter');
    const length = text.length;
    const maxLength = 800;
    const percentage = (length / maxLength) * 100;
    
    // Update counter text with new format
    counter.textContent = `Characters: ${length} (${Math.round(percentage)}%)`;
    
    // Update counter color based on percentage with smooth gradient
    counter.className = 'text-sm transition-colors duration-300 ';
    
    if (percentage >= 85) {
        counter.className += 'text-red-500 font-semibold';
    } else if (percentage >= 50) {
        counter.className += 'text-orange-500';
    } else {
        counter.className += 'text-green-500';
    }
}

function swapLanguages() {
    const sourceSelect = document.getElementById('sourceLanguage');
    const targetSelect = document.getElementById('targetLanguage');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');

    // Save current text values
    const currentInput = inputText.value;
    const currentOutput = outputText.textContent;

    // Don't allow 'auto' as target language
    if (targetSelect.value === 'auto') {
        showToast('Cannot swap to auto-detect language');
        return;
    }

    // Swap languages
    const tempLang = sourceSelect.value;
    sourceSelect.value = targetSelect.value;
    targetSelect.value = tempLang === 'auto' ? 'en' : tempLang;

    // Swap text
    inputText.value = currentOutput;
    outputText.textContent = currentInput;

    // Update character counter
    updateCharacterCounter();

    showToast('Languages swapped');
}

async function translate() {
    const inputText = document.getElementById('inputText').value.trim();
    const sourceLang = document.getElementById('sourceLanguage').value;
    const targetLang = document.getElementById('targetLanguage').value;

    // Debug logging
    console.log('Translation request:', { inputText, sourceLang, targetLang });

    if (!inputText || inputText.trim() === '') {
        displayTranslation('Please enter text to translate');
        return;
    }

    const btn = document.getElementById('translateBtn');
    btn.textContent = 'Translating...';
    btn.disabled = true;

    try {
        // Google Translate API URL - always include sl parameter
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(inputText)}`;
        
        console.log('API URL:', url);
            
        const result = await fetch(url);
        
        // Check if response is ok
        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }
        
        const data = await result.json();
        
        console.log('API Response:', data);

        if (data && Array.isArray(data) && data.length > 0 && data[0] && Array.isArray(data[0]) && data[0].length > 0 && data[0][0] && data[0][0][0]) {
            const translatedText = data[0][0][0];
            // Get detected language if auto was used (Google returns it in data[2])
            const detectedLang = sourceLang === 'auto' && data[2] ? data[2] : sourceLang;
            console.log('Translation successful:', translatedText);
            displayTranslation(translatedText);
            addToHistory(inputText, translatedText, detectedLang, targetLang);
            currentTranslation = { input: inputText, output: translatedText, sourceLang: detectedLang, targetLang };
        } else {
            console.error('Invalid API response structure:', data);
            console.error('Response analysis:', {
                hasData: !!data,
                isArray: Array.isArray(data),
                dataLength: data?.length,
                hasData0: !!(data && data[0]),
                data0IsArray: Array.isArray(data[0]),
                data0Length: data[0]?.length,
                hasData00: !!(data[0] && data[0][0]),
                hasData000: !!(data[0] && data[0][0] && data[0][0][0])
            });
            displayTranslation('Translation error');
        }
    } catch (error) {
        console.error('API Error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText
        });
        displayTranslation('Translation error');
    } finally {
        btn.textContent = 'Translate';
        btn.disabled = false;
    }
}

function displayTranslation(text) {
    const outputElement = document.getElementById('outputText');
    outputElement.textContent = text;
}

function copyText(type) {
    let textToCopy = '';

    if (type === 'input') {
        textToCopy = document.getElementById('inputText').value;
    } else if (type === 'output') {
        textToCopy = document.getElementById('outputText').textContent;
    }

    if (textToCopy && textToCopy.trim()) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy');
        });
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg';
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function speakText(type) {
    if (!('speechSynthesis' in window)) {
        showToast('Text-to-speech not supported in your browser');
        return;
    }

    // Check if currently speaking, then stop
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        // Remove visual feedback from both buttons
        document.querySelectorAll('.speak-btn-active').forEach(btn => {
            btn.classList.remove('speak-btn-active', 'bg-blue-600', 'text-white');
            btn.classList.add('hover:bg-gray-100');
        });
        return;
    }

    let textToSpeak = '';
    let lang = '';

    if (type === 'input') {
        textToSpeak = document.getElementById('inputText').value;
        lang = document.getElementById('sourceLanguage').value;
    } else if (type === 'output') {
        textToSpeak = document.getElementById('outputText').textContent;
        lang = document.getElementById('targetLanguage').value;
    }

    if (!textToSpeak || !textToSpeak.trim()) {
        showToast('No text to speak');
        return;
    }

    // Language code mapping for better voice selection
    const langMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        'th': 'th-TH',
        'vi': 'vi-VN',
        'tr': 'tr-TR',
        'pl': 'pl-PL',
        'nl': 'nl-NL',
        'sv': 'sv-SE',
        'da': 'da-DK',
        'no': 'no-NO',
        'fi': 'fi-FI',
        'el': 'el-GR',
        'he': 'he-IL',
        'cs': 'cs-CZ',
        'hu': 'hu-HU',
        'ro': 'ro-RO',
        'uk': 'uk-UA',
        'bg': 'bg-BG',
        'hr': 'hr-HR',
        'sr': 'sr-RS',
        'sk': 'sk-SK',
        'sl': 'sl-SI',
        'et': 'et-EE',
        'lv': 'lv-LV',
        'lt': 'lt-LT'
    };

    const properLang = langMap[lang] || lang;

    function speakWithVoices() {
        try {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            // Get available voices and find the best match
            const voices = window.speechSynthesis.getVoices();
            let selectedVoice = null;
            
            // Smart voice selection - try to find voice by language code inclusion
            if (voices.length > 0) {
                selectedVoice = voices.find(voice => 
                    voice.lang.toLowerCase().includes(properLang.toLowerCase().split('-')[0])
                ) || voices.find(voice => 
                    voice.lang.toLowerCase().includes(lang.toLowerCase())
                ) || voices[0]; // fallback to first available voice
            }
            
            // Add visual feedback to the correct button
            const buttonId = type === 'input' ? 'speakInputBtn' : 'speakOutputBtn';
            const button = document.getElementById(buttonId);
            
            if (!button) return;
            
            button.classList.add('speak-btn-active', 'bg-blue-600', 'text-white');
            button.classList.remove('hover:bg-gray-100');
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.add('text-white');
                icon.classList.remove('text-gray-600');
            }
            
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = properLang;
            utterance.rate = parseFloat(document.getElementById('voiceSpeed').value);
            utterance.pitch = parseFloat(document.getElementById('voicePitch').value);
            utterance.volume = 1;
            
            // Assign the selected voice
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            // Remove visual feedback when speech ends
            utterance.onend = () => {
                if (button) {
                    button.classList.remove('speak-btn-active', 'bg-blue-600', 'text-white');
                    button.classList.add('hover:bg-gray-100');
                    const icon = button.querySelector('i');
                    if (icon) {
                        icon.classList.remove('text-white');
                        icon.classList.add('text-gray-600');
                    }
                }
            };
            
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech synthesis error:', error);
            // Only show error if no voices are available at all
            if (window.speechSynthesis.getVoices().length === 0) {
                showToast('Your browser doesn\'t support text-to-speech');
            }
        }
    }

    // Check if voices are loaded, wait for them if needed
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = speakWithVoices;
        // Also try to load voices manually
        if (speechSynthesis.onvoiceschanged !== null) {
            speechSynthesis.onvoiceschanged();
        }
    } else {
        speakWithVoices();
    }
}

let currentRecognition = null;
let isRecording = false;

function startVoiceInput() {
    if (isRecording) {
        stopVoiceInput();
        return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        showToast('Speech recognition not supported in your browser');
        return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        currentRecognition = recognition;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = document.getElementById('sourceLanguage').value;

        // Visual indication - make mic button red
        const micBtn = document.getElementById('micBtn');
        if (!micBtn) return;
        
        const micIcon = micBtn.querySelector('i');
        if (!micIcon) return;
        
        micBtn.classList.add('bg-red-100');
        micIcon.classList.remove('text-gray-600');
        micIcon.classList.add('text-red-600');
        isRecording = true;

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('inputText').value = transcript;
            updateCharacterCounter();
            stopVoiceInput();
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            showToast('Speech recognition error: ' + event.error);
            stopVoiceInput();
        };

        recognition.onend = function() {
            stopVoiceInput();
        };

        recognition.start();
    }
}

function stopVoiceInput() {
    if (currentRecognition) {
        currentRecognition.stop();
        currentRecognition = null;
    }
    
    // Reset visual indication
    const micBtn = document.getElementById('micBtn');
    if (!micBtn) return;
    
    const micIcon = micBtn.querySelector('i');
    if (!micIcon) return;
    
    micBtn.classList.remove('bg-red-100');
    micIcon.classList.remove('text-red-600');
    micIcon.classList.add('text-gray-600');
    isRecording = false;
}

function startImageOCR() {
    // Trigger file input click
    document.getElementById('imageInput').click();
}

function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
    }

    // Open crop modal with the image
    openCropModal(file);
}

function openCropModal(file) {
    const modal = document.getElementById('imageCropModal');
    const cropImage = document.getElementById('cropImage');
    
    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Set image source
    cropImage.src = imageUrl;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Initialize cropper after image loads
    cropImage.onload = function() {
        // Destroy existing cropper if any
        if (cropper) {
            cropper.destroy();
        }
        
        // Initialize new cropper
        cropper = new Cropper(cropImage, {
            aspectRatio: NaN, // Free aspect ratio
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: true,
            center: true,
            highlight: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: true,
        });
    };
    
    // Store file reference for later use
    modal.dataset.file = JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size
    });
}

function closeCropModal() {
    const modal = document.getElementById('imageCropModal');
    const cropImage = document.getElementById('cropImage');
    
    // Destroy cropper
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Revoke object URL
    if (cropImage.src) {
        URL.revokeObjectURL(cropImage.src);
        cropImage.src = '';
    }
    
    // Terminate Tesseract worker if running
    if (tesseractWorker) {
        tesseractWorker.terminate();
        tesseractWorker = null;
    }
    
    // Hide modal
    modal.classList.add('hidden');
    
    // Clear file input
    document.getElementById('imageInput').value = '';
}

async function scanCroppedSelection() {
    if (!cropper) {
        showToast('No image selected');
        return;
    }

    const inputText = document.getElementById('inputText');
    const translateBtn = document.getElementById('translateBtn');
    const scanBtn = document.getElementById('scanSelectionBtn');
    
    // Get cropped canvas
    const canvas = cropper.getCroppedCanvas();
    if (!canvas) {
        showToast('No selection made');
        return;
    }

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
        if (!blob) {
            showToast('Failed to process selection');
            return;
        }

        // Update UI
        inputText.value = 'Scanning selection... Please wait';
        translateBtn.disabled = true;
        translateBtn.textContent = 'Scanning...';
        scanBtn.disabled = true;
        scanBtn.textContent = 'Scanning...';

        try {
            // Create Tesseract worker
            tesseractWorker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    // Show progress
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        inputText.value = `Scanning selection... ${progress}%`;
                    }
                }
            });

            // Perform OCR on the cropped image
            const result = await tesseractWorker.recognize(blob);
            
            // Extract recognized text
            const recognizedText = result.data.text.trim();
            
            if (recognizedText) {
                // Close modal
                closeCropModal();
                
                // Insert recognized text into input field
                inputText.value = recognizedText;
                updateCharacterCounter();
                
                // Auto-translate the recognized text
                await translate();
                
                showToast('Text recognized and translated successfully!');
            } else {
                inputText.value = '';
                showToast('No text found in the selected area');
            }

        } catch (error) {
            console.error('OCR Error:', error);
            inputText.value = '';
            showToast('OCR failed. Please try again.');
        } finally {
            // Terminate worker
            if (tesseractWorker) {
                await tesseractWorker.terminate();
                tesseractWorker = null;
            }
            
            // Reset UI
            translateBtn.disabled = false;
            translateBtn.textContent = 'Translate';
            scanBtn.disabled = false;
            scanBtn.textContent = 'Scan Selection';
        }
    }, 'image/png');
}

async function performOCR(file) {
    const inputText = document.getElementById('inputText');
    const translateBtn = document.getElementById('translateBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    
    // Show scanning status
    inputText.value = 'Scanning... Please wait';
    translateBtn.disabled = true;
    translateBtn.textContent = 'Scanning...';
    
    // Visual indication - make camera button blue
    const cameraIcon = cameraBtn.querySelector('i');
    cameraBtn.classList.add('bg-blue-100');
    cameraIcon.classList.remove('text-gray-600');
    cameraIcon.classList.add('text-blue-600');

    try {
        // Perform OCR using Tesseract.js
        const result = await Tesseract.recognize(
            file,
            'eng', // Default language, can be changed based on source language
            {
                logger: m => {
                    // Optional: Show progress in console
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        inputText.value = `Scanning... ${progress}%`;
                    }
                }
            }
        );

        // Extract recognized text
        const recognizedText = result.data.text.trim();
        
        if (recognizedText) {
            // Insert recognized text into input field
            inputText.value = recognizedText;
            updateCharacterCounter();
            
            // Auto-translate the recognized text
            await translate();
            
            showToast('Text recognized and translated successfully!');
        } else {
            inputText.value = '';
            showToast('No text found in the image');
        }

    } catch (error) {
        console.error('OCR Error:', error);
        inputText.value = '';
        showToast('OCR failed. Please try again.');
    } finally {
        // Reset UI
        translateBtn.disabled = false;
        translateBtn.textContent = 'Translate';
        
        // Reset camera button visual
        cameraBtn.classList.remove('bg-blue-100');
        cameraIcon.classList.remove('text-blue-600');
        cameraIcon.classList.add('text-gray-600');
        
        // Clear file input
        document.getElementById('imageInput').value = '';
    }
}

function addToHistory(input, output, fromLang, toLang) {
    const historyItem = {
        id: Date.now(),
        input,
        output,
        fromLang,
        toLang,
        timestamp: new Date().toISOString(),
        favorite: false
    };

    history.unshift(historyItem);
    
    // Keep only last 50 items
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem('translationHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('historyList');
    const historyCounter = document.getElementById('historyCounter');
    const favoriteBtn = document.getElementById('favoriteFilterBtn');

    if (!historyList || !historyCounter || !favoriteBtn) {
        console.error('History elements not found');
        return;
    }

    let displayHistory = history;
    if (showFavoritesOnly) {
        displayHistory = history.filter(item => item.favorite);
    }

    historyList.innerHTML = '';
    
    if (displayHistory.length === 0) {
        historyList.innerHTML = '<div class="text-center text-gray-500 py-4">No history yet</div>';
        historyCounter.textContent = '0';
        return;
    }

    displayHistory.forEach(item => {
        const historyElement = createHistoryElement(item);
        historyList.appendChild(historyElement);
    });

    // Initialize Lucide icons for newly created elements
    lucide.createIcons();

    historyCounter.textContent = displayHistory.length;

    // Update favorite button appearance
    const favoriteIcon = favoriteBtn.querySelector('i');
    if (favoriteIcon) {
        if (showFavoritesOnly) {
            favoriteIcon.classList.add('text-yellow-500');
            favoriteIcon.classList.remove('text-gray-600');
        } else {
            favoriteIcon.classList.remove('text-yellow-500');
            favoriteIcon.classList.add('text-gray-600');
        }
    }
}

function createHistoryElement(item) {
    const div = document.createElement('div');
    div.className = 'p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors';
    div.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-900 mb-1">${item.input}</div>
                <div class="text-sm text-gray-600">${item.output}</div>
                <div class="text-xs text-gray-400 mt-1">
                    ${getLanguageName(item.fromLang)} ${getLanguageName(item.toLang)}
                </div>
            </div>
            <div class="flex items-center gap-2 ml-2">
                <button onclick="toggleFavorite(${item.id})" class="p-1 hover:bg-gray-200 rounded transition-colors">
                    <i data-lucide="star" class="w-4 h-4 ${item.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}"></i>
                </button>
                <button onclick="deleteFromHistory(${item.id})" class="p-1 hover:bg-gray-200 rounded transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4 text-gray-400"></i>
                </button>
            </div>
        </div>
    `;

    // Add click event to load translation
    div.addEventListener('click', function(e) {
        if (e.target.closest('button')) return;
        
        document.getElementById('inputText').value = item.input;
        document.getElementById('outputText').textContent = item.output;
        document.getElementById('sourceLanguage').value = item.fromLang;
        document.getElementById('targetLanguage').value = item.toLang;
        updateCharacterCounter();
        
        showToast('Translation loaded');
    });

    return div;
}

function getLanguageName(code) {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
}

function toggleFavorite(id) {
    const item = history.find(h => h.id === id);
    if (item) {
        item.favorite = !item.favorite;
        localStorage.setItem('translationHistory', JSON.stringify(history));
        loadHistory();
    }
}

function deleteFromHistory(id) {
    history = history.filter(h => h.id !== id);
    localStorage.setItem('translationHistory', JSON.stringify(history));
    loadHistory();
}

function toggleHistory() {
    const content = document.getElementById('historyContent');
    const chevron = document.getElementById('historyChevron');
    
    if (content.classList.contains('max-h-0')) {
        // Open history
        content.classList.remove('max-h-0');
        content.classList.add('max-h-96');
        chevron.style.transform = 'rotate(180deg)';
        localStorage.setItem('historyOpen', 'true');
    } else {
        // Close history
        content.classList.remove('max-h-96');
        content.classList.add('max-h-0');
        chevron.style.transform = 'rotate(0deg)';
        localStorage.setItem('historyOpen', 'false');
    }
}

function toggleFavoriteFilter() {
    showFavoritesOnly = !showFavoritesOnly;
    loadHistory();
}

function showClearHistoryModal() {
    const modal = document.getElementById('clearHistoryModal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('.bg-white').classList.remove('scale-95', 'opacity-0');
        modal.querySelector('.bg-white').classList.add('scale-100', 'opacity-100');
    }, 10);
}

function hideClearHistoryModal() {
    const modal = document.getElementById('clearHistoryModal');
    modal.querySelector('.bg-white').classList.remove('scale-100', 'opacity-100');
    modal.querySelector('.bg-white').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function confirmClearHistory() {
    history = [];
    localStorage.removeItem('translationHistory');
    loadHistory();
    hideClearHistoryModal();
    showToast('History cleared');
}

console.log("Script loaded successfully");
