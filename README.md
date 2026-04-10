# Translator Pro

**Modern translation application with glassmorphism design inspired by Google Translate**

![Translator Pro](https://img.shields.io/badge/React-18-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

### Core Functionality
- **Real-time Translation** - Instant translation as you type
- **Auto Language Detection** - Automatically detects source language
- **19+ Languages** - Support for major world languages
- **Text-to-Speech** - Listen to translations in natural voice
- **Copy to Clipboard** - Quick copy functionality

### User Interface
- **Glassmorphism Design** - Modern frosted glass effect
- **Dark/Light Themes** - Automatic system theme detection with manual override
- **Responsive Design** - Perfect on mobile and desktop
- **Smooth Animations** - Framer Motion powered transitions
- **Modern UI Components** - Built with Tailwind CSS

### Data Management
- **Translation History** - Last 5 translations automatically saved
- **Favorites System** - Star important translations
- **Local Storage** - All data stored locally in browser
- **Settings Persistence** - User preferences remembered

### Technical Features
- **Debounced Translation** - Optimized API calls
- **Error Handling** - Beautiful error notifications
- **Loading States** - Smooth loading indicators
- **Keyboard Shortcuts** - Enhanced user experience

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready animations
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **LibreTranslate API** - Free translation service
- **CORS** - Cross-origin resource sharing

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd translator-pro
```

2. **Install frontend dependencies**
```bash
cd translator-pro
npm install
```

3. **Install backend dependencies**
```bash
cd ../translator-pro-backend
npm install
```

4. **Start the backend server**
```bash
npm start
# Server runs on http://localhost:3001
```

5. **Start the frontend development server**
```bash
cd ../translator-pro
npm run dev
# Application runs on http://localhost:5173
```

6. **Open your browser**
Navigate to http://localhost:5173 to use Translator Pro.

## Project Structure

```
translator-pro/
                 # Frontend application
  src/
    components/  # React components
      Header.jsx          # App header with theme switcher
      LanguageSelector.jsx # Language selection with swap
      TranslationBox.jsx   # Text areas and controls
      HistoryBar.jsx      # History and favorites
    hooks/       # Custom React hooks
      useTheme.js         # Theme management
      useTranslation.js   # Translation logic
    services/    # API services
      translationService.js # Translation API calls
    utils/       # Utility functions
      storage.js          # LocalStorage management
    App.jsx       # Main application component
    App.css       # Application styles

translator-pro-backend/  # Backend API server
  server.js      # Express server setup
  package.json   # Backend dependencies
```

## API Endpoints

### Backend Server (http://localhost:3001)

- `GET /api/languages` - Get supported languages
- `POST /api/translate` - Translate text
- `POST /api/detect` - Detect language
- `GET /api/health` - Health check

### Translation API Request
```javascript
POST /api/translate
{
  "text": "Hello world",
  "source": "en",
  "target": "es"
}
```

### Translation API Response
```javascript
{
  "translatedText": "Hola mundo",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

## Configuration

### Environment Variables
Create `.env` file in backend directory:
```env
PORT=3001
NODE_ENV=development
```

### Translation API
The application uses LibreTranslate by default. To use Google Translate or DeepL:

1. Update `translationService.js` with your API endpoints
2. Add API keys to environment variables
3. Update request/response handling as needed

## Development

### Available Scripts

#### Frontend (translator-pro/)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

#### Backend (translator-pro-backend/)
```bash
npm start       # Start production server
npm run dev      # Start development server
```

### Code Style
- Components use functional components with hooks
- Custom hooks for reusable logic
- Services for API calls
- Utilities for helper functions
- Russian comments for better documentation

### Build Process
```bash
# Build frontend
cd translator-pro
npm run build

# The build output will be in dist/
```

## Features in Detail

### Theme System
- **System Theme** - Follows OS preference
- **Light Theme** - Clean, bright interface
- **Dark Theme** - Midnight deep blue with neon accents
- **Smooth Transitions** - Animated theme switching

### Translation Features
- **Auto-detect** - Automatically identifies source language
- **Real-time** - Translation as you type (500ms debounce)
- **Language Swap** - Quick reverse translation
- **Character Count** - Live character tracking

### History & Favorites
- **Auto-save** - Last 5 translations saved automatically
- **Persistent** - Survives browser restarts
- **Favorites** - Star important translations
- **Quick Access** - Click history to restore

### Accessibility
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - ARIA labels and semantic HTML
- **Focus Management** - Proper focus indicators
- **High Contrast** - Good color contrast ratios

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Google Translate's design
- LibreTranslate for free translation API
- Tailwind CSS for utility-first styling
- Framer Motion for beautiful animations
- Lucide for modern iconography

## Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include browser version and error messages

---

**Translator Pro** - Modern translation made beautiful and functional.
