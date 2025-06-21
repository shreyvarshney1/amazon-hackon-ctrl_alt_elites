"""
Service layer for calculating Seller Credibility Score (SCS).
"""

from datetime import datetime, timedelta, timezone  # <-- Import timezone
from typing import Optional
from sqlalchemy import func
from api.models import db, Seller, Product, OrderItem, Review, Order

WEIGHTS = {
    "p1_fulfillment": 0.25,
    "p2_history_velocity": 0.15,
    "p3_seller_reviews": 0.30,
    "p4_disputes": 0.20,
    "p5_avg_pis": 0.10,
}


def calculate_scs_score(seller_id: int) -> Optional[float]:
    """Calculates the Seller Credibility Score (SCS) for a single seller."""
    seller = Seller.query.get(seller_id)
    if not seller:
        return None

    order_items_query = OrderItem.query.join(Product).filter(
        Product.seller_id == seller_id
    )

    # --- P1: Order Fulfillment Rate ---
    total_items = order_items_query.count()
    if total_items > 3:
        on_time_count = order_items_query.filter(
            OrderItem.delivered_on_time is True
        ).count()
        cancelled_by_seller_count = order_items_query.filter(
            OrderItem.cancelled_by_seller is True
        ).count()

        on_time_rate = on_time_count / total_items if total_items > 0 else 1.0
        cancellation_rate = (
            cancelled_by_seller_count / total_items if total_items > 0 else 0.0
        )

        p1_score = (1 - cancellation_rate) * on_time_rate
    else:
        p1_score = 0.7

    # --- P2: Seller History & Sales Velocity Anomaly ---
    # FIX: Use timezone-aware datetime for calculation
    days_as_seller = (datetime.now(timezone.utc) - seller.created_at).days
    tenure_score = 1 - (1 / (1 + days_as_seller * 0.05))

    # FIX: Use timezone-aware datetime for calculation
    now = datetime.now(timezone.utc)
    sales_last_30d = order_items_query.filter(
        OrderItem.order.has(Order.created_at >= now - timedelta(days=30))
    ).count()
    sales_prev_90d = order_items_query.filter(
        OrderItem.order.has(
            Order.created_at.between(
                now - timedelta(days=120), now - timedelta(days=30)
            )
        )
    ).count()

    avg_monthly_sales_prev = sales_prev_90d / 3.0
    velocity_risk = 0.0
    if avg_monthly_sales_prev > 5:
        spike_ratio = (
            sales_last_30d / avg_monthly_sales_prev
            if avg_monthly_sales_prev > 0
            else 999
        )
        if spike_ratio > 4.0:  # A >4x spike is a red flag
            velocity_risk = min(1.0, (spike_ratio - 4.0) / 10.0)

    velocity_score = 1 - velocity_risk
    p2_score = (tenure_score * 0.6) + (velocity_score * 0.4)

    # --- P3: Aggregated Seller-Specific Reviews (UBA-Weighted) ---
    all_seller_reviews = (
        Review.query.join(Product)
        .filter(Product.seller_id == seller_id)
        .options(db.joinedload(Review.user))
        .all()
    )
    if all_seller_reviews:
        weighted_score_sum = 0
        total_weight = 0
        for review in all_seller_reviews:
            uba_weight = review.user.uba_score or 0.7
            weighted_score_sum += review.rating * uba_weight
            total_weight += uba_weight
        p3_score = (
            (weighted_score_sum / total_weight) / 5.0 if total_weight > 0 else 0.5
        )
    else:
        p3_score = 0.7

    # --- P4: Dispute & Chargeback Rate ---
    dispute_rate = seller.dispute_rate or 0.0
    p4_score = 1 - min(dispute_rate * 5.0, 1.0)  # Amplify impact

    # --- P5: Average Product Integrity (Critical Interlink) ---
    avg_pis = (
        db.session.query(func.avg(Product.pis_score))
        .filter(Product.seller_id == seller_id, Product.pis_score.isnot(None))
        .scalar()
    )
    p5_score = avg_pis if avg_pis is not None else 0.7

    # --- Final Weighted SCS Score ---
    final_scs = (
        p1_score * WEIGHTS["p1_fulfillment"]
        + p2_score * WEIGHTS["p2_history_velocity"]
        + p3_score * WEIGHTS["p3_seller_reviews"]
        + p4_score * WEIGHTS["p4_disputes"]
        + p5_score * WEIGHTS["p5_avg_pis"]
    )

    seller.scs_score = final_scs
    # FIX: Use timezone-aware datetime for update
    seller.last_scs_update = datetime.now(timezone.utc)
    return final_scs
