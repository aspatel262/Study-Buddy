import google.generativeai as genai
import os
import fitz  # pip install --upgrade pip; pip install --upgrade pymupdf
from tqdm import tqdm # pip install tqdm
from pypdf import PdfReader
import glob
import random
import PIL.Image
import json


os.environ["GOOGLE_API_KEY"] = 'AIzaSyA4U95OPm8gMXZ63Q63xjZCAydnb9mE0Tg'
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

workdir = "."
combined_text_cur = ""

def generate_quiz(topic, num_questions):
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    promptQuiz  = f"I am having trouble understanding {topic}. Here are the lecture information associated with it. Can you make a multiple choice quiz (A,B,C,D) with {num_questions} questions based on the content provided, and give me the answers? Return output in json format of a list of question, options, and answer."

    # Assuming the model returns JSON structured data
    response = model.generate_content([promptQuiz, combined_text_cur])

    with open('./quiz.json', 'w') as f:
            f.write(response.text)
    with open('./quiz.json', 'r+') as f:
        lines = f.readlines()
        f.seek(0)
        f.truncate()
        f.writelines(lines[1:-1])

def converter(files, topic, app):
    os.environ["GOOGLE_API_KEY"] = 'AIzaSyA4U95OPm8gMXZ63Q63xjZCAydnb9mE0Tg'
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    
    # Initialize the content variable
    combined_text = ""
    # Read the content of each file and concatenate
    for file in files:
        print("         Processing ", file.filename, "...")
        if file:
            file_extension = os.path.splitext(file.filename)[1]
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{os.path.splitext(file.filename)[0]}_{os.urandom(4).hex()}{file_extension}")
            file.save(file_path)
            text = extract_text(file_path)  # Extract text for each file
            combined_text += f"\n---\n{text}"

    promptsum = """I am having trouble understanding """ + topic +  """. Here is the lecture information associated with it.
    As a professor focusing on that field, can you summarize that for me? Break it down into each smaller concept, the more specific and brief the better. 
    For any image descriptions, rather than just summarizing the description, summarize the concept they describe.
    Return output in json format without nesting."""
    
    inputsum = [promptsum, combined_text]
    combined_text_cur = combined_text

    response_summary = model.generate_content(inputsum)
    with open('./summary.json', 'w') as f:
            f.write(response_summary.text)
    with open('./summary.json', 'r+') as f:
            lines = f.readlines()
            f.seek(0)
            f.truncate()
            f.writelines(lines[1:-1])
    
    
# Converter Helpers
def extract_text(file_path):
    text = ""
    if file_path.lower().endswith(".pdf"):
        text = read_pdf_content(file_path)
    elif file_path.lower().endswith(".txt"):
        text = read_text_content(file_path)
    elif file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
        text = read_image_content(file_path)
    return text

def read_pdf_content(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def read_text_content(file_path):
    text = ""
    with open(file_path, 'r') as file:
        text = file.read()
    return text

def read_image_content(file_path):
    prompt = "Describe this image/diagram in words: "
    sample_file = genai.upload_file(path=file_path, display_name="currImg")
    model = genai.GenerativeModel(model_name="models/gemini-1.5-pro-latest")
    response = model.generate_content([prompt, sample_file])
    text = response
    genai.delete_file(sample_file.name)
    return text
    
def cleaner():
    json_files = glob.glob(os.path.join('./', '*.json'))
    for file_path in json_files:
        os.remove(file_path)
