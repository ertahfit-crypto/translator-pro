# Translator Pro

A simple web application for translation built with Java.

## Features

- Clean, modern web interface using Tailwind CSS
- Language selection between multiple languages
- Mock translation functionality (ready for real API integration)
- Responsive design with minimalist approach

## Requirements

- Java 8 or higher
- Web browser

## Quick Start

### Option 1: Using the Batch File (Windows)

1. Double-click `run-app.bat` to start the application
2. Open your web browser and go to `http://localhost:8080`

### Option 2: Manual Start

1. Open Command Prompt or PowerShell
2. Navigate to the project directory
3. Run the following commands:

```bash
# Set JAVA_HOME (adjust path as needed)
set JAVA_HOME=C:\Program Files\Java\jre1.8.0_51

# Compile (if you have JDK)
javac -cp "src/main/java" src/main/java/com/translator/SimpleWebServer.java

# Run the application
java -cp "src/main/java" com.translator.SimpleWebServer
```

4. Open your web browser and go to `http://localhost:8080`

## Project Structure

```
translator-pro/
├── src/main/java/com/translator/
│   ├── SimpleWebServer.java          # Main web server implementation
│   ├── TranslatorProApplication.java # Spring Boot main class (for future use)
│   ├── controller/
│   │   └── TranslatorController.java # Spring Boot controller (for future use)
│   └── service/
│       └── TranslationService.java   # Translation service (for future use)
├── src/main/resources/templates/
│   └── index.html                    # Thymeleaf template (for future use)
├── pom.xml                           # Maven configuration (for future use)
├── run-app.bat                       # Windows batch file to run the app
└── README.md                         # This file
```

## Current Implementation

The current implementation uses a simple Java web server without external dependencies to ensure compatibility across different Java installations. The Spring Boot version is included in the project structure for future enhancement when Maven dependencies can be properly resolved.

## Future Enhancements

- Integration with real translation APIs (Google Translate, DeepL, etc.)
- Spring Boot framework implementation
- Database integration for translation history
- User authentication and preferences
- Multiple file format support for translation

## Usage

1. Select source and target languages from the dropdown menus
2. Enter text to translate in the input field
3. Click the "Translate" button
4. View the translation result in the output field

## Troubleshooting

### Java Not Found
If you get an error about Java not being found:
1. Install Java 8 or higher from [Oracle's website](https://www.oracle.com/java/technologies/downloads/)
2. Update the JAVA_HOME path in `run-app.bat` to point to your Java installation

### Port Already in Use
If port 8080 is already in use, you can modify the port in `SimpleWebServer.java` by changing the `PORT` constant.

### Compilation Issues
If you don't have a JDK (only JRE), the application should still run using pre-compiled classes. If compilation is needed, install the full JDK.

## License

This project is open source and available under the MIT License.
