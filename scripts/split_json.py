import json
import os

INPUT_FILE = "frontend/src/data/question_bank.json"
OUTPUT_DIR = "frontend/public/question_bank"

def main():
    if not os.path.exists(INPUT_FILE):
        print("Input file not found.")
        return
        
    with open(INPUT_FILE, "r") as f:
        data = json.load(f)
        
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    metadata = {
        "version": "2026.1",
        "lastUpdated": "2026-09-22",
        "books": []
    }
    
    total_questions = 0
    
    for book_id, book_data in data.items():
        book_meta = {
            "bookId": book_data["bookId"],
            "bookTitle": book_data["bookTitle"],
            "chapters": []
        }
        
        for ch in book_data["chapters"]:
            ch_id = ch["chapterId"]
            ch_title = ch["chapterTitle"]
            questions = ch["questions"]
            
            book_meta["chapters"].append({
                "chapterId": ch_id,
                "chapterTitle": ch_title,
                "questionCount": len(questions)
            })
            
            ch_file = os.path.join(OUTPUT_DIR, f"{book_id}_{ch_id}.json")
            with open(ch_file, "w") as f:
                json.dump({"chapterId": ch_id, "chapterTitle": ch_title, "questions": questions}, f, indent=2)
                
            total_questions += len(questions)
            
        metadata["books"].append(book_meta)
        
    metadata["totalQuestions"] = total_questions
    
    with open(os.path.join(OUTPUT_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Successfully split into {total_questions} questions across {len(metadata['books'])} books.")

if __name__ == "__main__":
    main()
