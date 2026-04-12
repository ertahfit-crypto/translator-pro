package com.translator;

import java.io.*;
import java.net.*;
import java.util.*;

public class SimpleWebServer {
    private static final int PORT = 8080;
    
    public static void main(String[] args) throws IOException {
        ServerSocket serverSocket = new ServerSocket(PORT);
        System.out.println("Server started on port " + PORT);
        System.out.println("Open http://localhost:" + PORT + " in your browser");
        
        while (true) {
            Socket clientSocket = serverSocket.accept();
            handleRequest(clientSocket);
        }
    }
    
    private static void handleRequest(Socket clientSocket) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        PrintWriter out = new PrintWriter(clientSocket.getOutputStream());
        
        String requestLine = in.readLine();
        if (requestLine == null) {
            clientSocket.close();
            return;
        }
        
        StringTokenizer tokens = new StringTokenizer(requestLine);
        String method = tokens.nextToken();
        String path = tokens.nextToken();
        
        // Skip headers
        String line;
        while ((line = in.readLine()) != null && !line.isEmpty()) {
            // Read headers
        }
        
        if (method.equals("GET") && path.equals("/")) {
            sendResponse(out, 200, "OK", getHtmlContent());
        } else if (method.equals("POST") && path.equals("/translate")) {
            // Read POST data
            StringBuilder postData = new StringBuilder();
            while (in.ready()) {
                postData.append((char) in.read());
            }
            
            String response = handleTranslation(postData.toString());
            sendResponse(out, 200, "OK", response);
        } else {
            sendResponse(out, 404, "Not Found", "Page not found");
        }
        
        clientSocket.close();
    }
    
    private static String handleTranslation(String postData) {
        // Parse POST data
        String[] params = postData.split("&");
        String text = "";
        String sourceLang = "English";
        String targetLang = "Spanish";
        
        for (String param : params) {
            String[] keyValue = param.split("=");
            if (keyValue.length == 2) {
                try {
                    String key = URLDecoder.decode(keyValue[0], "UTF-8");
                    String value = URLDecoder.decode(keyValue[1], "UTF-8");
                    
                    if (key.equals("text")) {
                        text = value;
                    } else if (key.equals("sourceLanguage")) {
                        sourceLang = value;
                    } else if (key.equals("targetLanguage")) {
                        targetLang = value;
                    }
                } catch (UnsupportedEncodingException e) {
                    // Ignore
                }
            }
        }
        
        // Mock translation
        String translatedText = String.format("[Translated from %s to %s]: %s", 
                                             sourceLang, targetLang, text);
        
        return getHtmlContentWithTranslation(text, translatedText, sourceLang, targetLang);
    }
    
    private static void sendResponse(PrintWriter out, int statusCode, String statusText, String content) {
        out.println("HTTP/1.1 " + statusCode + " " + statusText);
        out.println("Content-Type: text/html; charset=UTF-8");
        out.println("Content-Length: " + content.getBytes().length);
        out.println();
        out.print(content);
        out.flush();
    }
    
    private static String getHtmlContent() {
        return "<!DOCTYPE html>\n" +
               "<html lang=\"en\">\n" +
               "<head>\n" +
               "    <meta charset=\"UTF-8\">\n" +
               "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
               "    <title>Translator Pro</title>\n" +
               "    <script src=\"https://cdn.tailwindcss.com\"></script>\n" +
               "</head>\n" +
               "<body class=\"bg-white min-h-screen\">\n" +
               "    <div class=\"container mx-auto px-4 py-8 max-w-4xl\">\n" +
               "        <header class=\"text-center mb-12\">\n" +
               "            <h1 class=\"text-4xl font-bold text-gray-800 mb-2\">Translator Pro</h1>\n" +
               "            <p class=\"text-gray-600\">Professional translation tool</p>\n" +
               "        </header>\n" +
               "        <main class=\"bg-white rounded-2xl shadow-lg border border-gray-200 p-8\">\n" +
               "            <div class=\"grid grid-cols-2 gap-4 mb-6\">\n" +
               "                <div>\n" +
               "                    <label for=\"sourceLanguage\" class=\"block text-sm font-medium text-gray-700 mb-2\">From</label>\n" +
               "                    <select id=\"sourceLanguage\" name=\"sourceLanguage\" class=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition\">\n" +
               "                        <option value=\"English\">English</option>\n" +
               "                        <option value=\"Spanish\">Spanish</option>\n" +
               "                        <option value=\"French\">French</option>\n" +
               "                        <option value=\"German\">German</option>\n" +
               "                        <option value=\"Italian\">Italian</option>\n" +
               "                        <option value=\"Portuguese\">Portuguese</option>\n" +
               "                        <option value=\"Russian\">Russian</option>\n" +
               "                        <option value=\"Chinese\">Chinese</option>\n" +
               "                        <option value=\"Japanese\">Japanese</option>\n" +
               "                    </select>\n" +
               "                </div>\n" +
               "                <div>\n" +
               "                    <label for=\"targetLanguage\" class=\"block text-sm font-medium text-gray-700 mb-2\">To</label>\n" +
               "                    <select id=\"targetLanguage\" name=\"targetLanguage\" class=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition\">\n" +
               "                        <option value=\"English\">English</option>\n" +
               "                        <option value=\"Spanish\">Spanish</option>\n" +
               "                        <option value=\"French\">French</option>\n" +
               "                        <option value=\"German\">German</option>\n" +
               "                        <option value=\"Italian\">Italian</option>\n" +
               "                        <option value=\"Portuguese\">Portuguese</option>\n" +
               "                        <option value=\"Russian\">Russian</option>\n" +
               "                        <option value=\"Chinese\">Chinese</option>\n" +
               "                        <option value=\"Japanese\">Japanese</option>\n" +
               "                    </select>\n" +
               "                </div>\n" +
               "            </div>\n" +
               "            <form action=\"/translate\" method=\"post\" class=\"space-y-6\">\n" +
               "                <div>\n" +
               "                    <label for=\"text\" class=\"block text-sm font-medium text-gray-700 mb-2\">Input Text</label>\n" +
               "                    <textarea id=\"text\" name=\"text\" rows=\"6\" class=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none\" placeholder=\"Enter text to translate...\"></textarea>\n" +
               "                </div>\n" +
               "                <div class=\"text-center\">\n" +
               "                    <button type=\"submit\" class=\"bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2\">\n" +
               "                        Translate\n" +
               "                    </button>\n" +
               "                </div>\n" +
               "            </form>\n" +
               "        </main>\n" +
               "        <footer class=\"text-center mt-12 text-gray-500 text-sm\">\n" +
               "            <p>&copy; 2024 Translator Pro. Built with Java.</p>\n" +
               "        </footer>\n" +
               "    </div>\n" +
               "</body>\n" +
               "</html>";
    }
    
    private static String getHtmlContentWithTranslation(String originalText, String translatedText, String sourceLang, String targetLang) {
        return "<!DOCTYPE html>\n" +
               "<html lang=\"en\">\n" +
               "<head>\n" +
               "    <meta charset=\"UTF-8\">\n" +
               "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
               "    <title>Translator Pro</title>\n" +
               "    <script src=\"https://cdn.tailwindcss.com\"></script>\n" +
               "</head>\n" +
               "<body class=\"bg-white min-h-screen\">\n" +
               "    <div class=\"container mx-auto px-4 py-8 max-w-4xl\">\n" +
               "        <header class=\"text-center mb-12\">\n" +
               "            <h1 class=\"text-4xl font-bold text-gray-800 mb-2\">Translator Pro</h1>\n" +
               "            <p class=\"text-gray-600\">Professional translation tool</p>\n" +
               "        </header>\n" +
               "        <main class=\"bg-white rounded-2xl shadow-lg border border-gray-200 p-8\">\n" +
               "            <div class=\"grid grid-cols-2 gap-4 mb-6\">\n" +
               "                <div>\n" +
               "                    <label for=\"sourceLanguage\" class=\"block text-sm font-medium text-gray-700 mb-2\">From</label>\n" +
               "                    <select id=\"sourceLanguage\" name=\"sourceLanguage\" class=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition\">\n" +
               "                        <option value=\"English\"" + (sourceLang.equals("English") ? " selected" : "") + ">English</option>\n" +
               "                        <option value=\"Spanish\"" + (sourceLang.equals("Spanish") ? " selected" : "") + ">Spanish</option>\n" +
               "                        <option value=\"French\"" + (sourceLang.equals("French") ? " selected" : "") + ">French</option>\n" +
               "                        <option value=\"German\"" + (sourceLang.equals("German") ? " selected" : "") + ">German</option>\n" +
               "                        <option value=\"Italian\"" + (sourceLang.equals("Italian") ? " selected" : "") + ">Italian</option>\n" +
               "                        <option value=\"Portuguese\"" + (sourceLang.equals("Portuguese") ? " selected" : "") + ">Portuguese</option>\n" +
               "                        <option value=\"Russian\"" + (sourceLang.equals("Russian") ? " selected" : "") + ">Russian</option>\n" +
               "                        <option value=\"Chinese\"" + (sourceLang.equals("Chinese") ? " selected" : "") + ">Chinese</option>\n" +
               "                        <option value=\"Japanese\"" + (sourceLang.equals("Japanese") ? " selected" : "") + ">Japanese</option>\n" +
               "                    </select>\n" +
               "                </div>\n" +
               "                <div>\n" +
               "                    <label for=\"targetLanguage\" class=\"block text-sm font-medium text-gray-700 mb-2\">To</label>\n" +
               "                    <select id=\"targetLanguage\" name=\"targetLanguage\" class=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition\">\n" +
               "                        <option value=\"English\"" + (targetLang.equals("English") ? " selected" : "") + ">English</option>\n" +
               "                        <option value=\"Spanish\"" + (targetLang.equals("Spanish") ? " selected" : "") + ">Spanish</option>\n" +
               "                        <option value=\"French\"" + (targetLang.equals("French") ? " selected" : "") + ">French</option>\n" +
               "                        <option value=\"German\"" + (targetLang.equals("German") ? " selected" : "") + ">German</option>\n" +
               "                        <option value=\"Italian\"" + (targetLang.equals("Italian") ? " selected" : "") + ">Italian</option>\n" +
               "                        <option value=\"Portuguese\"" + (targetLang.equals("Portuguese") ? " selected" : "") + ">Portuguese</option>\n" +
               "                        <option value=\"Russian\"" + (targetLang.equals("Russian") ? " selected" : "") + ">Russian</option>\n" +
               "                        <option value=\"Chinese\"" + (targetLang.equals("Chinese") ? " selected" : "") + ">Chinese</option>\n" +
               "                        <option value=\"Japanese\"" + (targetLang.equals("Japanese") ? " selected" : "") + ">Japanese</option>\n" +
               "                    </select>\n" +
               "                </div>\n" +
               "            </div>\n" +
               "            <form action=\"/translate\" method=\"post\" class=\"space-y-6\">\n" +
               "                <div>\n" +
               "                    <label for=\"text\" class=\"block text-sm font-medium text-gray-700 mb-2\">Input Text</label>\n" +
               "                    <textarea id=\"text\" name=\"text\" rows=\"6\" class=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none\" placeholder=\"Enter text to translate...\">" + originalText + "</textarea>\n" +
               "                </div>\n" +
               "                <div class=\"text-center\">\n" +
               "                    <button type=\"submit\" class=\"bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2\">\n" +
               "                        Translate\n" +
               "                    </button>\n" +
               "                </div>\n" +
               "                <div>\n" +
               "                    <label class=\"block text-sm font-medium text-gray-700 mb-2\">Translation Result</label>\n" +
               "                    <div class=\"w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[150px]\">\n" +
               "                        <p class=\"text-gray-800 whitespace-pre-wrap\">" + translatedText + "</p>\n" +
               "                    </div>\n" +
               "                </div>\n" +
               "            </form>\n" +
               "        </main>\n" +
               "        <footer class=\"text-center mt-12 text-gray-500 text-sm\">\n" +
               "            <p>&copy; 2024 Translator Pro. Built with Java.</p>\n" +
               "        </footer>\n" +
               "    </div>\n" +
               "</body>\n" +
               "</html>";
    }
}
