"""
Fraud and Risk Analysis Toolkit

This module provides a set of functions to assess various risk factors associated
with e-commerce data points like user reviews, product details, and user information.
It leverages external APIs for IP/email validation and internal heuristics for
linguistic and content analysis.

Functions:
- get_ip_info: Checks an IP for proxy/VPN usage via proxycheck.io.
- validate_email_address: Checks an email for being disposable via proxycheck.io.
- analyze_review_linguistics: Analyzes review text for suspicious patterns.
- analyze_product_description: Analyzes product descriptions for red flags.
- analyze_image_authenticity: Checks image URLs for common stock photo domains.
"""

import logging
import os
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import requests
from textblob import TextBlob

# --- Setup ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# --- Constants ---

# API Configuration
IP_API_URL = "https://proxycheck.io/v2/"
API_KEY = os.getenv("PROXYCHECK_API_KEY")
REQUEST_TIMEOUT = 3.0  # seconds

# Risk Score Constants
DEFAULT_API_ERROR_RISK = 0.1
HIGH_RISK = 0.9
LOW_RISK = 0.1

# Linguistic Analysis Constants
MIN_REVIEW_WORDS = 5
MAX_EXCLAMATION_MARKS = 5
HIGH_POLARITY_THRESHOLD = 0.8
LOW_SUBJECTIVITY_THRESHOLD = 0.3
VERY_LOW_SUBJECTIVITY_THRESHOLD = 0.2
SPAM_PHRASE_RISK = 0.4
EXTREME_SENTIMENT_RISK = 0.5
ALL_CAPS_RISK = 0.3
VAGUE_TEXT_RISK = 0.2

# Product Description Constants
MIN_DESCRIPTION_WORDS = 20
HIGH_PRESSURE_TACTIC_RISK = 0.6
SHORT_DESCRIPTION_RISK = 0.4

# Content Lists
SPAM_PHRASES = ["amazing product", "highly recommend", "must buy", "best ever"]
HIGH_PRESSURE_KEYWORDS = ["limited time", "hurry", "act now", "100% genuine"]
STOCK_PHOTO_DOMAINS = [
    "istockphoto",
    "shutterstock",
    "gettyimages",
    "pexels",
    "unsplash",
]


# --- Helper Functions ---


def _safe_get(
    url: str, params: Optional[Dict[str, Any]] = None, timeout: float = REQUEST_TIMEOUT
) -> Optional[Dict]:
    """
    Perform a GET request and return JSON if successful, otherwise None.

    Args:
        url: The URL to send the GET request to.
        params: Optional dictionary of URL parameters.
        timeout: Request timeout in seconds.

    Returns:
        A dictionary parsed from the JSON response, or None on failure.
    """
    try:
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.warning("Request to %s failed: %s", url, e)
    return None


def _get_proxycheck_params() -> Dict[str, Any]:
    """
    Construct the base parameter dictionary for a proxycheck.io API call.
    """
    params: Dict[str, Any] = {"risk": 1}
    if API_KEY:
        params["key"] = API_KEY
    return params


# --- Core Analysis Functions ---


def get_ip_info(ip_address: str) -> Dict[str, float]:
    """
    Check an IP address for proxy/VPN risk using proxycheck.io.

    Args:
        ip_address: The IP address to check.

    Returns:
        A dictionary with the proxy risk score: {'proxy_risk': 0.0-1.0}.
        Returns a default low risk score on API error.
    """
    params = _get_proxycheck_params()
    params["vpn"] = 1  # Specifically request VPN check
    url = f"{IP_API_URL}{ip_address}"

    data = _safe_get(url, params=params)
    if not data or data.get("status") != "ok":
        return {"proxy_risk": DEFAULT_API_ERROR_RISK}

    record = data.get(ip_address, {})
    try:
        # The 'risk' score from the API is 0-100.
        risk_score = float(record.get("risk", 0)) / 100.0
    except (TypeError, ValueError):
        risk_score = 0.0

    # Clamp the value between 0.0 and 1.0
    final_risk = min(max(risk_score, 0.0), 1.0)
    return {"proxy_risk": round(final_risk, 2)}


def validate_email_address(email: str) -> Dict[str, float]:
    """
    Check if an email is disposable or risky using proxycheck.io.

    Args:
        email: The email address to validate.

    Returns:
        A dictionary with the disposable risk score:
        {'disposable_risk': 1.0} for disposable, 0.0 otherwise.
        Returns a default low risk score on API error.
    """
    params = _get_proxycheck_params()
    url = f"{IP_API_URL}{email}"

    data = _safe_get(url, params=params)
    if not data or data.get("status") != "ok":
        return {"disposable_risk": DEFAULT_API_ERROR_RISK}

    record = data.get(email, {})
    disposable_status = record.get("disposable", "no")

    if isinstance(disposable_status, str) and disposable_status.lower() == "yes":
        return {"disposable_risk": 1.0}

    return {"disposable_risk": 0.0}


def analyze_review_linguistics(text: str) -> Dict[str, float]:
    """
    Perform linguistic analysis of a review for signs of being fake or low-quality.

    Args:
        text: The review text to analyze.

    Returns:
        A dictionary with the linguistic risk score: {'linguistic_risk': 0.0-1.0}.
    """
    if not text or len(text.split()) < MIN_REVIEW_WORDS:
        return {"linguistic_risk": HIGH_RISK}

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    risk = 0.0
    text_lower = text.lower()

    # Risk for containing generic, spammy phrases
    if any(phrase in text_lower for phrase in SPAM_PHRASES):
        risk += SPAM_PHRASE_RISK

    # Risk for extreme sentiment (e.g., "10/10 best") with low subjectivity
    if (
        abs(polarity) > HIGH_POLARITY_THRESHOLD
        and subjectivity < LOW_SUBJECTIVITY_THRESHOLD
    ):
        risk += EXTREME_SENTIMENT_RISK

    # Risk for "shouting" (all caps) or excessive exclamation marks
    if text.isupper() or text.count("!") > MAX_EXCLAMATION_MARKS:
        risk += ALL_CAPS_RISK

    # Risk for being overly objective or vague (low subjectivity)
    if subjectivity < VERY_LOW_SUBJECTIVITY_THRESHOLD:
        risk += VAGUE_TEXT_RISK

    return {"linguistic_risk": round(min(risk, 1.0), 2)}


def analyze_product_description(text: str) -> Dict[str, float]:
    """
    Analyze product description for high-pressure sales tactics or vagueness.

    Args:
        text: The product description text.

    Returns:
        A dictionary with the description risk score: {'description_risk': 0.0-1.0}.
    """
    if not text:
        return {"description_risk": 1.0}

    risk = 0.0
    text_lower = text.lower()

    # Risk for high-pressure sales tactics
    if any(kw in text_lower for kw in HIGH_PRESSURE_KEYWORDS):
        risk += HIGH_PRESSURE_TACTIC_RISK

    # Risk for being too short or vague
    if len(text.split()) < MIN_DESCRIPTION_WORDS:
        risk += SHORT_DESCRIPTION_RISK

    return {"description_risk": round(min(risk, 1.0), 2)}


def analyze_image_authenticity(image_urls: List[str]) -> Dict[str, float]:
    """
    Heuristic check for stock photo usage by inspecting image URL domains.

    Args:
        image_urls: A list of strings, where each is an image URL.

    Returns:
        A dictionary with the image risk score: {'image_risk': 0.0-1.0}.
    """
    if not image_urls:
        return {"image_risk": 1.0}  # No images is a high risk

    for url in image_urls:
        try:
            domain = urlparse(url).netloc.lower()
            if any(sd in domain for sd in STOCK_PHOTO_DOMAINS):
                return {"image_risk": HIGH_RISK}  # Found a stock photo domain
        except (ValueError, AttributeError) as e:
            logger.warning("Could not parse image URL '%s': %s", url, e)
            continue  # Skip malformed URLs

    return {"image_risk": LOW_RISK}  # No stock domains found


def run_examples():
    """Runs a set of example analyses and prints the results."""
    print("--- Risk Analysis Examples ---")

    # IP Check (Example IP, may or may not be a proxy)
    ip_to_check = "8.8.8.8"
    print(f"IP Info for {ip_to_check}: {get_ip_info(ip_to_check)}")

    # Email Check
    disposable_email = "test@10minutemail.com"
    legit_email = "contact@google.com"
    print(
        f"Email check for {disposable_email}: {validate_email_address(disposable_email)}"
    )
    print(f"Email check for {legit_email}: {validate_email_address(legit_email)}")

    # Linguistic Analysis
    spammy_review = "MUST BUY this amazing product it is the best ever!!!!!!"
    # FIX: Broke the long line into a multi-line string
    good_review = (
        "I found the setup a bit tricky, but after a few minutes, it worked well. "
        "The battery life is decent."
    )
    print(f"Spammy Review Risk: {analyze_review_linguistics(spammy_review)}")
    print(f"Good Review Risk: {analyze_review_linguistics(good_review)}")

    # Product Description Analysis
    risky_desc = "HURRY! Limited time offer on this 100% genuine item. Act now!"
    print(f"Risky Description Risk: {analyze_product_description(risky_desc)}")

    # Image Authenticity Analysis
    stock_images = ["https://www.shutterstock.com/image-12345.jpg"]
    real_images = ["https://example.com/my-product-images/photo1.png"]
    print(f"Stock Images Risk: {analyze_image_authenticity(stock_images)}")
    print(f"Real Images Risk: {analyze_image_authenticity(real_images)}")


if __name__ == "__main__":
    run_examples()
