from dotenv import load_dotenv
import os
from google import genai

# Force loading from .env
load_dotenv('.env')

# Initialize the Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Generate test content
response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents="Hello! Confirm that you are working.",
)

print(response.text)