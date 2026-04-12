@echo off
echo Starting Translator Pro Web Application...
echo.

REM Set JAVA_HOME (adjust path if needed)
set JAVA_HOME=C:\Program Files\Java\jre1.8.0_51

REM Check if Java is available
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo Error: Java not found at %JAVA_HOME%
    echo Please install Java JDK 8 or higher and update JAVA_HOME in this batch file
    pause
    exit /b 1
)

REM Compile the Java source (if JDK is available)
if exist "%JAVA_HOME%\..\lib\tools.jar" (
    echo Compiling Java source...
    "%JAVA_HOME%\bin\javac" -cp "src/main/java" src/main/java/com/translator/SimpleWebServer.java
    if errorlevel 1 (
        echo Compilation failed. Please check Java installation.
        pause
        exit /b 1
    )
) else (
    echo Warning: JDK not found. Using pre-compiled classes if available.
)

REM Run the application
echo.
echo Starting web server on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

"%JAVA_HOME%\bin\java" -cp "src/main/java" com.translator.SimpleWebServer
