import streamlit as st
from pypdf import PdfReader
import json
import pandas as pd
from openai import OpenAI
import os
import tempfile
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_pdf(pdf_file):
    pdf_text = ""
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_file.write(pdf_file.read())
        tmp_file.seek(0)
        pdf_reader = PdfReader(tmp_file.name)
        for page in pdf_reader.pages:
            pdf_text += page.extract_text()
    os.unlink(tmp_file.name)
    return pdf_text

def call_openai_api(text_content, is_new_contract):
    prompt = f"""
    Analyze the following {'new contract' if is_new_contract else 'contract renewal'} and extract key information.
    Return the result as a JSON object with relevant fields.

    Contract content:
    {text_content}
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4",
            temperature=0.1,
            max_tokens=1000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        st.error(f"API Error: {str(e)}")
        return None

def main():
    st.title("Simple Contract Analysis")

    contract_type = st.radio("Select Contract Type", ("New Contract", "Contract Renewal"))
    
    pdf_file = st.file_uploader("Upload Contract (PDF only)", type=['pdf'])
    
    if st.button("Analyze Contract"):
        if pdf_file is None:
            st.error("Please upload a PDF file")
            return
            
        try:
            with st.spinner("Processing..."):
                text_content = extract_text_from_pdf(pdf_file)
                is_new_contract = contract_type == "New Contract"
                ai_response = call_openai_api(text_content, is_new_contract)
                
                if ai_response:
                    try:
                        parsed_data = json.loads(ai_response)
                        df = pd.DataFrame(parsed_data.items(), columns=['Field', 'Value'])
                        st.dataframe(df)
                        
                        csv = df.to_csv(index=False)
                        st.download_button(
                            label="Download CSV",
                            data=csv,
                            file_name="contract_analysis.csv",
                            mime="text/csv"
                        )
                    except json.JSONDecodeError as e:
                        st.error(f"JSON Parsing Error: {str(e)}")
                        st.text(ai_response)
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()

