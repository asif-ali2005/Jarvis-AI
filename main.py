import os
from dotenv import load_dotenv
import musiclibrary
import requests
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="You are Jarvis, a helpful virtual assistant. Keep all your responses extremely concise, brief, and to the point. keep the all answers between 60 to 100 words."
)

newsapi = os.getenv("CURRENTS_API_KEY")

def aiprocess(command):
    try:
        response = model.generate_content(command)
        return response.text
    except Exception as e:
        return f"AI Error: {e}"

def processCommand(c):
    """
    Processes a command and returns a tuple of (response_text, action_dict).
    action_dict can contain things like {"type": "open_url", "url": "..."}
    """
    c = c.lower().strip()
    
    # Open Websites
    if "open google" in c:
        return "Opening Google", {"type": "open_url", "url": "https://google.com"}
    elif "open facebook" in c:
        return "Opening Facebook", {"type": "open_url", "url": "https://facebook.com"}
    elif "open youtube" in c:
        return "Opening YouTube", {"type": "open_url", "url": "https://youtube.com"}
    elif "open linkedin" in c:
        return "Opening LinkedIn", {"type": "open_url", "url": "https://linkedin.com"}
    elif "open visual studio code" in c:
        return "Opening Visual Studio Code", {"type": "open_url", "url": "https://code.visualstudio.com"}
    
    # Play Music
    elif c.startswith("play"):
        parts = c.split(" ", 1)
        if len(parts) > 1:
            song = parts[1]
            if song in musiclibrary.music:
                link = musiclibrary.music[song]
                return f"Playing {song}", {"type": "open_url", "url": link}
            else:
                return "Song not found in library", None
        else:
            return "Please say the song name", None
            
    # News Feature
    elif "news" in c:
        url = "https://api.currentsapi.services/v1/latest-news"
        headers = {"Authorization": newsapi}
        try:
            r = requests.get(url, headers=headers)
            data = r.json()
            articles = data.get("news", [])
            
            if len(articles) == 0:
                return "No news found", None
                
            headlines = ""
            for article in articles[:5]:
                title = article["title"]
                headlines += title + "\n"
                
            prompt = f"Summarize these headlines briefly:\n{headlines}"
            response = model.generate_content(prompt)
            summary = response.text
            return summary, None
        except Exception as e:
            return "Error fetching news", None
            
    # AI Chat
    else:
        output = aiprocess(c)
        return output, None

# Removed infinite loop as the app will now be driven by HTTP requests