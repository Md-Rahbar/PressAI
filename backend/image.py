import requests
import re
import urllib.parse
from icrawler.builtin import GoogleImageCrawler
import spacy
import os

# Load the spaCy model for keyword extraction
nlp = spacy.load("en_core_web_sm")

def extract_keywords(summary):
    doc = nlp(summary)
    # Prioritize nouns, proper nouns, and adjectives for better relevance
    keywords = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN", "ADJ"]]
    return keywords

def _extractBingImages(html):
    pattern = r'mediaurl=(.*?)&amp;.*?expw=(\d+).*?exph=(\d+)'
    matches = re.findall(pattern, html)
    result = []

    for match in matches:
        url, width, height = match
        if url.endswith(('.jpg', '.png', '.jpeg')):  # Check for valid image formats
            result.append({'url': urllib.parse.unquote(url), 'width': int(width), 'height': int(height)})

    return result

# Function to get unique Bing images based on keywords
def getBingImages(query, limit=15, retries=5):
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
    }

    query = query.replace(" ", "+")
    images = []
    tries = 0
    all_images = []  # Collect all images for deduplication
    while len(images) < limit and tries < retries:
        response = requests.get(f"https://www.bing.com/images/search?q={query}&first={tries * 35 + 1}", headers=headers)  # Change the offset
        if response.status_code == 200:
            found_images = _extractBingImages(response.text)
            all_images.extend(found_images)  # Collect all found images
        else:
            raise Exception("Error while making Bing image searches")
        tries += 1

    # Deduplicate images by URL
    unique_images = {img['url']: img for img in all_images}.values()
    images = list(unique_images)[:limit]  # Limit to the specified number of unique images

    return images

def getGoogleImages(query, num_images=10):
    google_crawler = GoogleImageCrawler(storage={"root_dir": "images"})
    google_crawler.crawl(keyword=query, max_num=num_images)
    print("Google images saved in 'images' folder.")

def get_images_based_on_summary(summary, total_limit=15):
    keywords = extract_keywords(summary)
    query = " ".join(keywords)

    # Get images from Bing with uniqueness in mind
    bing_images = getBingImages(query, limit=total_limit)

    # Calculate remaining slots for Google images
    remaining_limit = total_limit - len(bing_images)
    google_images = []

    if remaining_limit > 0:
        # Fetch more results from Google to increase uniqueness
        getGoogleImages(query, num_images=min(remaining_limit, 10))
        # Load Google images from storage (this part can be adjusted based on your needs)
        google_images = [f"images/{image}" for image in os.listdir('images') if image.endswith(('.jpg', '.png', '.jpeg'))]
        google_images = list(set(google_images))  # Remove duplicates
        google_images = google_images[:remaining_limit]  # Limit to the remaining number of images

    return bing_images + google_images  # Combine Bing and Google images
