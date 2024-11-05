from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import requests
from bs4 import BeautifulSoup
from langchain_ollama import OllamaLLM
from image import get_images_based_on_summary  # Import function from image.py
from video import generate_video  # Assuming you have a video.py for video generation
from gtts import gTTS
from googletrans import Translator
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# Initialize the models
llm = OllamaLLM(model="llama3.2")
model_name = "google/pegasus-cnn_dailymail"
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name)

# Function to extract text from URL
def extract_text_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join([para.get_text() for para in paragraphs])
        return text
    else:
        raise Exception("Failed to retrieve the article.")

# Function to summarize text
def summarize_text(text):
    inputs = tokenizer(text, truncation=True, padding="longest", return_tensors="pt")
    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=400,
        min_length=150,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

# API to summarize article and generate video script
@app.route('/summarize-and-generate-script', methods=['POST'])
def summarize_and_generate_script():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        text = extract_text_from_url(url)
        summary = summarize_text(text)
        video_script = generate_video_script(summary)

        return jsonify({"summary": summary, "video_script": video_script})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to generate video script from summary using Ollama Llama 3.2
def generate_video_script(summary, target_language='en'):
    prompt = f"Generate a professional video script based on the following summary: {summary}\nScript:"
    response = llm.invoke(prompt)
    translated_script = translate_text(response, target_language)
    return translated_script

# New API endpoint to get images based on the summary
@app.route('/get-images', methods=['POST'])
def get_images():
    data = request.get_json()
    summary = data.get('summary')
    if not summary:
        return jsonify({"error": "Summary is required"}), 400

    try:
        images = get_images_based_on_summary(summary)
        return jsonify({"images": images})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_narration(video_script, language='en'):
    narration_text = " ".join([scene['text'] for scene in video_script['scenes']])
    
    tts = gTTS(text=narration_text, lang=language)
    narration_path = 'narration.mp3'  # Customize the path as needed
    tts.save(narration_path)
    
    return narration_path

def translate_text(text, dest_language='en'):
    translator = Translator()
    translated = translator.translate(text, dest=dest_language)
    return translated.text

# New API endpoint for generating video
@app.route('/generate-video', methods=['POST'])
def generate_video_endpoint():
    data = request.get_json()
    video_script = data.get('video_script')
    images = data.get('images')

    if not video_script or not images:
        return jsonify({"error": "Video script and images are required"}), 400

    try:
        narration_path = generate_narration(video_script)
        video_path = generate_video(video_script, images, narration_path)
        return jsonify({"video_path": video_path, "narration_path": narration_path})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
