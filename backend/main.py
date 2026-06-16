from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class PlanRequest(BaseModel):
    college: str
    major: str

@app.post("/generate-plan")
def generate_plan(request: PlanRequest):
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": f"""Create a detailed 4-year academic plan for a student at {request.college} 
                studying {request.major}. 
                Format it semester by semester (Fall/Spring), listing 4-5 courses per semester.
                Include course names, credit hours, and a brief reason for the sequence."""
            }
        ]
    )
    return {"plan": message.content[0].text}