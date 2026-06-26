import os
from pypdf import PdfReader
from docx import Document

def parse_txt(file_path):
    """
    Parses a plain text file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        with open(file_path, 'r', encoding='latin-1') as f:
            return f.read()

def parse_pdf(file_path):
    """
    Parses a PDF file using pypdf.
    """
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        text = f"[Error parsing PDF: {str(e)}]"
    return text

def parse_docx(file_path):
    """
    Parses a DOCX file using python-docx.
    """
    text = ""
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            if para.text:
                text += para.text + "\n"
    except Exception as e:
        print(f"Error parsing DOCX: {e}")
        text = f"[Error parsing DOCX: {str(e)}]"
    return text

def extract_text_from_file(file_path, file_type):
    """
    Main entry point for extracting text.
    """
    if not os.path.exists(file_path):
        return ""
    
    file_type = file_type.lower().strip('.')
    if file_type == 'txt':
        return parse_txt(file_path)
    elif file_type == 'pdf':
        return parse_pdf(file_path)
    elif file_type in ['docx', 'doc']:
        return parse_docx(file_path)
    else:
        return ""
