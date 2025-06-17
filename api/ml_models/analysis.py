"""
Utility functions for low-level data analysis, such as IP lookups and
linguistic analysis.
"""
import requests
from textblob import TextBlob
from google.cloud import vision
from google.api_core import exceptions as gcp_exceptions


def get_ip_info(ip_address: str) -> dict:
    """
    Analyzes an IP address using ip-api.com.

    Returns a dictionary with info and a simple risk score based on whether
    the IP is a known proxy/VPN.

    Args:
        ip_address: The IP address to analyze.

    Returns:
        A dictionary containing the API response data and a proxy risk score.
    """
    try:
        response = requests.get(
            f"http://ip-api.com/json/{ip_address}?fields=status,proxy,query,country",
            timeout=5
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "success":
            # Penalize if it's a known proxy/VPN
            proxy_risk = 1.0 if data.get("proxy", False) else 0.0
            return {"data": data, "proxy_risk": proxy_risk}
    except requests.RequestException:
        # If the API call fails, assume a neutral-to-high risk
        pass
    return {"data": None, "proxy_risk": 0.5}


def analyze_review_text(text: str) -> float:
    """
    Analyzes review text for sentiment, subjectivity, and generic keywords.

    Args:
        text: The review text to analyze.

    Returns:
        A score from 0.0 (suspicious) to 1.0 (authentic).
    """
    if not text or len(text.split()) < 5:
        return 0.1  # Very short reviews are suspicious

    blob = TextBlob(text)

    # Generic/spammy keywords reduce the score
    spam_keywords = ["amazing product", "highly recommend", "buy now", "best ever"]
    spam_penalty = sum(1 for kw in spam_keywords if kw in text.lower()) * 0.1

    # Low subjectivity can indicate a generic/bot-like review
    subjectivity_score = blob.sentiment.subjectivity

    # Extreme sentiment is not penalized, but combined with subjectivity
    sentiment_score = abs(blob.sentiment.polarity)

    # A good review is subjective and not overly spammy.
    final_score = (subjectivity_score * 0.7 + (1 - sentiment_score) * 0.3) - spam_penalty
    return max(0, min(1, final_score))  # Clamp score between 0 and 1


def check_image_authenticity(image_url: str) -> float:
    """
    Uses Google Cloud Vision to check for web presence of an image.

    NOTE: Requires `GOOGLE_APPLICATION_CREDENTIALS` to be set.

    Args:
        image_url: The URL of the image to check.

    Returns:
        A score from 0.0 (likely stock/copied) to 1.0 (likely original).
    """
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image()
        image.source.image_uri = image_url

        response = client.annotate_image({
            'image': image,
            'features': [{'type': vision.Feature.Type.WEB_DETECTION}],
        })
        annotations = response.web_detection

        if annotations.pages_with_matching_images:
            # If the image is found on many other pages, it's a red flag.
            if len(annotations.pages_with_matching_images) > 3:
                return 0.1  # High confidence it's a common web image

        # Check for stock photo keywords in descriptions
        for entity in annotations.web_entities:
            stock_words = ["stock", "royalty-free", "illustration", "vector"]
            if any(stock_word in (entity.description or "").lower() for stock_word in stock_words):
                return 0.2  # High confidence it's a stock photo

        return 0.9  # Seems relatively unique
    except (gcp_exceptions.GoogleAPICallError, ValueError) as e:
        print(f"Warning: Vision API call failed for {image_url}. Error: {e}")
        return 0.5  # Neutral score if API fails
