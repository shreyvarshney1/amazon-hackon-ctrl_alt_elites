"""
Mock integration layer for AI/ML models.

This module simulates responses from LLM and CV models to allow the core
application logic to function without requiring live model endpoints. In a
production environment, these functions would make API calls to services like
Amazon SageMaker.
"""

import random
from typing import List, Dict

# Assuming a Review object has a 'review_text' attribute.
# A proper implementation would use a defined class.
from api.models import Review


def analyze_linguistic_authenticity(text: str) -> float:
    """
    Simulates an LLM analyzing text for authenticity.

    Args:
        text: The review text to analyze.

    Returns:
        A score from 0.0 (inauthentic) to 1.0 (authentic).
    """
    if not text or len(text.split()) < 5:
        return 0.1  # Penalize very short text
    # Simulate a score, perhaps based on length for this stub
    return min(1.0, 0.5 + len(text) / 500)


def analyze_content_originality(description: str) -> float:
    """
    Simulates an LLM checking for content originality and keyword stuffing.

    Args:
        description: The product description text.

    Returns:
        A score from 0.0 (copied/spammy) to 1.0 (original/rich).
    """
    if "100% genuine" in description.lower() or "limited time" in description.lower():
        return random.uniform(0.2, 0.4)  # Penalize spammy keywords
    return random.uniform(0.6, 0.95)


def analyze_image_authenticity(image_urls: List[str]) -> float:
    """
    Simulates a CV model checking if an image is a stock photo.

    Args:
        image_urls: A list of URLs for the product images.

    Returns:
        A score from 0.0 (likely stock) to 1.0 (likely original).
    """
    if not image_urls:
        return 0.1
    # In a real scenario, this would call a vision API. Here, we'll just
    # return a random high score.
    return random.uniform(0.7, 0.98)


def analyze_aggregated_reviews(reviews: List[Review]) -> Dict[str, int]:
    """
    Simulates an LLM analyzing a batch of reviews for common themes.

    Args:
        reviews: A list of Review objects.

    Returns:
        A dictionary with counts of positive and negative themes.
    """
    # Simulate finding themes like "fake", "counterfeit", "good communication", etc.
    positive_themes = sum(1 for r in reviews if r.rating > 3)
    negative_themes = len(reviews) - positive_themes
    return {"Positive_Themes": positive_themes, "Negative_Themes": negative_themes}
