"""
A utility module for advanced data analysis, using free, key-less APIs
and local libraries for intelligence gathering.
"""

from urllib.parse import urlparse
import requests
from textblob import TextBlob

# --- External API Functions (Key-less) ---


def get_ip_info(ip_address: str) -> dict:
    """
    Analyzes an IP address using the free, key-less ip-api.com to check for proxies/VPNs.
    Returns a dictionary with a risk score.
    """
    try:
        # This API is free and does not require an API key.
        response = requests.get(
            f"http://ip-api.com/json/{ip_address}?fields=status,proxy,query", timeout=3
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "success" and data.get("proxy", False):
            return {"proxy_risk": 1.0}  # High risk if it's a known proxy
    except requests.RequestException:
        # If the API call fails, assume a low risk rather than penalizing.
        return {"proxy_risk": 0.1}
    return {"proxy_risk": 0.0}  # No risk detected


def validate_email_address(email: str) -> dict:
    """
    Uses the free Debounce API to check for disposable email domains.
    This is completely free and requires no API key.
    API endpoint: https://disposable.debounce.io/
    Returns a dictionary with a risk score.
    """
    try:
        response = requests.get(
            f"https://disposable.debounce.io/?email={email}", timeout=3
        )
        response.raise_for_status()
        data = response.json()
        # The API returns the value as a string "true" or "false".
        if data.get("disposable") == "true":
            return {"disposable_risk": 1.0}  # Max risk for disposable email
    except requests.RequestException:
        # If the API fails, assume a low risk to avoid penalizing the user.
        return {"disposable_risk": 0.1}
    return {"disposable_risk": 0.0}  # No risk detected


# --- Internal Analysis Functions ---


def analyze_review_linguistics(text: str) -> dict:
    """
    Performs a more nuanced linguistic analysis of a review text.
    Returns a dictionary of risk factors.
    """
    if not text or len(text.split()) < 5:
        return {"linguistic_risk": 0.9, "reason": "Too short"}

    blob = TextBlob(text.lower())
    risk = 0.0

    # 1. Check for generic "spam" phrases
    spam_phrases = ["amazing product", "highly recommend", "must buy", "best ever"]
    if any(phrase in text for phrase in spam_phrases):
        risk += 0.4

    # 2. Check for extreme sentiment with low subjectivity (bot-like)
    if abs(blob.sentiment.polarity) > 0.8 and blob.sentiment.subjectivity < 0.3:
        risk += 0.5

    # 3. Check for excessive capitalization or punctuation
    if text.isupper() or text.count("!") > 5:
        risk += 0.3

    # 4. Low subjectivity can indicate a generic review
    if blob.sentiment.subjectivity < 0.2:
        risk += 0.2

    return {"linguistic_risk": min(1.0, risk)}


def analyze_product_description(text: str) -> dict:
    """
    Analyzes a product description for high-pressure tactics or vagueness.
    """
    risk = 0.0
    text_lower = text.lower()
    high_pressure_keywords = ["limited time", "hurry", "act now", "100% genuine"]
    if any(keyword in text_lower for keyword in high_pressure_keywords):
        risk += 0.6
    if len(text.split()) < 20:  # Overly simple description
        risk += 0.4

    return {"description_risk": min(1.0, risk)}


def analyze_image_authenticity_mock(image_urls: list) -> dict:
    """
    A more sophisticated mock for image analysis. Checks URL for stock photo site names.
    This is a local check and does not require an API.
    """
    if not image_urls:
        return {"image_risk": 1.0}

    stock_photo_domains = [
        "istockphoto",
        "shutterstock",
        "gettyimages",
        "pexels",
        "unsplash",
    ]
    for url in image_urls:
        try:
            domain = urlparse(url).netloc
            if any(stock_domain in domain for stock_domain in stock_photo_domains):
                return {"image_risk": 0.9, "reason": "Stock photo domain detected"}
        except Exception:
            # Ignore malformed URLs
            continue

    return {"image_risk": 0.1}  # Assume low risk if no stock domains found
