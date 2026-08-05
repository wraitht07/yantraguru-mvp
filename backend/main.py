import os
import base64
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="YantraGuru API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

class DiagnosticRequest(BaseModel):
    prompt: str
    image_base64: str | None = None

# Updated route path to match Vercel API rewrites
@app.post("/api/chat/stream")
@app.post("/chat/stream")
async def chat_stream(req: DiagnosticRequest):
    if not client:
        async def err_gen():
            yield "data: Error: GEMINI_API_KEY is missing or invalid in backend environment variables.\n\n"
        return StreamingResponse(err_gen(), media_type="text/event-stream")

    async def generate():
        try:
            contents = []
            mime_type = "image/jpeg"

            if req.image_base64 and "," in req.image_base64:
                mime_match = re.search(r"data:(image/\w+);base64,", req.image_base64)
                if mime_match:
                    mime_type = mime_match.group(1)

                raw_b64 = req.image_base64.split(",")[1]
                img_bytes = base64.b64decode(raw_b64)
                contents.append(
                    types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
                )
            
            if req.prompt:
                contents.append(req.prompt)

            # System instructions without custom temperature override
            response = await client.aio.models.generate_content_stream(
                model="gemini-3.6-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction="You are YantraGuru, an expert Indian mechanic assistant. Provide step-by-step repair guides and workarounds."
                )
            )

            async for chunk in response:
                if chunk.text:
                    yield f"data: {chunk.text.replace('\n', '\\n')}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: Error: {str(e).replace('\n', ' ')}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")