import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Configure API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load Gemini Model
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="You are Jarvis, a helpful AI assistant"
)

# Ask Gemini
response = model.generate_content("What is coding?")

# Print Response
print(response.text)