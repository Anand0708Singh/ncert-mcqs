import pymupdf
import sys

def extract_pdf_info(pdf_path):
    try:
        doc = pymupdf.open(pdf_path)
        with open("extract_info_pages_30_40.txt", "w", encoding="utf-8") as f:
            for i in range(30, min(40, len(doc))):
                page = doc.load_page(i)
                f.write(f"Page {i+1}:\n\n")
                f.write(page.get_text())
                f.write("\n" + "-" * 40 + "\n")
                
        doc.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    extract_pdf_info("Arihant_NCERT_Notes_General_Science_Class_6_12_2nd_Revised_Edition.pdf")
