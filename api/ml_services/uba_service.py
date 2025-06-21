"""
Service layer for calculating User Behavior & Anomaly (UBA) Score.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import logging
from sqlalchemy import distinct
from api.models import db, User, Review, UserSessionLog, Order, Return, OrderItem
from api.ml_services.analysis_utils import (
    validate_email_address,
    analyze_review_linguistics,
    get_ip_info,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    days_since_creation = (datetime.now(timezone.utc) - user.created_at).days
    age_score = 1 - (1 / (1 + days_since_creation * 0.1))
    email_risk = validate_email_address(user.email)["disposable_risk"]
    completeness_score = user.profile_completeness_score * (1 - email_risk)
    p1_score: float = age_score * completeness_score

    # --- P2: IP & Device Consistency (with Proxy Check) ---
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    unique_ips = [
        row[0]
        for row in db.session.query(distinct(UserSessionLog.ip_address))
        .filter(
            UserSessionLog.user_id == user_id,
            UserSessionLog.timestamp >= thirty_days_ago,
        )
        .all()
    ]
    if unique_ips:
        proxy_risks = [get_ip_info(ip)["proxy_risk"] for ip in unique_ips]
        avg_proxy_risk = sum(proxy_risks) / len(proxy_risks) if proxy_risks else 0
        ip_churn_risk = min(1.0, len(unique_ips) / 10.0)
        p2_score = 1 - max(avg_proxy_risk, ip_churn_risk)
    else:
        p2_score = 0.8

    # --- P3: Review Velocity & Distribution ---
    reviews_last_30d = Review.query.filter(
        Review.user_id == user_id, Review.created_at >= thirty_days_ago
    ).count()
    reviews_per_day = reviews_last_30d / 30.0
    p3_score = 1 - min(1.0, reviews_per_day / 5.0)

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
        p4_score = 0.8

    # --- P5: Purchase-Return Ratio (with Reason Weighting) ---
    # FIX: Changed to the .count() method for better readability and to fix Pylint error.
    total_items_count = (
        OrderItem.query.join(Order).filter(Order.user_id == user_id).count()
    )

    if total_items_count > 3:
        returns = (
            Return.query.join(OrderItem)
            .join(Order)
            .filter(Order.user_id == user_id)
            .all()
        )
        weighted_return_score = 0
        for r in returns:
            if r.reason_category in ["counterfeit", "fake", "not_as_described"]:
                weighted_return_score += 3.0
            else:
                weighted_return_score += 1.0
        return_risk = min(1.0, weighted_return_score / (total_items_count * 2.0))
        p5_score = 1 - return_risk
    else:
        p5_score = 1.0

    # --- Final Weighted Score ---
    final_uba = (
        p1_score * WEIGHTS["p1_age_completeness"]
        + p2_score * WEIGHTS["p2_ip_device"]
        + p3_score * WEIGHTS["p3_review_velocity"]
        + p4_score * WEIGHTS["p4_linguistic_auth"]
        + p5_score * WEIGHTS["p5_purchase_return"]
    )

    user.uba_score = final_uba
    user.last_uba_update = datetime.now(timezone.utc)
    logger.info("UBA score for user %d updated to: %.4f", user_id, final_uba)
    return final_uba
