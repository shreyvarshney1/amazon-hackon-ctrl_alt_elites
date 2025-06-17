"""
Service layer for calculating User Behavior & Anomaly (UBA) Score. (Robust Version)
"""

from datetime import datetime, timedelta
from typing import Optional
import logging
from api.models import db, User, Review, UserSessionLog, Order, Return, OrderItem
from api.ml_services.analysis_utils import (
    get_ip_info,
    validate_email_address,
    analyze_review_linguistics,
)

logging.basicConfig(level=logging.INFO)

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

    # --- P1: Account Age & Completeness (with Email Validation) ---
    days_since_creation = (
        datetime.utcnow() - user.created_at.replace(tzinfo=None)
    ).days
    age_score = 1 - (1 / (1 + days_since_creation * 0.1))
    email_risk = validate_email_address(user.email)["disposable_risk"]
    # A user with a disposable email has their completeness score penalized
    completeness_score = user.profile_completeness_score * (1 - email_risk)
    p1_score: float = age_score * completeness_score  # Explicit type hint

    # --- P2: IP & Device Consistency (with Proxy Check) ---
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    unique_ips_query = (
        UserSessionLog.query.filter(
            UserSessionLog.user_id == user_id,
            UserSessionLog.timestamp >= thirty_days_ago,
        )
        .distinct(UserSessionLog.ip_address)
        .with_entities(UserSessionLog.ip_address)
    )
    unique_ips = [row.ip_address for row in unique_ips_query]
    if unique_ips:
        ip_info_cache = {}  # Cache for storing IP info results
        proxy_risks = []
        for ip in unique_ips:
            if ip not in ip_info_cache:
                ip_info_cache[ip] = get_ip_info(ip)  # Fetch and cache result
            proxy_risks.append(ip_info_cache[ip]["proxy_risk"])
        avg_proxy_risk = sum(proxy_risks) / len(proxy_risks) if proxy_risks else 0
        ip_churn_risk = min(
            1.0, len(unique_ips) / 10.0
        )  # 10 unique IPs in 30 days is max risk
        # The final risk is the higher of the churn or the average proxy risk.
        p2_score = 1 - max(avg_proxy_risk, ip_churn_risk)
    else:
        p2_score = 0.8  # Neutral score for new users with no session data

    # --- P3: Review Velocity & Distribution ---
    reviews_last_30d = Review.query.filter(
        Review.user_id == user_id, Review.created_at >= thirty_days_ago
    ).count()
    reviews_per_day = reviews_last_30d / 30.0
    p3_score = 1 - min(1.0, reviews_per_day / 5.0)  # >5 reviews/day is max risk

    # --- P4: Linguistic Authenticity (Average of recent reviews) ---
    recent_reviews = (
        Review.query.filter_by(user_id=user_id)
        .order_by(Review.created_at.desc())
        .limit(5)
        .all()
    )
    if recent_reviews:
        risks = [
            analyze_review_linguistics(r.review_text)["linguistic_risk"]
            for r in recent_reviews
        ]
        avg_linguistic_risk = sum(risks) / len(risks)
        p4_score = 1 - avg_linguistic_risk
    else:
        p4_score = 0.8  # Neutral score if no reviews

    # --- P5: Purchase-Return Ratio (with Reason Weighting) ---
    order_items_count = (
        db.session.query(OrderItem.id)
        .join(Order)
        .filter(Order.user_id == user_id)
        .count()
    )
    if order_items_count > 3:  # Only penalize after a few orders
        returns = Return.query.join(Order).filter(Order.user_id == user_id).all()
        weighted_return_score = 0
        for r in returns:
            # Penalize 'counterfeit' or 'fake' returns much more heavily
            if r.reason_category in ["counterfeit", "fake", "not_as_described"]:
                weighted_return_score += 3.0
            else:
                weighted_return_score += 1.0
        # A user returning integrity-related items is much riskier.
        return_risk = min(1.0, weighted_return_score / (order_items_count * 2.0))
        p5_score = 1 - return_risk
    else:
        p5_score = 1.0  # Perfect score if not enough order data

    # --- Final Weighted Score ---
    final_uba = (
        p1_score * WEIGHTS["p1_age_completeness"]
        + p2_score * WEIGHTS["p2_ip_device"]
        + p3_score * WEIGHTS["p3_review_velocity"]
        + p4_score * WEIGHTS["p4_linguistic_auth"]
        + p5_score * WEIGHTS["p5_purchase_return"]
    )

    user.uba_score = final_uba
    user.last_uba_update = datetime.utcnow()
    logging.info("UBA score for user %d updated to: %.2f", user_id, final_uba)
    return final_uba
