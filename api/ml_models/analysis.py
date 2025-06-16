import requests
from textblob import TextBlob
from google.cloud import vision

# --- Configuration ---
# Ensure you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable
# export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/gcp_credentials.json"

def get_ip_info(ip_address):
    """
    Analyzes an IP address using ip-api.com.
    Returns a dictionary with info and a simple risk score.
    """
    try:
        response = requests.get(f"http://ip-api.com/json/{ip_address}?fields=status,proxy,query,country")
        data = response.json()
        if data.get("status") == "success":
            # Penalize if it's a known proxy/VPN
            proxy_risk = 1.0 if data.get("proxy", False) else 0.0
            return {"data": data, "proxy_risk": proxy_risk}
    except Exception:
        pass
    return {"data": None, "proxy_risk": 0.5} # Default risk if API fails

def analyze_review_text(text):
    """
    Analyzes review text for sentiment, subjectivity, and generic keywords.
    Returns a score from 0 (bad) to 1 (good).
    """
    if not text or len(text.split()) < 5:
        return 0.1 # Very short reviews are suspicious
    
    blob = TextBlob(text)
    
    # Generic/spammy keywords reduce the score
    spam_keywords = ["amazing product", "highly recommend", "buy now", "best ever"]
    spam_penalty = sum([1 for kw in spam_keywords if kw in text.lower()]) * 0.1
    
    # Low subjectivity can indicate a generic/bot-like review
    subjectivity_score = blob.sentiment.subjectivity
    
    # Extreme sentiment with low subjectivity is a red flag
    sentiment_score = abs(blob.sentiment.polarity)
    
    # Combine scores. A good review is subjective and not spammy.
    final_score = (subjectivity_score * 0.7 + (1 - sentiment_score) * 0.3) - spam_penalty
    return max(0, min(1, final_score)) # Clamp score between 0 and 1

def check_image_authenticity(image_url):
    """
    Uses Google Cloud Vision to check for web presence of an image.
    Returns a score from 0 (likely stock/copied) to 1 (likely original).
    """
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image()
        image.source.image_uri = image_url
        
        response = client.web_detection(image=image)
        annotations = response.web_detection
        
        if annotations.pages_with_matching_images:
            # If the image is found on many other pages, especially stock photo sites, it's a red flag.
            if len(annotations.pages_with_matching_images) > 3:
                return 0.1 # High confidence it's a common web image
        
        # Check for stock photo keywords in descriptions
        for entity in annotations.web_entities:
            if any(stock_word in entity.description.lower() for stock_word in ["stock", "royalty-free", "illustration"]):
                 return 0.2 # High confidence it's a stock photo

        return 0.9 # Seems relatively unique
    except Exception as e:
        print(f"Error in Vision API: {e}")
        return 0.5 # Neutral score if API fails
