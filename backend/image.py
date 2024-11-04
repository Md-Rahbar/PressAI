
import requests
import re
import urllib.parse
from icrawler.builtin import GoogleImageCrawler
import spacy

# Load the spaCy model for keyword extraction
nlp = spacy.load("en_core_web_sm")

def extract_keywords(summary):
    doc = nlp(summary)
    keywords = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN", "ADJ"]]
    return keywords

def _extractBingImages(html):
    pattern = r'mediaurl=(.*?)&amp;.*?expw=(\d+).*?exph=(\d+)'
    matches = re.findall(pattern, html)
    result = []

    for match in matches:
        url, width, height = match
        if url.endswith('.jpg') or url.endswith('.png') or url.endswith('.jpeg'):
            result.append({'url': urllib.parse.unquote(url), 'width': int(width), 'height': int(height)})

    return result

# Function to get Bing images based on keywords
def getBingImages(query, retries=5):
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
    }

    query = query.replace(" ", "+")
    images = []
    tries = 0
    while len(images) == 0 and tries < retries:
        response = requests.get(f"https://www.bing.com/images/search?q={query}&first=1", headers=headers)
        if response.status_code == 200:
            images = _extractBingImages(response.text)
        else:
            raise Exception("Error while making Bing image searches")
        tries += 1

    return images

def getGoogleImages(query, num_images=10):
    google_crawler = GoogleImageCrawler(storage={"root_dir": "images"})
    google_crawler.crawl(keyword=query, max_num=num_images)
    print("Google images saved in 'images' folder.")

def get_images_based_on_summary(summary):
    keywords = extract_keywords(summary)
    query = " ".join(keywords)
    bing_images = getBingImages(query)
    return bing_images  # Return only Bing images; Google images can be fetched similarly if needed.
