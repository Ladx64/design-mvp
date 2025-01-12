import streamlit as st
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os
from dotenv import load_dotenv
import base64

# Load environment variables
load_dotenv()

# Configure OpenAI
llm = ChatOpenAI(
    model="gpt-4o-mini",
    max_tokens=1000,
    temperature=0.7
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

def encode_image_to_base64(image_file):
    return base64.b64encode(image_file.getvalue()).decode('utf-8')

# Streamlit UI
st.title("Design Analysis Tool")

# File uploader
uploaded_file = st.file_uploader("Upload a design image", type=['png', 'jpg', 'jpeg'])

if uploaded_file is not None:
    # Display the uploaded image
    st.image(uploaded_file, caption='Uploaded Design', use_column_width=True)
    
    # Analyze button
    if st.button('Analyze Design'):
        with st.spinner('Analyzing your design...'):
            try:
                # Encode the image
                base64_image = encode_image_to_base64(uploaded_file)
                
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
                
                # Display the analysis
                st.markdown("### Analysis Results")
                st.write(response.content)
                
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")
