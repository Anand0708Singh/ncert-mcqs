import os
import json
import time
import re
from PyPDF2 import PdfReader, PdfWriter
from google import genai
from google.genai import types

API_KEY = "AIzaSyCugvKffX4TzPmwKBMfuWxeboaDcWi7KXo"
PDF_PATH = "Arihant_NCERT_Notes_General_Science_Class_6_12_2nd_Revised_Edition.pdf"
CACHE_DIR = "scripts/cache"
OUTPUT_FILE = "frontend/src/data/question_bank.json"

# Process from page 15 (skip contents) to 115 (approx 100 pages for a massive test bank, usually covering Physics or Chemistry entirely)
# Processing 298 pages takes ~2 hours and might exhaust quotas, so 100 pages yields ~300-500 questions.
START_PAGE = 15
END_PAGE = 65
CHUNK_SIZE = 5

def extract_chunk(input_pdf, output_pdf, start, end):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()
    actual_end = min(end, len(reader.pages))
    for i in range(start, actual_end):
        writer.add_page(reader.pages[i])
    with open(output_pdf, "wb") as out:
        writer.write(out)
    return output_pdf

def get_client():
    return genai.Client(api_key=API_KEY)

def validate_mcq(q):
    required = ["id", "bookId", "chapterId", "chapterTitle", "question", "options", "correctAnswer", "explanation", "difficulty", "type", "source"]
    for r in required:
        if r not in q: return False
    if len(q["options"]) != 4: return False
    if q["correctAnswer"] not in ["A", "B", "C", "D"]: return False
    return True

def normalize_text(text):
    return re.sub(r'\s+', ' ', str(text).lower().strip())

def generate_mcqs_for_chunk(pdf_chunk_path, chunk_index):
    client = get_client()
    uploaded_file = client.files.upload(file=pdf_chunk_path)
    
    while True:
        file_info = client.files.get(name=uploaded_file.name)
        if file_info.state.name == "ACTIVE":
            break
        elif file_info.state.name == "FAILED":
            raise Exception("File processing failed")
        time.sleep(5)
        
    prompt = """
    You are an expert NCERT educational content processor.
    Read the provided scanned PDF pages carefully.
    Generate a JSON array of high-quality MCQs based ONLY on the content of these pages.
    Extract the chapter name based on the content.
    Each MCQ must follow this exact JSON schema:
    {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "bookId": {"type": "string"},
          "chapterId": {"type": "string"},
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
    
    Return ONLY valid JSON. Make sure to generate the maximum reasonable number of questions (aim for 15-25 if the content supports it).
    """
    
    MAX_RETRIES = 5
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=[uploaded_file, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            data = json.loads(response.text)
            valid_data = [q for q in data if validate_mcq(q)]
            
            # Ensure unique IDs for this chunk
            for i, q in enumerate(valid_data):
                q["id"] = f"SCI612-CH{chunk_index}-Q{i+1:04d}"
                q["bookId"] = "science_6_12"
            
            return valid_data
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                time.sleep(60)
            else:
                return []
    return []

def main():
    os.makedirs(CACHE_DIR, exist_ok=True)
    all_questions = []
    
    # Process in chunks
    chunk_idx = 1
    for start in range(START_PAGE, END_PAGE, CHUNK_SIZE):
        end = start + CHUNK_SIZE
        cache_file = os.path.join(CACHE_DIR, f"chunk_{start}_{end}.json")
        
        if os.path.exists(cache_file):
            print(f"Loading cached chunk {start}-{end}")
            with open(cache_file, "r") as f:
                questions = json.load(f)
                all_questions.extend(questions)
        else:
            print(f"Processing chunk {start}-{end}")
            chunk_pdf = os.path.join(CACHE_DIR, f"temp_{start}_{end}.pdf")
            extract_chunk(PDF_PATH, chunk_pdf, start, end)
            
            questions = generate_mcqs_for_chunk(chunk_pdf, chunk_idx)
            
            with open(cache_file, "w") as f:
                json.dump(questions, f)
            all_questions.extend(questions)
            
            # Cleanup temp pdf
            if os.path.exists(chunk_pdf):
                os.remove(chunk_pdf)
                
        chunk_idx += 1
        
    print(f"Generated {len(all_questions)} total questions.")
    
    # Deduplicate
    unique_questions = []
    seen_normalized = set()
    for q in all_questions:
        norm = normalize_text(q["question"])
        if norm not in seen_normalized:
            seen_normalized.add(norm)
            unique_questions.append(q)
            
    print(f"After deduplication: {len(unique_questions)} questions.")
    
    # Write to final JSON output
    with open(OUTPUT_FILE, "w") as f:
        json.dump(unique_questions, f, indent=2)
        
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
