
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import requests
from bs4 import BeautifulSoup
from langchain_ollama import OllamaLLM
from image import get_images_based_on_summary  # Import function from image.py

app = Flask(__name__)
CORS(app)  # Enable CORS

# Initialize the Ollama model and Pegasus model
llm = OllamaLLM(model="llama3.2")

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
    model_name = "google/pegasus-cnn_dailymail"
    tokenizer = PegasusTokenizer.from_pretrained(model_name)
    model = PegasusForConditionalGeneration.from_pretrained(model_name)

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

        # Generate video script based on the summary
        video_script = generate_video_script(summary)

        return jsonify({"summary": summary, "video_script": video_script})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to generate video script from summary using Ollama Llama 3.2
def generate_video_script(summary):
    prompt = f"Generate a professional video script based on the following summary: {summary}\nScript:"
    response = llm.invoke(prompt)
    return response

# New API endpoint to get images based on the summary
@app.route('/get-images', methods=['POST'])
def get_images():
    data = request.get_json()
    summary = data.get('summary')
    if not summary:
        return jsonify({"error": "Summary is required"}), 400

    try:
        images = get_images_based_on_summary(summary)  # Call function in image.py
        return jsonify({"images": images})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
