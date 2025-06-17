"""
Service layer for calculating Seller Credibility Score (SCS).
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import func
from api.models import db, Seller, Product, Order, OrderItem, Review
from api.ml_integration import analyze_aggregated_reviews

# Weights from the presentation slide
WEIGHTS = {
    'p1_fulfillment': 0.25,
    'p2_history_velocity': 0.15,
    'p3_seller_reviews': 0.30,
    'p4_disputes': 0.20,
    'p5_avg_pis': 0.10,
}


def calculate_scs_score(seller_id: int) -> Optional[float]:
    """Calculates the Seller Credibility Score (SCS) for a single seller."""
    seller = Seller.query.get(seller_id)
    if not seller:
        print(f"SCS Error: Seller with ID {seller_id} not found.")
        return None

    # P1: Order Fulfillment Rate
    seller_products_subquery = db.session.query(Product.id)\
        .filter(Product.seller_id == seller_id).subquery()
    seller_orders_query = db.session.query(Order).join(OrderItem)\
        .filter(OrderItem.product_id.in_(seller_products_subquery))
    total_orders = seller_orders_query.count()
    if total_orders > 0:
        on_time_count = seller_orders_query.filter(
            Order.shipped_on_time).count()
        cancelled_count = seller_orders_query.filter(
            Order.status == 'cancelled').count()
        p1_score = (1 - (cancelled_count / total_orders)) * \
            (on_time_count / total_orders)
    else:
        p1_score = 0.7  # Neutral score for new sellers

    # P2: Seller History & Velocity
    days_as_seller = (datetime.utcnow() -
                      seller.created_at.replace(tzinfo=None)).days
    tenure_score = 1 - (1 / (1 + days_as_seller * 0.05))  # Normalized tenure
    # NOTE: Sales velocity is simplified to tenure for this example.
    p2_score = tenure_score

    # P3: Aggregated Seller-Specific Reviews (LLM)
    all_seller_reviews = db.session.query(Review).join(Product)\
        .filter(Product.seller_id == seller_id).all()
    if all_seller_reviews:
        themes = analyze_aggregated_reviews(all_seller_reviews)
        total_themes = themes['Positive_Themes'] + themes['Negative_Themes']
        p3_score = themes['Positive_Themes'] / \
            total_themes if total_themes > 0 else 0.5
    else:
        p3_score = 0.7  # Neutral score if no reviews yet

    # P4: Dispute & Chargeback Rate
    dispute_rate = 0.05  # Placeholder: 5% dispute rate from a payments system
    dispute_weight_factor = 5.0  # Amplify the impact of disputes
    p4_score = 1 - min(dispute_rate * dispute_weight_factor, 1.0)

    # P5: Average Product Integrity (Interlink)
    avg_pis = db.session.query(func.avg(Product.pis_score))\
        .filter(Product.seller_id == seller_id).scalar()
    p5_score = avg_pis if avg_pis is not None else 0.7

    # Final Weighted SCS Score
    final_scs = (
        p1_score * WEIGHTS['p1_fulfillment'] +
        p2_score * WEIGHTS['p2_history_velocity'] +
        p3_score * WEIGHTS['p3_seller_reviews'] +
        p4_score * WEIGHTS['p4_disputes'] +
        p5_score * WEIGHTS['p5_avg_pis']
    )

    seller.scs_score = final_scs
    seller.last_scs_update = datetime.utcnow()
    # db.session.commit() is handled by the calling function to ensure atomicity
    print(f"SCS score for seller {seller_id} updated to: {final_scs:.2f}")
    return final_scs
