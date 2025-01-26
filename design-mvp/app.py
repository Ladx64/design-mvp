from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
import os
from dotenv import load_dotenv
import base64
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Design Analysis Tool")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Claude
llm = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    temperature=0.7,
    anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
)

DESIGN_PRINCIPLES = """
Analyze this design based on the following principles:
1. Visual Hierarchy
2. Balance and Alignment
3. Color Theory and Contrast
4. Typography and Readability
5. White Space Usage
6. Consistency
7. Accessibility

Provide specific, actionable improvements for each relevant principle.
"""

SIMILAR_DESIGNS_PROMPT = """
Analyze this design and suggest 3-5 similar real-world examples of UI designs or websites that share similar:
1. Layout patterns
2. Color schemes
3. Visual style
4. Purpose/functionality

For each example, provide:
- Name/URL of the website or app
- Brief explanation of why it's similar
- Key design elements that match
"""

VISUAL_SIMILARITY_PROMPT = """
Based on this design's visual characteristics, suggest 3-5 existing websites or apps that have a similar visual appearance. Focus on:
1. Overall layout and composition
2. Color palette and visual style
3. Design elements (buttons, cards, navigation, etc.)

For each suggestion, provide:
- Website/app name and URL
- Screenshot URL (if available)
- Brief description of visual similarities
"""

async def encode_image_to_base64(image_file: bytes) -> str:
    return base64.b64encode(image_file).decode('utf-8')

@app.post("/analyze-design/")
async def analyze_design(file: UploadFile = File(...)):
    try:
        # Read the file content
        image_content = await file.read()
        
        # Encode the image
        base64_image = await encode_image_to_base64(image_content)
        
        # Prepare the message for GPT-4 Vision
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": DESIGN_PRINCIPLES
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        )

        # Get the analysis
        response = llm.invoke([message])
        
        return JSONResponse(content={
            "status": "success",
            "analysis": response.content
        })
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )

@app.post("/find-similar-designs/")
async def find_similar_designs(file: UploadFile = File(...)):
    try:
        # Read the file content
        image_content = await file.read()
        
        # Encode the image
        base64_image = await encode_image_to_base64(image_content)
        
        # Prepare the message for GPT-4 Vision
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": SIMILAR_DESIGNS_PROMPT
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        )

        # Get the analysis
        response = llm.invoke([message])
        
        return JSONResponse(content={
            "status": "success",
            "similar_designs": response.content
        })
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )

@app.post("/get-visual-matches/")
async def get_visual_matches(file: UploadFile = File(...)):
    try:
        # Read the file content
        image_content = await file.read()
        
        # Encode the image
        base64_image = await encode_image_to_base64(image_content)
        
        # Prepare the message for GPT-4 Vision
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": VISUAL_SIMILARITY_PROMPT
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        )

        # Get the analysis
        response = llm.invoke([message])
        
        return JSONResponse(content={
            "status": "success",
            "visual_matches": response.content
        })
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
