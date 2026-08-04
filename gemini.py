from dotenv import load_dotenv
import os
from google import genai

# Force loading from .env
# Try loading .env locally; if on Vercel, it safely falls back to system variables
load_dotenv()
# Read from system environment (works locally via dotenv AND on Vercel)
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise Exception("GEMINI_API_KEY environment variable is not configured.")
# Initialize the Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Generate test content
response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents="Hello! Confirm that you are working.",
)

print(response.text)