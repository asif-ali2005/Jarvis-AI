# Jarvis Web Assistant

A modern, web-based virtual assistant that uses the Gemini AI model, the Currents API for news, and the browser's Web Speech API to listen and speak.

## Features

- **Voice Interaction**: Speak directly to Jarvis using your browser's microphone.
- **AI Chat**: Engage in conversations with a highly capable AI (powered by Google Gemini).
- **News Summary**: Ask for the latest news, and Jarvis will fetch and summarize the top headlines.
- **Web Navigation**: Command Jarvis to open popular websites (Google, YouTube, LinkedIn, etc.).
- **Music Playback**: Ask Jarvis to play specific songs from your configured music library.

## Project Structure

```text
.
├── app.py                  # Flask web server entry point
├── main.py                 # Core logic for handling commands and AI interactions
├── client.py               # Simple standalone script to test Gemini API
├── musiclibrary.py         # Dictionary mapping song names to URLs
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (API keys - DO NOT COMMIT)
├── .gitignore              # Ignored files for git
├── static/
│   ├── script.js           # Frontend logic (Web Speech API, requests)
│   └── style.css           # Premium glassmorphism design
└── templates/
    └── index.html          # Main web interface
```

## Local Setup

1. **Clone the repository** (if not already done).
2. **Create a virtual environment** (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   CURRENTS_API_KEY=your_currents_api_key_here
   ```
5. **Run the Application**:
   ```bash
   python3 app.py
   ```
6. **Access the Web App**: Open your browser and navigate to `http://localhost:5000`.

## Deployment Guide

To deploy this application to a service like **Render** or **Heroku**:

1. **Create a Git Repository**:
   Initialize git and commit your files (the `.gitignore` ensures your `.env` file stays private).
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Push this to a GitHub repository.

2. **Deploy on Render (Recommended)**:
   - Go to [Render](https://render.com/) and create a new **Web Service**.
   - Connect your GitHub repository.
   - For **Build Command**, use: `pip install -r requirements.txt`
   - For **Start Command**, use: `gunicorn app:app` 
     *(Note: You will need to add `gunicorn` to your `requirements.txt` for this)*
   - In the Render dashboard, go to the **Environment** section and add your environment variables (`GEMINI_API_KEY` and `CURRENTS_API_KEY`).

3. **HTTPS Requirement**:
   Note that the Web Speech API requires a secure context (HTTPS) to work outside of `localhost`. Deploying to platforms like Render automatically provides an HTTPS URL.
