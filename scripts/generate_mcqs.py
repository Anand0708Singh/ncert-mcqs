import os
import json
import time
from PyPDF2 import PdfReader, PdfWriter
from google import genai
from google.genai import types

# Use the API key provided by the user
API_KEY = "AIzaSyCugvKffX4TzPmwKBMfuWxeboaDcWi7KXo"

# We will extract a 5-page chunk from the middle of the book for demonstration 
# because running the full 298 pages takes hours and thousands of API calls.
PDF_PATH = "../Arihant_NCERT_Notes_General_Science_Class_6_12_2nd_Revised_Edition.pdf"
START_PAGE = 35
END_PAGE = 40

def extract_chunk(input_pdf, output_pdf, start, end):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()
    for i in range(start, min(end, len(reader.pages))):
        writer.add_page(reader.pages[i])
    with open(output_pdf, "wb") as out:
        writer.write(out)
    return output_pdf

def generate_mcqs(pdf_chunk_path):
    print(f"Uploading {pdf_chunk_path} to Gemini...")
    client = genai.Client(api_key=API_KEY)
    
    # Upload file
    uploaded_file = client.files.upload(file=pdf_chunk_path)
    print(f"File uploaded: {uploaded_file.name}")
    
    # Wait for processing if it's a PDF
    while True:
        file_info = client.files.get(name=uploaded_file.name)
        if file_info.state.name == "ACTIVE":
            break
        elif file_info.state.name == "FAILED":
            raise Exception("File processing failed in Gemini")
        print("Waiting for file to be processed...")
        time.sleep(5)
        
    print("File active. Generating MCQs...")
    
    prompt = """
    You are an expert NCERT educational content processor.
    Read the provided scanned PDF pages carefully.
    Extract the subject, class, and chapter name based on the content.
    Generate a JSON array of high-quality MCQs based ONLY on the content of these pages.
    Each MCQ must follow this exact JSON schema:
    {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "description": "Unique ID like SCI10-CH01-Q001"},
          "bookId": {"type": "string", "description": "e.g., science10"},
          "chapterId": {"type": "string", "description": "e.g., ch01"},
          "chapterTitle": {"type": "string"},
          "question": {"type": "string"},
          "options": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {"type": "string", "enum": ["A", "B", "C", "D"]},
                "text": {"type": "string"}
              }
            },
            "minItems": 4, "maxItems": 4
          },
          "correctAnswer": {"type": "string", "enum": ["A", "B", "C", "D"]},
          "explanation": {"type": "string"},
          "difficulty": {"type": "string", "enum": ["easy", "medium", "hard"]},
          "type": {"type": "string"},
          "source": {
            "type": "object",
            "properties": {
              "section": {"type": "string"},
              "page": {"type": "integer"}
            }
          }
        },
        "required": ["id", "bookId", "chapterId", "chapterTitle", "question", "options", "correctAnswer", "explanation", "difficulty", "type", "source"]
      }
    }
    
    Return ONLY valid JSON. Make sure to generate at least 15 questions if the content supports it.
    """
    
    MAX_RETRIES = 5
    for attempt in range(MAX_RETRIES):
        try:
            print(f"Generating content (Attempt {attempt + 1})...")
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=[uploaded_file, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            print("Generation complete.")
            break
        except Exception as e:
            print(f"Error during generation: {e}")
            if attempt < MAX_RETRIES - 1:
                print("Retrying in 60 seconds...")
                time.sleep(60)
            else:
                print("Max retries reached. Generation failed.")
                raise e
    
    try:
        data = json.loads(response.text)
        with open("../frontend/src/data/generated_questions.json", "w") as f:
            json.dump(data, f, indent=2)
        print(f"Saved {len(data)} questions to frontend/src/data/generated_questions.json")
    except Exception as e:
        print("Failed to parse JSON:", e)
        print(response.text)

if __name__ == "__main__":
    os.makedirs("../frontend/src/data", exist_ok=True)
    chunk_file = "temp_chunk.pdf"
    print("Extracting pages...")
    extract_chunk(PDF_PATH, chunk_file, START_PAGE, END_PAGE)
    generate_mcqs(chunk_file)
    print("Done!")
