"""
Service layer for calculating User Behavior & Anomaly (UBA) Score.
"""

from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import distinct
from api.models import db, User, Review, UserSessionLog, Order, Return

# Weights from the presentation slide
WEIGHTS = {
    "p1_age_completeness": 0.15,
    "p2_ip_device": 0.20,
    "p3_review_velocity": 0.25,
    "p4_linguistic_auth": 0.30,
    "p5_purchase_return": 0.10,
}


def calculate_uba_score(user_id: int) -> Optional[float]:
    """Calculates and updates the User Behavior & Anomaly Score."""
    user = User.query.get(user_id)
    if not user:
        return None

    # P1: Account Age & Completeness
    days_since_creation = (
        datetime.utcnow() - user.created_at.replace(tzinfo=None)
    ).days
    norm_age = 1 - (1 / (1 + days_since_creation * 0.1))
    p1_score = norm_age * user.profile_completeness_score

    # P2: IP & Device Consistency (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    # REFACTORED: Use .count() on the query object for Pylint compatibility.
    unique_ips_count = (
        db.session.query(distinct(UserSessionLog.ip_address))
        .filter(
            UserSessionLog.user_id == user_id,
            UserSessionLog.timestamp >= thirty_days_ago,
        )
        .count()
    )
    max_expected_ips = 10  # Configurable threshold
    p2_score = 1 - min(unique_ips_count / max_expected_ips, 1.0)

    # P3: Review Velocity & Distribution (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    # REFACTORED: Use .count() on the query object.
    reviews_last_7d = (
        db.session.query(Review.id)
        .filter(Review.user_id == user_id, Review.created_at >= seven_days_ago)
        .count()
    )
    reviews_per_day = reviews_last_7d / 7.0
    high_velocity_threshold = 5.0  # Configurable: >5 reviews/day is suspicious
    p3_score = 1 - min(reviews_per_day / high_velocity_threshold, 1.0)

    # P4: Linguistic Authenticity (average of last 5 reviews)
    recent_reviews = (
        Review.query.filter_by(user_id=user_id)
        .order_by(Review.created_at.desc())
        .limit(5)
        .all()
    )
    if recent_reviews:
        auth_scores = [
            r.linguistic_authenticity_score
            for r in recent_reviews
            if r.linguistic_authenticity_score is not None
        ]
        p4_score = sum(auth_scores) / len(auth_scores) if auth_scores else 0.7
    else:
        p4_score = 1.0  # New user with no reviews is not penalized here

    # P5: Purchase-Return Ratio
    order_count = Order.query.filter_by(user_id=user_id).count()
    return_count = Return.query.join(Order).filter(Order.user_id == user_id).count()
    if order_count > 5:  # Only calculate for users with a meaningful number of orders
        return_rate = return_count / order_count
        max_acceptable_return_rate = 0.50  # Configurable: 50% return rate is high
        p5_score = 1 - min(return_rate / max_acceptable_return_rate, 1.0)
    else:
        p5_score = 1.0  # Not enough data, no penalty

    # Final Weighted Score
    final_uba = (
        p1_score * WEIGHTS["p1_age_completeness"]
        + p2_score * WEIGHTS["p2_ip_device"]
        + p3_score * WEIGHTS["p3_review_velocity"]
        + p4_score * WEIGHTS["p4_linguistic_auth"]
        + p5_score * WEIGHTS["p5_purchase_return"]
    )

    user.uba_score = final_uba
    user.last_uba_update = datetime.utcnow()
    db.session.commit()

    print(f"UBA score for user {user_id} updated to: {final_uba:.2f}")
    return final_uba
