"""
Service layer for calculating Product Integrity Score (PIS) and cascading
updates to the Seller Credibility Score (SCS).
"""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import func
from api.models import db, Product, Review, Return, OrderItem
from api.ml_services.analysis_utils import (
    analyze_product_description,
    analyze_image_authenticity,
)
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

    # --- P2: Price Point Deviation ---
    avg_price_result = (
        db.session.query(func.avg(Product.price))
        .filter(Product.category == product.category, Product.id != product.id)
        .scalar()
    )

    if avg_price_result:
        avg_category_price = float(avg_price_result)
        deviation = abs(product.price - avg_category_price) / avg_category_price
        p2_score = 1 - min(deviation, 1.0)
    else:
        p2_score = 0.75

    # --- P3: Image Authenticity ---
    image_risk = analyze_image_authenticity(product.image_urls or [])["image_risk"]
    p3_score = 1 - image_risk

    # --- P4: Aggregated Review Sentiment (Weighted by User UBA Score) ---
    reviews = (
        Review.query.filter_by(product_id=product_id)
        .options(db.joinedload(Review.user))
        .all()
    )
    if reviews:
        weighted_score_sum = 0
        total_weight = 0
        for review in reviews:
            uba_weight = review.user.uba_score or 0.7
            weighted_score_sum += review.rating * uba_weight
            total_weight += uba_weight
        p4_score = (
            (weighted_score_sum / total_weight) / 5.0 if total_weight > 0 else 0.5
        )
    else:
        p4_score = 0.7

    # --- P5: Return Reason Analysis ---
    # FIX: Changed to the .count() method.
    items_sold_count = OrderItem.query.filter_by(product_id=product_id).count()
    if items_sold_count > 0:
        # FIX: Changed to the .count() method.
        integrity_returns = (
            Return.query.join(OrderItem)
            .filter(
                OrderItem.product_id == product_id,
                Return.reason_category.in_(["counterfeit", "fake", "not_as_described"]),
            )
            .count()
        )
        rate_of_integrity_returns = integrity_returns / items_sold_count
        p5_score = 1 - min(rate_of_integrity_returns * 5.0, 1.0)
    else:
        p5_score = 1.0

    # --- Final Weighted Score ---
    final_pis = (
        p1_score * WEIGHTS["p1_content_originality"]
        + p2_score * WEIGHTS["p2_price_deviation"]
        + p3_score * WEIGHTS["p3_image_authenticity"]
        + p4_score * WEIGHTS["p4_review_sentiment"]
        + p5_score * WEIGHTS["p5_return_analysis"]
    )

    product.pis_score = final_pis
    product.last_pis_update = datetime.now(timezone.utc)
    return final_pis


def recalculate_pis_and_cascade_scs(product_id: int):
    """
    A transactional function that updates a product's PIS and then triggers
    an SCS update for the corresponding seller.
    """
    product = Product.query.get(product_id)
    if not product:
        return

    _calculate_pis_score(product_id)
    scs_service.calculate_scs_score(product.seller_id)
