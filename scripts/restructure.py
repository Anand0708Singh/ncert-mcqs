import json
import os

INPUT_FILE = "../frontend/src/data/question_bank.json"
OUTPUT_FILE = "../frontend/src/data/question_bank.json"

def main():
    if not os.path.exists(INPUT_FILE):
        print("Input file not found.")
        return
        
    with open(INPUT_FILE, "r") as f:
        data = json.load(f)
        
    # Check if already restructured
    if isinstance(data, dict):
        print("Already restructured.")
        return
        
    structured = {
        "science_6_12": {
            "bookId": "science_6_12",
            "bookTitle": "General Science Class 6-12",
            "chapters": []
        }
    }
    
    # Group by chapterTitle
    chapters_map = {}
    
    for idx, q in enumerate(data):
        title = q.get("chapterTitle", "Unknown Chapter").strip()
        if not title:
            title = "Unknown Chapter"
            
        if title not in chapters_map:
            chapters_map[title] = {
                "chapterId": f"ch{len(chapters_map)+1}",
                "chapterTitle": title,
                "questions": []
            }
            
        # assign proper chapterId to question
        q["chapterId"] = chapters_map[title]["chapterId"]
        chapters_map[title]["questions"].append(q)
        
    for ch_title, ch_data in chapters_map.items():
        structured["science_6_12"]["chapters"].append(ch_data)
        
    with open(OUTPUT_FILE, "w") as f:
        json.dump(structured, f, indent=2)
        
    print(f"Restructured into {len(structured['science_6_12']['chapters'])} chapters.")

if __name__ == "__main__":
    main()
