"""
Service layer for calculating Product Integrity Score (PIS) and cascading
updates to the Seller Credibility Score (SCS). (Robust Version)
"""

from datetime import datetime
from typing import Optional
from api.models import db, Product, Review, Return, OrderItem, User
from api.ml_services.analysis_utils import (
    analyze_product_description,
    analyze_image_authenticity_mock,
)

# Important: Import scs_service to trigger the cascade
from api.ml_services import scs_service

WEIGHTS = {
    "p1_content_originality": 0.30,
    "p2_price_deviation": 0.20,
    "p3_image_authenticity": 0.10,
    "p4_review_sentiment": 0.30,
    "p5_return_analysis": 0.10,
}


def _calculate_pis_score(product_id: int) -> Optional[float]:
    """Internal function to calculate the PIS score for a single product."""
    product = Product.query.get(product_id)
    if not product:
        return None

    # --- P1: Content Originality & Richness ---
    description_risk = analyze_product_description(product.description)[
        "description_risk"
    ]
    p1_score = 1 - description_risk

    # --- P2: Price Point Deviation (using Median for robustness) ---
    prices = (
        db.session.query(Product.price)
        .filter(Product.category == product.category, Product.id != product.id)
        .all()
    )
    if prices:
        price_list = sorted([p[0] for p in prices])
        median_price = price_list[len(price_list) // 2]
        deviation = (
            abs(product.price - median_price) / median_price if median_price > 0 else 0
        )
        p2_score = 1 - min(deviation, 1.0)
    else:
        p2_score = 0.75  # Neutral score if no comparable products

    # --- P3: Image Authenticity ---
    image_risk = analyze_image_authenticity_mock(product.image_urls)["image_risk"]
    p3_score = 1 - image_risk

    # --- P4: Aggregated Review Sentiment (CRITICAL: Weighted by User UBA Score) ---
    reviews = Review.query.filter_by(product_id=product_id).join(User).all()
    if reviews:
        weighted_score_sum = 0
        total_weight = 0
        for review in reviews:
            # A trusted user's review has more weight. A suspicious user's review is down-weighted.
            # Squaring the UBA gives more power to trusted users (0.9^2=0.81) vs bots (0.2^2=0.04).
            uba_weight = (review.author.uba_score or 0.7) ** 2
            # Normalize rating from [1, 5] to [-1, 1] for a signed score
            normalized_rating = (review.rating - 3) / 2.0
            weighted_score_sum += normalized_rating * uba_weight
            total_weight += uba_weight
        # Final score is a weighted average, normalized back to [0, 1]
        p4_score = (
            (weighted_score_sum / total_weight + 1) / 2 if total_weight > 0 else 0.5
        )
    else:
        p4_score = 0.7  # Neutral score for new products with no reviews

    # --- P5: Return Reason Analysis (Categorized) ---
    items_sold_count = OrderItem.query.filter(
        OrderItem.product_id == product_id
    ).count()
    if items_sold_count > 0:
        integrity_returns = (
            Return.query.join(OrderItem)
            .filter(OrderItem.product_id == product_id)
            .filter(
                Return.reason_category.in_(["counterfeit", "fake", "not_as_described"])
            )
            .count()
        )
        rate_of_integrity_returns = integrity_returns / items_sold_count
        # Penalize heavily for even a small rate of integrity-related returns
        p5_score = 1 - min(rate_of_integrity_returns * 5.0, 1.0)
    else:
        p5_score = 1.0  # Perfect score if no items sold/returned

    # --- Final Weighted Score ---
    final_pis = (
        p1_score * WEIGHTS["p1_content_originality"]
        + p2_score * WEIGHTS["p2_price_deviation"]
        + p3_score * WEIGHTS["p3_image_authenticity"]
        + p4_score * WEIGHTS["p4_review_sentiment"]
        + p5_score * WEIGHTS["p5_return_analysis"]
    )

    product.pis_score = final_pis
    product.last_pis_update = datetime.utcnow()
    print(f"PIS score for product {product_id} calculated as: {final_pis:.2f}")
    return final_pis


def recalculate_pis_and_cascade_scs(product_id: int):
    """
    A transactional function that updates a product's PIS and then triggers
    an SCS update for the corresponding seller. The calling route is responsible
    for committing the database session.
    """
    product = Product.query.get(product_id)
    if not product:
        return

    # Step 1: Recalculate the PIS for this product
    _calculate_pis_score(product_id)

    # Step 2: Cascade the change by recalculating the SCS for the seller
    scs_service.calculate_scs_score(product.seller_id)

    print(
        f"--- Event Cascade Complete for Product {product_id} -> Seller {product.seller_id} ---"
    )
