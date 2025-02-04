from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
import os
from dotenv import load_dotenv
import base64
import json
import re
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

#import PyPDF2
import io

# Configure Claude
llm = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    temperature=0.7,
    anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
)

async def extract_pdf_text(pdf_file: bytes) -> str:
    try:
        # Create a BytesIO object from the bytes
        pdf_io = io.BytesIO(pdf_file)
        
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(pdf_io)
        
        # Extract text from all pages
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        return ""

DESIGN_PRINCIPLES = """
Analyze this design based on the following principles:
1. Visual Hierarchy
2. Balance and Alignment
3. Color Theory and Contrast
4. Typography and Readability
5. White Space Usage
6. Consistency
7. Accessibility

Consider any provided research documents and user requirements while analyzing.
Provide specific, actionable improvements for each relevant principle.
"""

MOCKUP_GENERATION_PROMPT = """
Based on the provided design and considering any research documents and reference designs, generate a detailed HTML and CSS mockup that incorporates the suggested improvements. The mockup should:

1. Maintain the core elements and purpose of the original design
2. Apply the suggested improvements from the analysis
3. Use modern, responsive design practices
4. Follow accessibility guidelines
5. Include appropriate color schemes and typography

Return a JSON object with two fields:
- "html": containing the HTML code (without DOCTYPE declaration)
- "css": containing the CSS code

Important formatting rules:
1. Use double quotes for JSON strings
2. Escape all double quotes in HTML/CSS with backslash (\\")
3. Remove all newlines from HTML and CSS
4. Remove any control characters
5. Keep HTML/CSS minimal and valid
6. Do not include DOCTYPE, html, head, or body tags
7. Focus on the core UI components

Example response format:
{"html":"<div class=\\"container\\"><h1>Title</h1><p>Content</p></div>","css":".container{max-width:1200px;margin:0 auto}h1{color:#333}"}

Note: The response must be a single-line, valid JSON string with properly escaped quotes and no control characters.
"""

async def sanitize_json_string(content: str) -> str:
    """Sanitize the JSON string by removing control characters and normalizing whitespace."""
    try:
        # First try to parse the content as JSON
        try:
            # Remove any control characters and normalize whitespace
            cleaned_content = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', content)
            data = json.loads(cleaned_content)
        except json.JSONDecodeError:
            # If parsing fails, try to extract HTML and CSS using regex
            html_match = re.search(r'"html"\s*:\s*"((?:[^"\\]|\\.)*)"', content)
            css_match = re.search(r'"css"\s*:\s*"((?:[^"\\]|\\.)*)"', content)
            
            if html_match and css_match:
                data = {
                    'html': html_match.group(1),
                    'css': css_match.group(1)
                }
            else:
                raise ValueError("Could not extract HTML and CSS from response")

        # Clean and normalize the data
        if isinstance(data, dict):
            if 'html' in data:
                # Remove newlines and normalize spaces
                data['html'] = re.sub(r'\s+', ' ', data['html'].strip())
                # Escape quotes and backslashes
                data['html'] = json.dumps(data['html'])[1:-1]  # Use json.dumps for proper escaping
            
            if 'css' in data:
                # Remove newlines and normalize spaces
                data['css'] = re.sub(r'\s+', ' ', data['css'].strip())
                # Escape quotes and backslashes
                data['css'] = json.dumps(data['css'])[1:-1]  # Use json.dumps for proper escaping

        # Create a new clean object with only the required fields
        clean_data = {
            'html': data.get('html', '<div>No content</div>'),
            'css': data.get('css', '')
        }
        
        # Convert to JSON string with minimal escaping
        return json.dumps(clean_data, ensure_ascii=False)
    except Exception as e:
        print(f"Error sanitizing JSON: {str(e)}")
        return json.dumps({
            'html': '<div>Error generating mockup</div>',
            'css': 'div { color: red; }'
        })

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
async def analyze_design(
    file: UploadFile = File(...),
    research: UploadFile | None = None,
    reference_description: str | None = None
):
    try:
        # Read the file content
        image_content = await file.read()
        
        # Encode the image
        base64_image = await encode_image_to_base64(image_content)
        
        # Extract research text if provided
        research_text = ""
        if research:
            research_content = await research.read()
            research_text = await extract_pdf_text(research_content)
        
        # Prepare the analysis prompt
        analysis_prompt = DESIGN_PRINCIPLES
        if research_text:
            analysis_prompt += "\n\nConsider the following research while analyzing the design:\n" + research_text
        if reference_description:
            analysis_prompt += f"\n\nConsider these specific change requirements:\n{reference_description}"

        # Prepare the message for GPT-4 Vision
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": analysis_prompt
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
        analysis_response = llm.invoke([message])

        # Generate mockup
        mockup_message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": MOCKUP_GENERATION_PROMPT
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        )

        # Get the mockup and sanitize the response
        mockup_response = llm.invoke([mockup_message])
        sanitized_mockup = await sanitize_json_string(mockup_response.content)
        
        return JSONResponse(content={
            "status": "success",
            "analysis": analysis_response.content,
            "mockup": sanitized_mockup
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
